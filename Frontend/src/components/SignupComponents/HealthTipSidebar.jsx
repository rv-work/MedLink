import { Heart } from "lucide-react";

const HealthTipSidebar = ({ currentStep }) => {
  const getTipForStep = (step) => {
    const tips = {
      1: "💡 Use a strong password with at least 8 characters, including numbers and symbols.",
      2: "📏 BMI between 18.5-24.9 is considered healthy for most adults.",
      3: "🩺 Knowing your family medical history helps predict and prevent health issues.",
      4: "❤️ Normal blood pressure is less than 120/80 mmHg.",
      5: "😴 Adults need 7-9 hours of sleep per night for optimal health.",
      6: "💡 Ensure good lighting for face capture.",
    };
    return tips[step] || "Stay healthy!";
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden xl:block">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-xs">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Heart className="text-red-500" size={20} />
          Health Tip
        </h4>
        <div className="space-y-3 text-sm text-gray-600">
          <p>{getTipForStep(currentStep)}</p>
        </div>
      </div>
    </div>
  );
};

export default HealthTipSidebar;
