import React from "react";
import { Shield, Database, Heart, FileText } from "lucide-react";

const SecurityFooter = ({ pageType }) => {
  const isWeb3 = pageType === "web3";
  const icon = isWeb3 ? (
    <FileText className="h-5 w-5" />
  ) : (
    <Database className="h-5 w-5" />
  );
  const text = isWeb3 ? "Blockchain Verified" : "Database Secured";

  return (
    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mt-8">
      <div className="flex flex-wrap items-center justify-center gap-4 text-center">
        {/* Encryption */}
        <div className="flex items-center space-x-2 text-green-400">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">End-to-End Encrypted</span>
        </div>

        <div className="hidden sm:block w-1 h-1 bg-white/40 rounded-full"></div>

        {/* Storage type */}
        <div className="flex items-center space-x-2 text-blue-400">
          {icon}
          <span className="text-sm font-medium">{text}</span>
        </div>

        <div className="hidden sm:block w-1 h-1 bg-white/40 rounded-full"></div>

        {/* Compliance */}
        <div className="flex items-center space-x-2 text-purple-400">
          <Heart className="h-5 w-5" />
          <span className="text-sm font-medium">HIPAA Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default SecurityFooter;
