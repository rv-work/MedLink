import React, { useState, useEffect } from "react";
import {
  Pill,
  Heart,
  AlertTriangle,
  Shield,
  Info,
  Star,
  Clock,
  Sparkles,
  Check,
  Volume2,
  Pause,
  Play,
  Square,
  Languages,
} from "lucide-react";

const MedicationSummaryDisplay = ({ summaryResult }) => {
  const [speechState, setSpeechState] = useState({}); // Track speech state for each medication
  const [globalSpeechState, setGlobalSpeechState] = useState("stopped"); // stopped, playing, paused
  const [currentLanguage, setCurrentLanguage] = useState({}); // Track current language for each medication

  useEffect(() => {
    speechSynthesis.addEventListener("voiceschanged", () => {});

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const getGradientColor = (index) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-pink-500 to-rose-600",
      "from-yellow-500 to-orange-600",
      "from-indigo-500 to-blue-600",
      "from-purple-500 to-pink-600",
      "from-teal-500 to-green-600",
      "from-orange-500 to-red-600",
    ];
    return gradients[index % gradients.length];
  };

  const getIconColor = (index) => {
    const colors = [
      "text-blue-600",
      "text-green-600",
      "text-pink-600",
      "text-yellow-600",
      "text-indigo-600",
      "text-purple-600",
      "text-teal-600",
      "text-orange-600",
    ];
    return colors[index % colors.length];
  };

  const handleSpeak = (medication, index) => {
    speechSynthesis.cancel();

    const text = `
      Medicine: ${medication.medicineName}.
      Quantity: ${medication.quantity}.
      Reason: ${medication.whyGiven}.
      Uses: ${medication.uses}.
      Best Way To Take: ${medication.bestWayToTake}.
      Benefits: ${medication.benefits}.
      Side Effects: ${medication.sideEffects}.
      Precautions: ${medication.precautions}.
      ${
        medication.anyOtherInfo
          ? `Additional Info: ${medication.anyOtherInfo}.`
          : ""
      }
    `;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    const indianVoice = voices.find(
      (voice) =>
        voice.lang === "en-IN" || voice.name.toLowerCase().includes("indian")
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    // Set up event listeners
    utterance.onstart = () => {
      setGlobalSpeechState("playing");
      setSpeechState((prev) => ({ ...prev, [index]: "playing" }));
      setCurrentLanguage((prev) => ({ ...prev, [index]: "english" }));
    };

    utterance.onend = () => {
      setGlobalSpeechState("stopped");
      setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
    };

    utterance.onerror = () => {
      setGlobalSpeechState("stopped");
      setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
    };

    speechSynthesis.speak(utterance);
  };

  const handleHindiSpeak = (medication, index) => {
    speechSynthesis.cancel();

    const text = medication.hindiSummary || "हिंदी सारांश उपलब्ध नहीं है।";

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    const hindiVoice = voices.find(
      (voice) =>
        voice.lang === "hi-IN" ||
        voice.lang === "hi" ||
        voice.name.toLowerCase().includes("hindi")
    );

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.lang = "hi-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Set up event listeners
    utterance.onstart = () => {
      setGlobalSpeechState("playing");
      setSpeechState((prev) => ({ ...prev, [index]: "playing" }));
      setCurrentLanguage((prev) => ({ ...prev, [index]: "hindi" }));
    };

    utterance.onend = () => {
      setGlobalSpeechState("stopped");
      setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
    };

    utterance.onerror = () => {
      setGlobalSpeechState("stopped");
      setSpeechState((prev) => ({ ...prev, [index]: "stopped" }));
    };

    speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setGlobalSpeechState("paused");
    }
  };

  const handleResume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setGlobalSpeechState("playing");
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setGlobalSpeechState("stopped");
    setSpeechState({});
    setCurrentLanguage({});
  };

  const renderSpeechControls = (medication, index) => {
    const currentState = speechState[index] || "stopped";
    const currentLang = currentLanguage[index];

    return (
      <div className="flex items-center gap-2">
        {/* English Speech Button */}
        <div className="relative group">
          <Volume2
            className={`w-5 h-5 cursor-pointer transition ${
              currentState === "playing" && currentLang === "english"
                ? "text-yellow-300"
                : "text-white hover:text-yellow-300"
            }`}
            title="Speak in English"
            onClick={() => handleSpeak(medication, index)}
          />
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            English
          </div>
        </div>

        {/* Hindi Speech Button */}
        {medication.hindiSummary && (
          <div className="relative group">
            <Languages
              className={`w-5 h-5 cursor-pointer transition ${
                currentState === "playing" && currentLang === "hindi"
                  ? "text-yellow-300"
                  : "text-white hover:text-yellow-300"
              }`}
              title="Speak in Hindi"
              onClick={() => handleHindiSpeak(medication, index)}
            />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              हिंदी
            </div>
          </div>
        )}

        {/* Pause/Resume/Stop Controls */}
        {currentState === "playing" && globalSpeechState === "playing" && (
          <Pause
            className="w-5 h-5 text-white cursor-pointer hover:text-yellow-300 transition"
            title="Pause"
            onClick={handlePause}
          />
        )}

        {globalSpeechState === "paused" && (
          <Play
            className="w-5 h-5 text-white cursor-pointer hover:text-yellow-300 transition"
            title="Resume"
            onClick={handleResume}
          />
        )}

        {(currentState === "playing" || globalSpeechState === "paused") && (
          <Square
            className="w-4 h-4 text-white cursor-pointer hover:text-red-300 transition"
            title="Stop"
            onClick={handleStop}
          />
        )}
      </div>
    );
  };

  // Sample data for demonstration
  const sampleData = [
    {
      medicineName: "Paracetamol 500mg",
      quantity: "20 tablets",
      whyGiven: "For fever and pain relief",
      uses: "Reduces fever and relieves mild to moderate pain",
      bestWayToTake: "Take 1-2 tablets with water after meals, every 4-6 hours",
      benefits: "Quick relief from fever and headache",
      sideEffects: "Rare: nausea, skin rash, liver damage with overdose",
      precautions: "Do not exceed 4g per day. Avoid alcohol",
      anyOtherInfo: "Store in cool, dry place",
      hindiSummary:
        "पैरासिटामोल 500 मिलीग्राम। बुखार और दर्द के लिए। खाने के बाद 1-2 गोली पानी के साथ लें। दिन में 4 गोली से अधिक न लें। शराब से बचें।",
    },
    {
      medicineName: "Amoxicillin 250mg",
      quantity: "14 capsules",
      whyGiven: "Antibiotic for bacterial infection",
      uses: "Treats bacterial infections of respiratory tract, skin, and urinary tract",
      bestWayToTake: "Take 1 capsule every 8 hours with water",
      benefits: "Effective against various bacterial infections",
      sideEffects: "Nausea, diarrhea, allergic reactions",
      precautions: "Complete the full course. Inform doctor about allergies",
      anyOtherInfo: "Take with food to reduce stomach upset",
      hindiSummary:
        "एमोक्सिसिलिन 250 मिलीग्राम। बैक्टीरियल संक्रमण के लिए एंटीबायोटिक। हर 8 घंटे में 1 कैप्सूल लें। पूरा कोर्स करें। खाने के साथ लें।",
    },
  ];

  const displayData = summaryResult || sampleData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Medication Summary
          </h2>
        </div>
        <p className="text-gray-600 text-lg">
          AI-powered analysis of your prescribed medications
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-full">
          <Check className="w-4 h-4" />
          <span>{displayData.length} medications analyzed</span>
        </div>
        <div className="flex items-center justify-center space-x-4 text-sm text-blue-600">
          <div className="flex items-center space-x-1">
            <Volume2 className="w-4 h-4" />
            <span>English Audio</span>
          </div>
          <div className="flex items-center space-x-1">
            <Languages className="w-4 h-4" />
            <span>हिंदी ऑडियो</span>
          </div>
        </div>
      </div>

      {/* Global Speech Controls */}
      {globalSpeechState !== "stopped" && (
        <div className="flex items-center justify-center space-x-4 p-4 bg-gray-100 rounded-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              {globalSpeechState === "playing" ? "Playing..." : "Paused"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {globalSpeechState === "playing" && (
              <button
                onClick={handlePause}
                className="flex items-center space-x-1 px-3 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
              >
                <Pause className="w-4 h-4" />
                <span className="text-sm">Pause</span>
              </button>
            )}

            {globalSpeechState === "paused" && (
              <button
                onClick={handleResume}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm">Resume</span>
              </button>
            )}

            <button
              onClick={handleStop}
              className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <Square className="w-4 h-4" />
              <span className="text-sm">Stop</span>
            </button>
          </div>
        </div>
      )}

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayData.map((medication, index) => (
          <div
            key={index}
            className={`group relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
              speechState[index] === "playing"
                ? "ring-2 ring-green-400 ring-opacity-75"
                : ""
            }`}
          >
            {/* Gradient Header */}
            <div
              className={`bg-gradient-to-r ${getGradientColor(
                index
              )} p-6 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <Pill className="w-8 h-8 text-white" />
                  <div className="flex items-center gap-2">
                    {renderSpeechControls(medication, index)}
                    <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full font-medium">
                      Qty: {medication.quantity}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                  {medication.medicineName}
                </h3>
                <p className="text-white/90 text-sm">{medication.whyGiven}</p>
              </div>

              {/* Speaking Animation */}
              {speechState[index] === "playing" && (
                <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-white text-xs">
                    {currentLanguage[index] === "hindi" ? "हिंदी" : "English"}
                  </span>
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              {/* Uses */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Heart className={`w-5 h-5 ${getIconColor(index)}`} />
                  <span className="font-semibold text-gray-800">Uses</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pl-7">
                  {medication.uses}
                </p>
              </div>

              {/* Best Way To Take */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-5 h-5 ${getIconColor(index)}`} />
                  <span className="font-semibold text-gray-800">
                    How to Take
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pl-7">
                  {medication.bestWayToTake}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Star className={`w-5 h-5 ${getIconColor(index)}`} />
                  <span className="font-semibold text-gray-800">Benefits</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pl-7">
                  {medication.benefits}
                </p>
              </div>

              {/* Side Effects */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-800">
                    Side Effects
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pl-7">
                  {medication.sideEffects}
                </p>
              </div>

              {/* Precautions */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-800">
                    Precautions
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed pl-7">
                  {medication.precautions}
                </p>
              </div>

              {/* Additional Info */}
              {medication.anyOtherInfo && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">
                      Additional Info
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed pl-7">
                    {medication.anyOtherInfo}
                  </p>
                </div>
              )}

              {/* Hindi Summary Display */}
              {medication.hindiSummary && (
                <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Languages className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-orange-800">
                      हिंदी सारांश
                    </span>
                  </div>
                  <p className="text-orange-700 text-sm leading-relaxed pl-6">
                    {medication.hindiSummary}
                  </p>
                </div>
              )}
            </div>

            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-500 rounded-full">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Important Notice / महत्वपूर्ण सूचना
            </h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              This medication summary is generated by AI for informational
              purposes only. Always consult your healthcare provider before
              starting, stopping, or changing any medication. Follow your
              doctor's instructions and the medication label carefully.
            </p>
            <p className="text-blue-800 text-sm leading-relaxed mt-2">
              यह दवा सारांश केवल जानकारी के लिए AI द्वारा तैयार किया गया है। कोई
              भी दवा शुरू करने, बंद करने या बदलने से पहले हमेशा अपने डॉक्टर से
              सलाह लें।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationSummaryDisplay;
