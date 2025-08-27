import React from "react";
import { FileText, Shield, Cloud, Sparkles } from "lucide-react";

const Header = ({ pageType }) => {
  const isWeb3 = pageType === "web3";
  const headerText = isWeb3 ? "Blockchain Protected" : "Cloud Protected";
  const securityIcon = isWeb3 ? (
    <Sparkles className="h-4 w-4" />
  ) : (
    <Cloud className="h-4 w-4" />
  );

  return (
    <div className="text-center mb-12 pt-8">
      {/* Icon + Title */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
          <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20">
            <FileText className="h-10 w-10 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Add Medical Report
          </h1>
          <p className="text-white/60 text-lg">
            Secure • Private • {headerText}
          </p>
        </div>
      </div>

      {/* Status row */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-8 space-y-2 sm:space-y-0 mb-8">
        <div className="flex items-center space-x-2 text-green-400">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">System Online</span>
        </div>
        <div className="flex items-center space-x-2 text-blue-400">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">HIPAA Compliant</span>
        </div>
        <div className="flex items-center space-x-2 text-purple-400">
          {securityIcon}
          <span className="text-sm font-medium">{headerText}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
