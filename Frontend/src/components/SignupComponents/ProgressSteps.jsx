import { ChevronRight } from "lucide-react";

const ProgressSteps = ({ steps, currentStep }) => {
  return (
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
  );
};

export default ProgressSteps;
