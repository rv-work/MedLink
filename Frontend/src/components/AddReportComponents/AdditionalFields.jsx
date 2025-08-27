import React, { useState, useEffect } from "react";
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  Ruler,
  Volume2,
  Mic,
  MicOff,
} from "lucide-react";

const AdditionalFields = ({ formData, handleChange }) => {
  const reportTypes = [
    "Blood Test",
    "X-Ray",
    "MRI",
    "CT Scan",
    "ECG",
    "General Checkup",
    "Other",
  ];

  const departments = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Gastroenterology",
    "Dermatology",
    "Oncology",
    "Pediatrics",
    "Gynecology",
    "Urology",
    "ENT",
    "Ophthalmology",
    "General Medicine",
    "Other",
  ];

  const [isListening, setIsListening] = useState({
    reportType: false,
    department: false,
    ageAtReport: false,
    "vitals.bloodPressure": false,
    "vitals.heartRate": false,
    "vitals.temperature": false,
    "vitals.oxygenSaturation": false,
    "vitals.weight": false,
    "vitals.height": false,
    "vitals.bmi": false,
  });

  // Auto-calculate BMI when weight or height changes
  useEffect(() => {
    const weight = parseFloat(formData.vitals?.weight);
    const height = parseFloat(formData.vitals?.height);

    if (weight && height && weight > 0 && height > 0) {
      // BMI = weight (kg) / (height (m))^2
      // Convert height from cm to meters
      const heightInMeters = height / 100;
      const calculatedBMI = weight / (heightInMeters * heightInMeters);

      // Round to 1 decimal place
      const roundedBMI = Math.round(calculatedBMI * 10) / 10;

      // Only update if the calculated BMI is different from current BMI
      if (formData.vitals?.bmi !== roundedBMI.toString()) {
        const syntheticEvent = {
          target: {
            name: "vitals.bmi",
            value: roundedBMI.toString(),
          },
        };
        handleChange(syntheticEvent);
      }
    }
  }, [
    formData.vitals?.weight,
    formData.vitals?.height,
    formData.vitals?.bmi,
    handleChange,
  ]);

  // Text-to-Speech function
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis not supported in your browser");
    }
  };

  // Speech-to-Text function
  const startListening = (fieldName, options = []) => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in your browser");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    setIsListening((prev) => ({ ...prev, [fieldName]: true }));

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      let valueToSet = transcript;

      // For select fields, try to match with available options
      if (options.length > 0) {
        const matchedOption = options.find(
          (option) => option.toLowerCase() === transcript.toLowerCase()
        );
        if (matchedOption) {
          valueToSet = matchedOption;
        }
      }

      const syntheticEvent = {
        target: {
          name: fieldName,
          value: valueToSet,
        },
      };
      handleChange(syntheticEvent);
      setIsListening((prev) => ({ ...prev, [fieldName]: false }));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening((prev) => ({ ...prev, [fieldName]: false }));
    };

    recognition.onend = () => {
      setIsListening((prev) => ({ ...prev, [fieldName]: false }));
    };

    recognition.start();
  };

  const stopListening = (fieldName) => {
    setIsListening((prev) => ({ ...prev, [fieldName]: false }));
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  };

  // Get BMI category for display
  const getBMICategory = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (!bmiValue || bmiValue <= 0) return "";

    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Normal weight";
    if (bmiValue < 30) return "Overweight";
    return "Obese";
  };

  return (
    <div className="space-y-6">
      {/* Report Type and Department Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Report Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-white/90 font-medium">
            <span>Report Type *</span>
            <button
              type="button"
              onClick={() =>
                speakText("Please select the type of medical report")
              }
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              title="Play instruction"
            >
              <Volume2 className="h-3 w-3 text-blue-300" />
            </button>
          </label>
          <div className="relative">
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              required
            >
              {reportTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                  className="bg-gray-800 text-white"
                >
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                isListening.reportType
                  ? stopListening("reportType")
                  : startListening("reportType", reportTypes)
              }
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening.reportType
                  ? "bg-red-500/20 text-red-300"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
              title={
                isListening.reportType ? "Stop recording" : "Start voice input"
              }
            >
              {isListening.reportType ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-white/90 font-medium">
            <span>Department</span>
            <button
              type="button"
              onClick={() => speakText("Please select the medical department")}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              title="Play instruction"
            >
              <Volume2 className="h-3 w-3 text-green-300" />
            </button>
          </label>
          <div className="relative">
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
            >
              <option value="" className="bg-gray-800 text-white">
                Select Department
              </option>
              {departments.map((dept) => (
                <option
                  key={dept}
                  value={dept}
                  className="bg-gray-800 text-white"
                >
                  {dept}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                isListening.department
                  ? stopListening("department")
                  : startListening("department", departments)
              }
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening.department
                  ? "bg-red-500/20 text-red-300"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
              title={
                isListening.department ? "Stop recording" : "Start voice input"
              }
            >
              {isListening.department ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Age at Report */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-white/90 font-medium">
            <span>Age at Report</span>
            <button
              type="button"
              onClick={() =>
                speakText(
                  "Please enter the patient's age at the time of report"
                )
              }
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              title="Play instruction"
            >
              <Volume2 className="h-3 w-3 text-purple-300" />
            </button>
          </label>
          <div className="relative">
            <input
              type="number"
              name="ageAtReport"
              value={formData.ageAtReport}
              onChange={handleChange}
              placeholder="Enter age"
              min="0"
              max="150"
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() =>
                isListening.ageAtReport
                  ? stopListening("ageAtReport")
                  : startListening("ageAtReport")
              }
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening.ageAtReport
                  ? "bg-red-500/20 text-red-300"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
              title={
                isListening.ageAtReport ? "Stop recording" : "Start voice input"
              }
            >
              {isListening.ageAtReport ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Vitals Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Vital Signs (Optional)
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 font-medium">
              <Heart className="w-4 h-4" />
              <span>Blood Pressure</span>
              <button
                type="button"
                onClick={() =>
                  speakText(
                    "Please enter the blood pressure reading, for example one twenty over eighty"
                  )
                }
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Play instruction"
              >
                <Volume2 className="h-3 w-3 text-red-300" />
              </button>
            </label>
            <div className="relative">
              <input
                type="text"
                name="vitals.bloodPressure"
                value={formData.vitals?.bloodPressure || ""}
                onChange={handleChange}
                placeholder="e.g., 120/80"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() =>
                  isListening["vitals.bloodPressure"]
                    ? stopListening("vitals.bloodPressure")
                    : startListening("vitals.bloodPressure")
                }
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening["vitals.bloodPressure"]
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
                title={
                  isListening["vitals.bloodPressure"]
                    ? "Stop recording"
                    : "Start voice input"
                }
              >
                {isListening["vitals.bloodPressure"] ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 font-medium">
              <span>Heart Rate (BPM)</span>
              <button
                type="button"
                onClick={() =>
                  speakText("Please enter the heart rate in beats per minute")
                }
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Play instruction"
              >
                <Volume2 className="h-3 w-3 text-pink-300" />
              </button>
            </label>
            <div className="relative">
              <input
                type="number"
                name="vitals.heartRate"
                value={formData.vitals?.heartRate || ""}
                onChange={handleChange}
                placeholder="e.g., 72"
                min="0"
                max="300"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() =>
                  isListening["vitals.heartRate"]
                    ? stopListening("vitals.heartRate")
                    : startListening("vitals.heartRate")
                }
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening["vitals.heartRate"]
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
                title={
                  isListening["vitals.heartRate"]
                    ? "Stop recording"
                    : "Start voice input"
                }
              >
                {isListening["vitals.heartRate"] ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 font-medium">
              <Thermometer className="w-4 h-4" />
              <span>Temperature (°F)</span>
              <button
                type="button"
                onClick={() =>
                  speakText("Please enter the body temperature in Fahrenheit")
                }
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Play instruction"
              >
                <Volume2 className="h-3 w-3 text-orange-300" />
              </button>
            </label>
            <div className="relative">
              <input
                type="number"
                name="vitals.temperature"
                value={formData.vitals?.temperature || ""}
                onChange={handleChange}
                placeholder="e.g., 98.6"
                step="0.1"
                min="90"
                max="110"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() =>
                  isListening["vitals.temperature"]
                    ? stopListening("vitals.temperature")
                    : startListening("vitals.temperature")
                }
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening["vitals.temperature"]
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
                title={
                  isListening["vitals.temperature"]
                    ? "Stop recording"
                    : "Start voice input"
                }
              >
                {isListening["vitals.temperature"] ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Oxygen Saturation */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 font-medium">
              <span>Oxygen Saturation (%)</span>
              <button
                type="button"
                onClick={() =>
                  speakText("Please enter the oxygen saturation percentage")
                }
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Play instruction"
              >
                <Volume2 className="h-3 w-3 text-cyan-300" />
              </button>
            </label>
            <div className="relative">
              <input
                type="number"
                name="vitals.oxygenSaturation"
                value={formData.vitals?.oxygenSaturation || ""}
                onChange={handleChange}
                placeholder="e.g., 98"
                min="0"
                max="100"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() =>
                  isListening["vitals.oxygenSaturation"]
                    ? stopListening("vitals.oxygenSaturation")
                    : startListening("vitals.oxygenSaturation")
                }
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening["vitals.oxygenSaturation"]
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
                title={
                  isListening["vitals.oxygenSaturation"]
                    ? "Stop recording"
                    : "Start voice input"
                }
              >
                {isListening["vitals.oxygenSaturation"] ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 font-medium">
              <Scale className="w-4 h-4" />
              <span>Weight (kg)</span>
              <button
                type="button"
                onClick={() =>
                  speakText("Please enter the weight in kilograms")
                }
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Play instruction"
              >
                <Volume2 className="h-3 w-3 text-green-300" />
              </button>
            </label>
            <div className="relative">
              <input
                type="number"
                name="vitals.weight"
                value={formData.vitals?.weight || ""}
                onChange={handleChange}
                placeholder="e.g., 70"
                step="0.1"
                min="0"
                max="500"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() =>
                  isListening["vitals.weight"]
                    ? stopListening("vitals.weight")
                    : startListening("vitals.weight")
                }
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening["vitals.weight"]
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
                title={
                  isListening["vitals.weight"]
                    ? "Stop recording"
                    : "Start voice input"
                }
              >
                {isListening["vitals.weight"] ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 font-medium">
              <Ruler className="w-4 h-4" />
              <span>Height (cm)</span>
              <button
                type="button"
                onClick={() =>
                  speakText("Please enter the height in centimeters")
                }
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Play instruction"
              >
                <Volume2 className="h-3 w-3 text-yellow-300" />
              </button>
            </label>
            <div className="relative">
              <input
                type="number"
                name="vitals.height"
                value={formData.vitals?.height || ""}
                onChange={handleChange}
                placeholder="e.g., 175"
                step="0.1"
                min="0"
                max="300"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() =>
                  isListening["vitals.height"]
                    ? stopListening("vitals.height")
                    : startListening("vitals.height")
                }
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening["vitals.height"]
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
                title={
                  isListening["vitals.height"]
                    ? "Stop recording"
                    : "Start voice input"
                }
              >
                {isListening["vitals.height"] ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* BMI */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white/90 font-medium">
              <span>BMI</span>
              <button
                type="button"
                onClick={() =>
                  speakText(
                    "BMI is automatically calculated from weight and height"
                  )
                }
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                title="Play instruction"
              >
                <Volume2 className="h-3 w-3 text-indigo-300" />
              </button>
            </label>
            <div className="relative">
              <input
                type="number"
                name="vitals.bmi"
                value={formData.vitals?.bmi || ""}
                onChange={handleChange}
                placeholder="Auto-calculated"
                step="0.1"
                min="0"
                max="100"
                className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                readOnly={formData.vitals?.weight && formData.vitals?.height}
              />
              <button
                type="button"
                onClick={() =>
                  isListening["vitals.bmi"]
                    ? stopListening("vitals.bmi")
                    : startListening("vitals.bmi")
                }
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening["vitals.bmi"]
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                } ${
                  formData.vitals?.weight && formData.vitals?.height
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title={
                  formData.vitals?.weight && formData.vitals?.height
                    ? "BMI is auto-calculated"
                    : isListening["vitals.bmi"]
                    ? "Stop recording"
                    : "Start voice input"
                }
                disabled={formData.vitals?.weight && formData.vitals?.height}
              >
                {isListening["vitals.bmi"] ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* BMI Category Display */}
            {formData.vitals?.bmi && (
              <div className="text-sm text-white/70 mt-1">
                Category:{" "}
                <span className="text-white font-medium">
                  {getBMICategory(formData.vitals.bmi)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-200 text-sm">
            💡 <strong>Tip:</strong> BMI is automatically calculated when you
            enter both weight and height. The BMI field becomes read-only when
            auto-calculated.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdditionalFields;
