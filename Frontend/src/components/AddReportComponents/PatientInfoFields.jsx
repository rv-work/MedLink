import React, { useState } from "react";
import {
  User,
  Stethoscope,
  Building2,
  Calendar,
  Volume2,
  Mic,
  MicOff,
} from "lucide-react";

const PatientInfoFields = ({ formData, handleChange }) => {
  const [isListening, setIsListening] = useState({
    patientName: false,
    doctorName: false,
    hospital: false,
    dateOfReport: false,
  });

  // Text-to-Speech function
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // English language
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis not supported in your browser");
    }
  };

  // Speech-to-Text function
  const startListening = (fieldName) => {
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

    recognition.lang = "en-US"; // English language
    recognition.interimResults = false;
    recognition.continuous = false;

    setIsListening((prev) => ({ ...prev, [fieldName]: true }));

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const syntheticEvent = {
        target: {
          name: fieldName,
          value: transcript,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Patient Name */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-white/90 font-medium">
          <User className="h-4 w-4 text-blue-300" />
          <span>Patient Name</span>
          <button
            type="button"
            onClick={() => speakText("Please enter the patient's full name")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Play instruction"
          >
            <Volume2 className="h-3 w-3 text-blue-300" />
          </button>
        </label>
        <div className="relative">
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="Enter patient's full name"
            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() =>
              isListening.patientName
                ? stopListening("patientName")
                : startListening("patientName")
            }
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
              isListening.patientName
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            title={
              isListening.patientName ? "Stop recording" : "Start voice input"
            }
          >
            {isListening.patientName ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Doctor's Name */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-white/90 font-medium">
          <Stethoscope className="h-4 w-4 text-green-300" />
          <span>Doctor's Name</span>
          <button
            type="button"
            onClick={() => speakText("Please enter the doctor's name")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Play instruction"
          >
            <Volume2 className="h-3 w-3 text-green-300" />
          </button>
        </label>
        <div className="relative">
          <input
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleChange}
            placeholder="Enter doctor's name"
            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 focus:bg-white/15 transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() =>
              isListening.doctorName
                ? stopListening("doctorName")
                : startListening("doctorName")
            }
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
              isListening.doctorName
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            title={
              isListening.doctorName ? "Stop recording" : "Start voice input"
            }
          >
            {isListening.doctorName ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Hospital/Clinic */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-white/90 font-medium">
          <Building2 className="h-4 w-4 text-purple-300" />
          <span>Hospital/Clinic</span>
          <button
            type="button"
            onClick={() =>
              speakText("Please enter the hospital or clinic name")
            }
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Play instruction"
          >
            <Volume2 className="h-3 w-3 text-purple-300" />
          </button>
        </label>
        <div className="relative">
          <input
            type="text"
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            placeholder="Enter hospital or clinic name"
            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() =>
              isListening.hospital
                ? stopListening("hospital")
                : startListening("hospital")
            }
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
              isListening.hospital
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            title={
              isListening.hospital ? "Stop recording" : "Start voice input"
            }
          >
            {isListening.hospital ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Date of Report */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-white/90 font-medium">
          <Calendar className="h-4 w-4 text-teal-300" />
          <span>Date of Report</span>
          <button
            type="button"
            onClick={() =>
              speakText("Please select the date of the medical report")
            }
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Play instruction"
          >
            <Volume2 className="h-3 w-3 text-teal-300" />
          </button>
        </label>
        <input
          type="date"
          name="dateOfReport"
          value={formData.dateOfReport}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-400/50 focus:bg-white/15 transition-all duration-300"
          required
        />
      </div>
    </div>
  );
};

export default PatientInfoFields;
