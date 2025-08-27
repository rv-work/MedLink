import React from "react";
import { Database } from "lucide-react";

const DatabaseStatus = () => {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl p-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-3 text-blue-300">
          <Database className="h-5 w-5" />
          <span className="font-medium">Database Connected</span>
          <div className="flex items-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Ready to Upload</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;
