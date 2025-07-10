import {
  Shield,
  Heart,
  Stethoscope,
  User,
  Calendar,
  Eye,
  Hospital,
} from "lucide-react";
import { PinContainer } from "./ui/3d.pin";

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const formatTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Time";
  }
};
const HealthcareCard3D = ({ report }) => {
  const reportLink =
    report.type === "web3"
      ? `/reports/${report.reportId}`
      : `/reports/${report._id}`;

  return (
    <PinContainer
      title="View Medical Report"
      href={reportLink}
      containerClassName="w-full max-w-md mx-auto"
    >
      <div className="w-[28rem] h-[32rem] bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-slate-100 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-cyan-500/20 p-2 rounded-lg backdrop-blur-sm border border-cyan-400/30">
                <Stethoscope className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Medical Report
                </h3>
                <p className="text-slate-400 text-sm">
                  ID: {report._id?.slice(-8) || "N/A"}
                </p>
              </div>
            </div>
            {report.type === "web3" && (
              <div className="bg-emerald-500/20 px-2 py-1 rounded-full border border-emerald-400/30">
                <span className="text-emerald-300 text-sm font-semibold flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Web3
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-sm text-slate-400">Active Report</div>
          </div>
        </div>

        {/* Patient & Doctor Info */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 text-blue-400" />
              <div className="min-w-0 flex-1">
                <p className="text-md text-slate-400 uppercase tracking-wide">
                  Patient
                </p>
                <p className="font-semibold text-slate-100 text-lg truncate">
                  {report.patientName || "John Doe"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-3 w-3 text-purple-400" />
              <div className="min-w-0 flex-1">
                <p className="text-md text-slate-400 uppercase tracking-wide">
                  Doctor
                </p>
                <p className="font-semibold text-slate-100 text-lg truncate">
                  {report.doctorName || "Dr. Smith"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital & Date */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
            <div className="flex items-center space-x-2">
              <Hospital className="h-3 w-3 text-teal-400" />
              <div className="min-w-0 flex-1">
                <p className="text-md text-slate-400 uppercase tracking-wide">
                  Hospital
                </p>
                <p className="font-semibold text-slate-100 text-lg truncate">
                  {report.hospital || "City Hospital"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-orange-400" />
              <div className="min-w-0 flex-1">
                <p className="text-md text-slate-400 uppercase tracking-wide">
                  Date
                </p>
                <p className="font-semibold text-slate-100 text-lg">
                  {formatDate(report.dateOfReport || new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="space-y-1">
            <div className="text-xl font-bold text-cyan-400">98%</div>
            <div className="text-sm text-slate-400">Health Score</div>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-emerald-400">Normal</div>
            <div className="text-sm text-slate-400">Status</div>
          </div>
        </div>

        {/* Diagnosis Preview */}
        <div className="bg-slate-800/30 p-2 rounded-lg border border-slate-700/30 mb-3">
          <div className="flex items-start space-x-2">
            <Heart className="h-3 w-3 text-red-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-slate-100 text-sm mb-1">
                Diagnosis
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                {report.diagnosisSummary ||
                  "Regular checkup - all vitals normal"}
              </p>
            </div>
          </div>
        </div>

        {/* Animated Health Wave */}
        <div className="relative h-12 overflow-hidden rounded-lg bg-slate-800/30 border border-slate-700/30 mb-3">
          <div className="absolute inset-0">
            <div className="h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-cyan-400 text-sm font-medium">
              Health Monitoring Active
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="text-sm text-slate-400">
            Last updated: {formatTime(report.dateOfReport || new Date())}
          </div>
          <div className="text-cyan-400 text-sm font-medium flex items-center gap-1">
            <Eye className="h-3 w-3" />
            View Details →
          </div>
        </div>
      </div>
    </PinContainer>
  );
};

export default HealthcareCard3D;
