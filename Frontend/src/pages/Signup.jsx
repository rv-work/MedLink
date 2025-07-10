import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Heart,
  Activity,
  Droplet,
  Pill,
  AlertTriangle,
  FileText,
  ChevronRight,
  Stethoscope,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as faceapi from "face-api.js";

const MedicalSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [videoRef, setVideoRef] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [canvasRef, setCanvasRef] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceCaptureLoading, setFaceCaptureLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dob: "",

    weight: "",
    height: "",
    bmi: "",
    bloodGroup: "",

    allergies: "",
    chronicConditions: "",
    medications: "",
    surgeries: "",
    familyHistory: "",

    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    bloodSugar: "",
    cholesterol: "",
    heartRate: "",

    smokingStatus: "",
    alcoholConsumption: "",
    exerciseFrequency: "",
    dietType: "",
    sleepDuration: "",

    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  const { setIsLoggedIn } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "weight" || name === "height") {
        const weight = name === "weight" ? value : prev.weight;
        const height = name === "height" ? value : prev.height;
        if (weight && height) {
          const heightInM = height / 100;
          const bmi = (weight / (heightInM * heightInM)).toFixed(1);
          updated.bmi = bmi;
        }
      }

      return updated;
    });
  };

  const loadModels = async () => {
    const MODEL_URL = "/models";
    console.log("mod: ", MODEL_URL);
    try {
      console.log("Loading models...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      console.log("Models loaded");
      setIsModelLoaded(true);
    } catch (error) {
      console.error("Model loading error:", error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef) {
        videoRef.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const captureAndProcessFace = async () => {
    setFaceCaptureLoading(true);
    if (!videoRef || !isModelLoaded) return;

    const detection = await faceapi
      .detectSingleFace(videoRef, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setFaceData(detection.descriptor);
      toast.success("Face captured successfully!");
      // Stop camera
      const stream = videoRef.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    } else {
      toast.error("No face detected. Please try again.");
    }

    setFaceCaptureLoading(false);
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    console.log("submit called");
    setIsLoading(true);
    e.preventDefault();

    const descriptorArray = Object.values(faceData);

    const payload = {
      ...formData,
      faceDescriptor: descriptorArray,
      allergies: formData.allergies
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
      chronicConditions: formData.chronicConditions
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
      medications: formData.medications
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
      surgeries: formData.surgeries
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
      familyHistory: formData.familyHistory
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          "Signup successful! Please check your email for verification."
        );
        setIsLoggedIn(true);
        navigate("/dashboard");
      }
      console.log("Signup Success:", data);
    } catch (error) {
      console.error("Signup Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: "Personal Info", icon: User },
    { title: "Physical Data", icon: Activity },
    { title: "Medical History", icon: FileText },
    { title: "Vital Signs", icon: Heart },
    { title: "Lifestyle & Emergency", icon: Stethoscope },
    { title: "Record Your Face", icon: Camera },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <User className="text-blue-600" size={28} />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg"
                  required
                />
              </div>

              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="relative md:col-span-2">
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Activity className="text-green-600" size={28} />
              Physical Measurements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  name="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  name="height"
                  type="number"
                  placeholder="170"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  BMI (Auto-calculated)
                </label>
                <input
                  name="bmi"
                  type="text"
                  value={formData.bmi}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-600 font-semibold"
                  placeholder="Will calculate automatically"
                />
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-300"
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <FileText className="text-purple-600" size={28} />
              Medical History
            </h3>

            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400">
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={18} />
                  Allergies (comma separated)
                </label>
                <textarea
                  name="allergies"
                  placeholder="Peanuts, Shellfish, Penicillin..."
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300 h-20 resize-none"
                />
              </div>

              <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-400">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chronic Conditions (comma separated)
                </label>
                <textarea
                  name="chronicConditions"
                  placeholder="Diabetes, Hypertension, Asthma..."
                  value={formData.chronicConditions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-400 transition-all duration-300 h-20 resize-none"
                />
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-400">
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Pill className="text-blue-500" size={18} />
                  Current Medications (comma separated)
                </label>
                <textarea
                  name="medications"
                  placeholder="Metformin, Lisinopril, Aspirin..."
                  value={formData.medications}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 transition-all duration-300 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-6 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Previous Surgeries
                  </label>
                  <textarea
                    name="surgeries"
                    placeholder="Appendectomy, Knee surgery..."
                    value={formData.surgeries}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 transition-all duration-300 h-20 resize-none"
                  />
                </div>

                <div className="bg-green-50 p-6 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Family Medical History
                  </label>
                  <textarea
                    name="familyHistory"
                    placeholder="Heart disease, Cancer, Diabetes..."
                    value={formData.familyHistory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-400 transition-all duration-300 h-20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Heart className="text-red-600" size={28} />
              Vital Signs & Health Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-100 to-pink-100 p-6 rounded-xl shadow-lg">
                <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Heart className="text-red-500" size={18} />
                  Blood Pressure (mmHg)
                </label>
                <div className="flex gap-3">
                  <input
                    name="bloodPressureSystolic"
                    type="number"
                    placeholder="120"
                    value={formData.bloodPressureSystolic}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                  />
                  <span className="text-2xl text-gray-400 self-center">/</span>
                  <input
                    name="bloodPressureDiastolic"
                    type="number"
                    placeholder="80"
                    value={formData.bloodPressureDiastolic}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Systolic / Diastolic
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-xl shadow-lg">
                <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Droplet className="text-blue-500" size={18} />
                  Blood Sugar (mg/dL)
                </label>
                <input
                  name="bloodSugar"
                  type="number"
                  placeholder="100"
                  value={formData.bloodSugar}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 transition-all duration-300"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Fasting glucose level
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-6 rounded-xl shadow-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cholesterol (mg/dL)
                </label>
                <input
                  name="cholesterol"
                  type="number"
                  placeholder="200"
                  value={formData.cholesterol}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 transition-all duration-300"
                />
                <p className="text-xs text-gray-500 mt-2">Total cholesterol</p>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl shadow-lg">
                <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Activity className="text-green-500" size={18} />
                  Heart Rate (BPM)
                </label>
                <input
                  name="heartRate"
                  type="number"
                  placeholder="72"
                  value={formData.heartRate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-400 transition-all duration-300"
                />
                <p className="text-xs text-gray-500 mt-2">Resting heart rate</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Stethoscope className="text-indigo-600" size={28} />
              Lifestyle & Emergency Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2">
                  Lifestyle Information
                </h4>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Smoking Status
                  </label>
                  <select
                    name="smokingStatus"
                    value={formData.smokingStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
                  >
                    <option value="">Select Status</option>
                    <option value="never">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="current">Current Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Alcohol Consumption
                  </label>
                  <select
                    name="alcoholConsumption"
                    value={formData.alcoholConsumption}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
                  >
                    <option value="">Select Frequency</option>
                    <option value="never">Never</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exercise Frequency
                  </label>
                  <select
                    name="exerciseFrequency"
                    value={formData.exerciseFrequency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
                  >
                    <option value="">Select Frequency</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light (1-2 times/week)</option>
                    <option value="moderate">Moderate (3-4 times/week)</option>
                    <option value="active">Very Active (5+ times/week)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    name="dietType"
                    value={formData.dietType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
                  >
                    <option value="">Select Diet</option>
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Ketogenic</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sleep Duration (hours/night)
                  </label>
                  <input
                    name="sleepDuration"
                    type="number"
                    min="1"
                    max="24"
                    placeholder="8"
                    value={formData.sleepDuration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-700 border-b-2 border-red-200 pb-2">
                  Emergency Contact
                </h4>

                <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      name="emergencyName"
                      type="text"
                      placeholder="Emergency contact name"
                      value={formData.emergencyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      name="emergencyPhone"
                      type="tel"
                      placeholder="Emergency contact phone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Relationship
                    </label>
                    <select
                      name="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                      required
                    >
                      <option value="">Select Relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="sibling">Sibling</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Camera className="text-blue-600" size={28} />
              Record Your Face
            </h3>

            <div className="text-center">
              <div className="bg-gray-100 rounded-xl p-8 max-w-md mx-auto">
                <video
                  ref={(ref) => setVideoRef(ref)}
                  autoPlay
                  muted
                  className="w-full rounded-lg mb-4"
                  style={{ display: isCameraActive ? "block" : "none" }}
                />
                <canvas
                  ref={(ref) => setCanvasRef(ref)}
                  className="absolute top-0 left-0"
                  style={{ display: "none" }}
                />

                {!isCameraActive && !faceData && (
                  <div className="text-gray-500 mb-4">
                    <Camera size={64} className="mx-auto mb-4" />
                    <p>Click to start camera and capture your face</p>
                  </div>
                )}

                {faceData && (
                  <div className="text-green-600 mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      ✓
                    </div>
                    <p>Face captured successfully!</p>
                  </div>
                )}

                <div className="space-y-3">
                  {!isCameraActive && !faceData && (
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={!isModelLoaded}
                      className="px-6 py-3 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isModelLoaded ? "Start Camera" : "Loading AI Models..."}
                    </button>
                  )}

                  {isCameraActive && (
                    <button
                      type="button"
                      onClick={captureAndProcessFace}
                      className="px-6 py-3 bg-green-600 cursor-pointer  text-white rounded-lg hover:bg-green-700"
                    >
                      {faceCaptureLoading ? " Capturing Face" : " Capture Face"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    loadModels();
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-4">
            <Stethoscope className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MediCare+ Registration
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Complete medical profile setup for personalized healthcare
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-center items-center space-x-4 mb-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    <StepIcon size={20} />
                  </div>
                  <div className="ml-3 hidden md:block">
                    <p
                      className={`text-sm font-semibold ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {stepNumber < steps.length && (
                    <ChevronRight className="mx-4 text-gray-300" size={20} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-8 py-4 rounded-xl cursor-pointer font-semibold transition-all duration-300 ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-lg transform hover:-translate-y-1"
                }`}
              >
                Previous Step
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-500">
                  Step {currentStep} of {steps.length}
                </span>
              </div>

              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="px-8 py-4 bg-gradient-to-r cursor-pointer from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-12 py-4 bg-gradient-to-r cursor-pointer from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                >
                  <Heart size={20} />
                  {isLoading ? (
                    <span>Completing...</span>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <p className="text-gray-600 mb-4">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-300"
              >
                Sign In Here
              </a>
            </p>
            <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                HIPAA Compliant
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                256-bit Encryption
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Secure Storage
              </span>
            </div>
          </div>
        </div>

        {/* Health Tips Sidebar */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden xl:block">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-xs">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="text-red-500" size={20} />
              Health Tip
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              {currentStep === 1 && (
                <p>
                  💡 Use a strong password with at least 8 characters, including
                  numbers and symbols.
                </p>
              )}
              {currentStep === 2 && (
                <p>
                  📏 BMI between 18.5-24.9 is considered healthy for most
                  adults.
                </p>
              )}
              {currentStep === 3 && (
                <p>
                  🩺 Knowing your family medical history helps predict and
                  prevent health issues.
                </p>
              )}
              {currentStep === 4 && (
                <p>❤️ Normal blood pressure is less than 120/80 mmHg.</p>
              )}
              {currentStep === 5 && (
                <p>
                  😴 Adults need 7-9 hours of sleep per night for optimal
                  health.
                </p>
              )}
              {currentStep === 6 && <p>Be On Light .</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalSignup;
