import React from "react";
import { CheckCircle, Shield, Database, FileText } from "lucide-react";

const SuccessModal = ({ type }) => {
  const isWeb3 = type === "web3";
  const text = isWeb3
    ? "Your medical report has been uploaded successfully and stored securely on the blockchain."
    : "Your medical report has been uploaded successfully and stored securely in our database.";

  const icon = isWeb3 ? (
    <FileText className="h-5 w-5" />
  ) : (
    <Database className="h-5 w-5" />
  );
  const iconText = isWeb3 ? "Blockchain Verified" : "Database Secured";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center max-w-md w-full">
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative bg-green-500/20 backdrop-blur-sm p-6 rounded-full border border-green-400/30 inline-block">
            <CheckCircle className="h-16 w-16 text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-4">Success! 🎉</h2>

        {/* Main message */}
        <p className="text-white/80 text-lg">{text}</p>

        {/* Security row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <div className="flex items-center space-x-2 text-green-400">
            {icon}
            <span className="text-sm">{iconText}</span>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <Shield className="h-5 w-5" />
            <span className="text-sm">HIPAA Compliant & Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
