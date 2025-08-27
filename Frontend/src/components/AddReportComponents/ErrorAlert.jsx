import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorAlert = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4">
      <div className="flex items-center space-x-3 text-red-300">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">{error}</span>
      </div>
    </div>
  );
};

export default ErrorAlert;
