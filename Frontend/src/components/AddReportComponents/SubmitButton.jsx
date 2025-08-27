import React from "react";
import { Upload, Loader2, Sparkles } from "lucide-react";

const SubmitButton = ({ loading, loadingText, buttonText }) => {
  return (
    <div className="pt-6">
      <button
        type="submit"
        disabled={loading}
        className="group relative cursor-pointer w-full bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500 hover:from-blue-600 hover:via-purple-700 hover:to-teal-600 px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Content */}
        <div className="relative flex items-center justify-center space-x-3">
          {loading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>{loadingText}</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              <span>{buttonText}</span>
              <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default SubmitButton;
