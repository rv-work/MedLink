import { Heart } from "lucide-react";

const NavigationButtons = ({
  currentStep,
  totalSteps,
  prevStep,
  nextStep,
  handleSubmit,
  isLoading,
}) => {
  return (
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
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {currentStep < totalSteps ? (
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
  );
};

export default NavigationButtons;
