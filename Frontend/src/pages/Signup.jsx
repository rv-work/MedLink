import { useState, useRef } from "react";
import {
  User,
  Activity,
  FileText,
  Heart,
  Stethoscope,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import HeaderSection from "../components/SignupComponents/HeaderSection";
import ProgressSteps from "../components/SignupComponents/ProgressSteps";
import PersonalInfoStep from "../components/SignupComponents/PersonalInfoStep";
import PhysicalDataStep from "../components/SignupComponents/PhysicalDataStep";
import MedicalHistoryStep from "../components/SignupComponents/MedicalHistoryStep";
import VitalSignsStep from "../components/SignupComponents/VitalSignsStep";
import LifestyleStep from "../components/SignupComponents/LifestyleStep";
import FaceCaptureStep from "../components/SignupComponents/FaceCaptureStep";
import NavigationButtons from "../components/SignupComponents/NavigationButtons";
import HealthTipSidebar from "../components/SignupComponents/HealthTipSidebar";
import FooterSection from "../components/SignupComponents/FooterSection";

const MedicalSignup = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "Ravi Kumar",
    email: "ravi.kumar@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    phone: "+91-9876543210",
    gender: "Male",
    dob: "1995-08-15",
    weight: "70",
    height: "175",
    bmi: "22.9",
    bloodGroup: "B+",
    // Initialize as proper arrays instead of empty
    allergies: [
      {
        allergen: "Peanuts",
        type: "Food",
        severity: "Severe",
        reaction: "Anaphylaxis",
        onsetDate: "2010-05-12",
        verifiedBy: "Dr. Mehta",
        avoidanceInstructions: "Avoid peanuts and peanut oil",
        emergencyMedication: "Epinephrine auto-injector",
        lastReaction: "2021-08-22",
        notes: "Carries EpiPen at all times",
      },
    ],
    chronicConditions: [
      {
        conditionName: "Asthma",
        diagnosedOn: "2015-03-10",
        severityLevel: "Moderate",
        medicines: [
          {
            name: "Salbutamol",
            form: "Inhaler",
            dose: "100mcg",
            frequency: "As needed",
            timing: ["Morning", "Evening"],
          },
        ],
        triggers: ["Dust", "Cold weather", "Pollen"],
        precautions: ["Avoid dusty areas", "Use mask outdoors"],
        lastReviewDate: "2024-11-20",
      },
    ],
    surgicalHistory: [
      {
        procedure: "Appendectomy",
        date: "2018-06-15",
        surgeon: "Dr. Sharma",
        hospital: "Apollo Hospital",
        indication: "Appendicitis",
        complications: "None",
        recoveryTime: "3 weeks",
        anesthesia: "General",
        pathologyReport: "Appendix inflamed, no malignancy",
        followUpDate: "2018-07-05",
        notes: "Full recovery",
      },
    ],
    immunizations: [
      {
        vaccine: "Tetanus",
        doses: "1",
        lastDate: "2024-01-10",
        nextDue: "2034-01-10",
        provider: "City Health Clinic",
        lotNumber: "TX123456",
        sideEffects: "Mild arm soreness",
        status: "Completed",
      },
    ],
    medications: "Multivitamins",
    surgeries: "Appendectomy",
    familyHistory: "Father has hypertension",
    bloodPressureSystolic: "120",
    bloodPressureDiastolic: "80",
    bloodSugar: "90",
    cholesterol: "180",
    heartRate: "72",
    smokingStatus: "Never",
    alcoholConsumption: "Occasional",
    exerciseFrequency: "3 times a week",
    dietType: "Vegetarian",
    sleepDuration: "7 hours",
    emergencyContacts: [
      {
        name: "Priya Kumar",
        phone: "+91-9123456789",
        relation: "Sister",
      },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Handle BMI calculation for weight/height changes
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);

    const stream = videoRef.current.srcObject;
    stream.getTracks().forEach((track) => track.stop());
    setIsCameraActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add basic user information
      for (const key in formData) {
        if (
          key !== "allergies" &&
          key !== "chronicConditions" &&
          key !== "surgicalHistory" &&
          key !== "immunizations" &&
          key !== "emergencyContacts"
        ) {
          formDataToSend.append(key, formData[key]);
        }
      }

      // Handle structured medical history data - these are already in proper format
      formDataToSend.append(
        "allergies",
        JSON.stringify(formData.allergies || []),
      );
      formDataToSend.append(
        "chronicConditions",
        JSON.stringify(formData.chronicConditions || []),
      );
      formDataToSend.append(
        "surgicalHistory",
        JSON.stringify(formData.surgicalHistory || []),
      );
      formDataToSend.append(
        "immunizations",
        JSON.stringify(formData.immunizations || []),
      );
      formDataToSend.append(
        "emergencyContacts",
        JSON.stringify(formData.emergencyContacts || []),
      );

      if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        formDataToSend.append("profilePicture", blob, "face.jpg");
      }

      console.log("Sending form data:", Object.fromEntries(formDataToSend));

      const res = await fetch(
        "https://medlink-bh5c.onrender.com/api/auth/signup",
        {
          method: "POST",
          credentials: "include",
          body: formDataToSend,
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Signup successful! Check your email.");
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    { title: "Personal Info", icon: User },
    { title: "Physical Data", icon: Activity },
    { title: "Medical History", icon: FileText },
    { title: "Vital Signs", icon: Heart },
    { title: "Lifestyle & Emergency", icon: Stethoscope },
    { title: "Capture Face", icon: Camera },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep formData={formData} handleChange={handleChange} />
        );
      case 2:
        return (
          <PhysicalDataStep formData={formData} handleChange={handleChange} />
        );
      case 3:
        return (
          <MedicalHistoryStep formData={formData} handleChange={handleChange} />
        );
      case 4:
        return (
          <VitalSignsStep formData={formData} handleChange={handleChange} />
        );
      case 5:
        return (
          <LifestyleStep formData={formData} handleChange={handleChange} />
        );
      case 6:
        return (
          <FaceCaptureStep
            videoRef={videoRef}
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            isCameraActive={isCameraActive}
            startCamera={startCamera}
            capturePhoto={capturePhoto}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <HeaderSection />
        <ProgressSteps steps={steps} currentStep={currentStep} />
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {renderStep()}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={steps.length}
            prevStep={prevStep}
            nextStep={nextStep}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
        <FooterSection />
        <HealthTipSidebar currentStep={currentStep} />
      </div>
    </div>
  );
};

export default MedicalSignup;
