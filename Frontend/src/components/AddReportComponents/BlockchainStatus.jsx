import React from "react";
import { Shield } from "lucide-react";

const BlockchainStatus = ({ connectWallet, address }) => {
  return (
    <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-400/30 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center space-x-3 text-orange-300">
          <Shield className="h-5 w-5" />
          <span className="font-medium">Blockchain Connection</span>
        </div>

        {/* Wallet Button */}
        <button
          onClick={connectWallet}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 px-4 py-2 rounded-lg font-semibold text-white transform hover:scale-105 transition-all duration-300"
        >
          {address
            ? `Wallet Connected: ${address.substring(
                0,
                6
              )}...${address.substring(address.length - 4)}`
            : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default BlockchainStatus;
