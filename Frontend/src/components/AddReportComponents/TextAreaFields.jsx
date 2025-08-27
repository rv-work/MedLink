// import React, { useState } from "react";
// import { ClipboardList, Heart, Pill, Volume2, Mic, MicOff } from "lucide-react";

// const TextAreaFields = ({ formData, handleChange }) => {
//   const [isListening, setIsListening] = useState({
//     reasonOfCheckup: false,
//     diagnosisSummary: false,
//     prescription: false,
//   });

//   // Text-to-Speech function
//   const speakText = (text) => {
//     if ("speechSynthesis" in window) {
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = "hi-IN"; // Hindi language
//       utterance.rate = 0.8;
//       utterance.pitch = 1;
//       speechSynthesis.speak(utterance);
//     } else {
//       alert("Speech synthesis not supported in your browser");
//     }
//   };

//   // Speech-to-Text function
//   const startListening = (fieldName) => {
//     if (
//       !("webkitSpeechRecognition" in window) &&
//       !("SpeechRecognition" in window)
//     ) {
//       alert("Speech recognition not supported in your browser");
//       return;
//     }

//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();

//     recognition.lang = "hi-IN"; // Hindi language
//     recognition.interimResults = false;
//     recognition.continuous = false;

//     setIsListening((prev) => ({ ...prev, [fieldName]: true }));

//     recognition.onresult = (event) => {
//       const transcript = event.results[0][0].transcript;
//       const syntheticEvent = {
//         target: {
//           name: fieldName,
//           value: formData[fieldName] + " " + transcript,
//         },
//       };
//       handleChange(syntheticEvent);
//       setIsListening((prev) => ({ ...prev, [fieldName]: false }));
//     };

//     recognition.onerror = (event) => {
//       console.error("Speech recognition error:", event.error);
//       setIsListening((prev) => ({ ...prev, [fieldName]: false }));
//     };

//     recognition.onend = () => {
//       setIsListening((prev) => ({ ...prev, [fieldName]: false }));
//     };

//     recognition.start();
//   };

//   const stopListening = (fieldName) => {
//     setIsListening((prev) => ({ ...prev, [fieldName]: false }));
//     if ("speechSynthesis" in window) {
//       speechSynthesis.cancel();
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Reason for Checkup */}
//       <div className="space-y-2">
//         <label className="flex items-center space-x-2 text-white/90 font-medium">
//           <ClipboardList className="h-4 w-4 text-blue-300" />
//           <span>Reason for Checkup</span>
//           <button
//             type="button"
//             onClick={() => speakText("चेकअप का कारण बताएं")}
//             className="p-1 hover:bg-white/10 rounded-full transition-colors"
//             title="Play instruction"
//           >
//             <Volume2 className="h-3 w-3 text-blue-300" />
//           </button>
//         </label>
//         <div className="relative">
//           <textarea
//             name="reasonOfCheckup"
//             value={formData.reasonOfCheckup}
//             onChange={handleChange}
//             placeholder="Enter the reason for the medical checkup"
//             rows={4}
//             className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
//             required
//           />
//           <button
//             type="button"
//             onClick={() =>
//               isListening.reasonOfCheckup
//                 ? stopListening("reasonOfCheckup")
//                 : startListening("reasonOfCheckup")
//             }
//             className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
//               isListening.reasonOfCheckup
//                 ? "bg-red-500/20 text-red-300"
//                 : "bg-white/10 text-white/70 hover:bg-white/20"
//             }`}
//             title={
//               isListening.reasonOfCheckup
//                 ? "Stop recording"
//                 : "Start voice input"
//             }
//           >
//             {isListening.reasonOfCheckup ? (
//               <MicOff className="h-4 w-4" />
//             ) : (
//               <Mic className="h-4 w-4" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Diagnosis Summary */}
//       <div className="space-y-2">
//         <label className="flex items-center space-x-2 text-white/90 font-medium">
//           <Heart className="h-4 w-4 text-red-300" />
//           <span>Diagnosis Summary</span>
//           <button
//             type="button"
//             onClick={() =>
//               speakText("निदान सारांश और चिकित्सा निष्कर्ष दर्ज करें")
//             }
//             className="p-1 hover:bg-white/10 rounded-full transition-colors"
//             title="Play instruction"
//           >
//             <Volume2 className="h-3 w-3 text-red-300" />
//           </button>
//         </label>
//         <div className="relative">
//           <textarea
//             name="diagnosisSummary"
//             value={formData.diagnosisSummary}
//             onChange={handleChange}
//             placeholder="Enter the diagnosis summary and medical findings"
//             rows={4}
//             className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-red-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
//             required
//           />
//           <button
//             type="button"
//             onClick={() =>
//               isListening.diagnosisSummary
//                 ? stopListening("diagnosisSummary")
//                 : startListening("diagnosisSummary")
//             }
//             className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
//               isListening.diagnosisSummary
//                 ? "bg-red-500/20 text-red-300"
//                 : "bg-white/10 text-white/70 hover:bg-white/20"
//             }`}
//             title={
//               isListening.diagnosisSummary
//                 ? "Stop recording"
//                 : "Start voice input"
//             }
//           >
//             {isListening.diagnosisSummary ? (
//               <MicOff className="h-4 w-4" />
//             ) : (
//               <Mic className="h-4 w-4" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Prescription & Advice */}
//       <div className="space-y-2">
//         <label className="flex items-center space-x-2 text-white/90 font-medium">
//           <Pill className="h-4 w-4 text-indigo-300" />
//           <span>Prescription & Advice</span>
//           <button
//             type="button"
//             onClick={() => speakText("डॉक्टर द्वारा दी गई सलाह यहाँ लिखें")}
//             className="p-1 hover:bg-white/10 rounded-full transition-colors"
//             title="Play instruction"
//           >
//             <Volume2 className="h-3 w-3 text-indigo-300" />
//           </button>
//         </label>
//         <div className="relative">
//           <textarea
//             name="prescription"
//             value={formData.prescription}
//             onChange={handleChange}
//             placeholder="Mention only the advice given by the doctor here. Upload the medicine prescription (report/medicines-list) below."
//             rows={4}
//             className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-indigo-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
//             required
//           />
//           <button
//             type="button"
//             onClick={() =>
//               isListening.prescription
//                 ? stopListening("prescription")
//                 : startListening("prescription")
//             }
//             className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
//               isListening.prescription
//                 ? "bg-red-500/20 text-red-300"
//                 : "bg-white/10 text-white/70 hover:bg-white/20"
//             }`}
//             title={
//               isListening.prescription ? "Stop recording" : "Start voice input"
//             }
//           >
//             {isListening.prescription ? (
//               <MicOff className="h-4 w-4" />
//             ) : (
//               <Mic className="h-4 w-4" />
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TextAreaFields;

import React, { useState } from "react";
import { ClipboardList, Heart, Pill, Volume2, Mic, MicOff } from "lucide-react";

const TextAreaFields = ({ formData, handleChange }) => {
  const [isListening, setIsListening] = useState({
    reasonOfCheckup: false,
    diagnosisSummary: false,
    prescription: false,
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
          value: formData[fieldName] + " " + transcript,
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
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-white/90 font-medium">
          <ClipboardList className="h-4 w-4 text-blue-300" />
          <span>Reason for Checkup</span>
          <button
            type="button"
            onClick={() =>
              speakText("Please enter the reason for your medical checkup")
            }
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Play instruction"
          >
            <Volume2 className="h-3 w-3 text-blue-300" />
          </button>
        </label>
        <div className="relative">
          <textarea
            name="reasonOfCheckup"
            value={formData.reasonOfCheckup}
            onChange={handleChange}
            placeholder="Enter the reason for the medical checkup"
            rows={4}
            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
            required
          />
          <button
            type="button"
            onClick={() =>
              isListening.reasonOfCheckup
                ? stopListening("reasonOfCheckup")
                : startListening("reasonOfCheckup")
            }
            className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
              isListening.reasonOfCheckup
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            title={
              isListening.reasonOfCheckup
                ? "Stop recording"
                : "Start voice input"
            }
          >
            {isListening.reasonOfCheckup ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Diagnosis Summary */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-white/90 font-medium">
          <Heart className="h-4 w-4 text-red-300" />
          <span>Diagnosis Summary</span>
          <button
            type="button"
            onClick={() =>
              speakText(
                "Please enter the diagnosis summary and medical findings"
              )
            }
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Play instruction"
          >
            <Volume2 className="h-3 w-3 text-red-300" />
          </button>
        </label>
        <div className="relative">
          <textarea
            name="diagnosisSummary"
            value={formData.diagnosisSummary}
            onChange={handleChange}
            placeholder="Enter the diagnosis summary and medical findings"
            rows={4}
            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-red-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
            required
          />
          <button
            type="button"
            onClick={() =>
              isListening.diagnosisSummary
                ? stopListening("diagnosisSummary")
                : startListening("diagnosisSummary")
            }
            className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
              isListening.diagnosisSummary
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            title={
              isListening.diagnosisSummary
                ? "Stop recording"
                : "Start voice input"
            }
          >
            {isListening.diagnosisSummary ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Prescription & Advice */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-white/90 font-medium">
          <Pill className="h-4 w-4 text-indigo-300" />
          <span>Prescription & Advice</span>
          <button
            type="button"
            onClick={() =>
              speakText("Please enter only the advice given by the doctor")
            }
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            title="Play instruction"
          >
            <Volume2 className="h-3 w-3 text-indigo-300" />
          </button>
        </label>
        <div className="relative">
          <textarea
            name="prescription"
            value={formData.prescription}
            onChange={handleChange}
            placeholder="Mention only the advice given by the doctor here. Upload the medicine prescription (report/medicines-list) below."
            rows={4}
            className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-indigo-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
            required
          />
          <button
            type="button"
            onClick={() =>
              isListening.prescription
                ? stopListening("prescription")
                : startListening("prescription")
            }
            className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
              isListening.prescription
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
            title={
              isListening.prescription ? "Stop recording" : "Start voice input"
            }
          >
            {isListening.prescription ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextAreaFields;
