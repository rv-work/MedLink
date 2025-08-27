import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmergencyStatus = ({ userData }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-xs mx-auto mt-6 p-4 flex-col gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-md text-white flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {userData.emergencyEnabled ? (
          <ShieldCheck className="w-6 h-6 text-green-400" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-red-400" />
        )}
        <span className="text-lg font-semibold">
          Emergency Mode:{"   "}
          <span
            className={`${
              userData.emergencyEnabled ? "text-green-400" : "text-red-400"
            }`}
          >
            {userData.emergencyEnabled ? "Enabled" : "Disabled"}
          </span>
        </span>
      </div>

      <div className="w-full">
        {userData.emergencyEnabled ? (
          <button
            onClick={() => navigate("/emergency")}
            className="px-4 py-2 w-full cursor-pointer bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            Try Now
          </button>
        ) : (
          <button
            onClick={() => navigate("/enable-emergency")}
            className="px-4 py-2 w-full cursor-pointer  bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
          >
            Enable Now
          </button>
        )}
      </div>
    </div>
  );
};

export default EmergencyStatus;
