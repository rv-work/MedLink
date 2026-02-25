import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  User,
  Hospital,
  Calendar,
  Stethoscope,
  Download,
  Shield,
  Globe,
  Link,
  Clock,
  Pill,
  Activity,
  ChevronLeft,
  Share2,
  Lock,
  ImageIcon,
  Sparkles,
  MessageCircle,
  Weight,
  Thermometer,
  Monitor,
  FileText,
  Eye,
  Folder,
  TrendingUp,
  Zap,
  ChevronRight,
  ChevronLeftIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MedicationSummaryDisplay from "@/components/Summary";
import toast from "react-hot-toast";

const ReportInDetail = () => {
  const [report, setReport] = useState(null);
  const [web3Files, setWeb3Files] = useState([]);
  const [summaryResult, setSummaryResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentMedicineIndex, setCurrentMedicineIndex] = useState(0);
  const { id } = useParams();
  const { contractInstance, connectWallet } = useWeb3();
  const navigateTo = useNavigate();

  const fetchReport = async () => {
    try {
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/user/reports/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const data = await response.json();
      setReport(data.report);

      // Handle Web3 report file fetching
      if (data.report.type === "web3") {
        if (!contractInstance) {
          await connectWallet();
        } else {
          await fetchWeb3Files(data.userId, data.report._id);
        }
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to fetch report");
    }
  };

  const fetchWeb3Files = async (userId, reportId) => {
    try {
      setFilesLoading(true);

      // Get report files from blockchain
      const reportFiles = await contractInstance.getReportFiles(
        userId,
        reportId,
      );

      // Transform blockchain data to usable format
      const formattedFiles = reportFiles.map((file, index) => ({
        id: index,
        fileName: file.fileName,
        fileType: file.fileType,
        ipfsHash: file.ipfsHash,
        ipfsUrl: file.ipfsHash.startsWith("ipfs://")
          ? `https://ipfs.io/ipfs/${file.ipfsHash.replace("ipfs://", "")}`
          : `https://ipfs.io/ipfs/${file.ipfsHash}`,
        isReportFile: file.fileName !== "Medicine List",
        isMedicineFile: file.fileName === "Medicine List",
      }));

      setWeb3Files(formattedFiles);
      console.log("Web3 files fetched:", formattedFiles);
    } catch (error) {
      console.error("Error fetching Web3 files:", error);
      toast.error("Failed to fetch blockchain files");
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Fetch Web3 files when contract instance becomes available
    if (report?.type === "web3" && contractInstance && !web3Files.length) {
      fetchWeb3Files(report.userId || report.owner?._id, report._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractInstance, report]);

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleGetSummary = async () => {
    try {
      setLoading(true);

      console.log("reportID : ", report._id);

      const response = await axios.get(
        `https://medlink-bh5c.onrender.com/api/user/report-summary?reportId=${report._id}`,
        {
          withCredentials: true,
        },
      );

      setSummaryResult(response.data.summary);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to extract summary. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || fileUrl.split("/").pop() || "file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("File downloaded successfully");
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
    }
  };

  const getReportTypeIcon = (type) => {
    const iconMap = {
      "Blood Test": <Activity className="w-5 h-5" />,
      "X-Ray": <Monitor className="w-5 h-5" />,
      MRI: <Monitor className="w-5 h-5" />,
      "CT Scan": <Monitor className="w-5 h-5" />,
      ECG: <Heart className="w-5 h-5" />,
      "General Checkup": <Stethoscope className="w-5 h-5" />,
      Other: <FileText className="w-5 h-5" />,
    };
    return iconMap[type] || <FileText className="w-5 h-5" />;
  };

  // Get files based on report type
  const getReportFiles = () => {
    if (report?.type === "web3") {
      return web3Files.filter((file) => file.isReportFile);
    }
    return report?.reportFiles || [];
  };

  const getMedicineFiles = () => {
    if (report?.type === "web3") {
      return web3Files.filter((file) => file.isMedicineFile);
    }
    return report?.medicineListFiles || [];
  };

  const reportFiles = getReportFiles();
  const medicineFiles = getMedicineFiles();

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">
              Loading your health report...
            </p>
            <p className="text-gray-600">
              Please wait while we fetch your medical data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-4 -left-4 w-96 h-96 bg-gradient-to-tr from-teal-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 animate-pulse"></div>
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="group p-3 cursor-pointer bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 transition-all duration-300">
                <ChevronLeft className="w-6 h-6 text-black group-hover:text-blue-100" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  report.type === "web3"
                    ? "bg-green-500/20 text-green-100 border border-green-400/30"
                    : "bg-blue-500/20 text-blue-100 border border-blue-400/30"
                }`}
              >
                {report.type === "web3" ? (
                  <div className="flex items-center text-black space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Blockchain Secured</span>
                  </div>
                ) : (
                  <div className="flex items-center text-black space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Standard Report</span>
                  </div>
                )}
              </div>

              <button className="group p-3 cursor-pointer bg-black/10 backdrop-blur-sm rounded-xl border border-black/20 hover:bg-black/20 transition-all duration-300">
                <Share2 className="w-5 h-5 text-black group-hover:text-blue-100" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Patient & Owner Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patient Information */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Patient Information</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {getInitials(report.patientName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {report.patientName}
                    </h3>
                    <p className="text-gray-600">Patient</p>
                    {report.ageAtReport && (
                      <p className="text-sm text-gray-500">
                        Age: {report.ageAtReport} years
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Doctor</p>
                      <p className="font-medium text-gray-800">
                        {report.doctorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Hospital className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hospital</p>
                      <p className="font-medium text-gray-800">
                        {report.hospital}
                      </p>
                    </div>
                  </div>

                  {report.department && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <Folder className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium text-gray-800">
                          {report.department}
                        </p>
                      </div>
                    </div>
                  )}

                  {report.reportType && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      {getReportTypeIcon(report.reportType)}
                      <div>
                        <p className="text-sm text-gray-600">Report Type</p>
                        <p className="font-medium text-gray-800">
                          {report.reportType}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-sm text-gray-600">Report Date</p>
                      <p className="font-medium text-gray-800">
                        {formatDate(report.dateOfReport)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals */}
            {report.vitals && Object.keys(report.vitals).length > 0 && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Heart className="w-5 h-5" />
                    <span>Vital Signs</span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-3">
                    {report.vitals.bloodPressure && (
                      <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Blood Pressure
                          </p>
                          <p className="font-medium text-gray-800">
                            {report.vitals.bloodPressure} mmHg
                          </p>
                        </div>
                      </div>
                    )}

                    {report.vitals.heartRate && (
                      <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
                        <Heart className="w-5 h-5 text-pink-600" />
                        <div>
                          <p className="text-sm text-gray-600">Heart Rate</p>
                          <p className="font-medium text-gray-800">
                            {report.vitals.heartRate} bpm
                          </p>
                        </div>
                      </div>
                    )}

                    {report.vitals.temperature && (
                      <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl">
                        <Thermometer className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Temperature</p>
                          <p className="font-medium text-gray-800">
                            {report.vitals.temperature}°F
                          </p>
                        </div>
                      </div>
                    )}

                    {report.vitals.oxygenSaturation && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Oxygen Saturation
                          </p>
                          <p className="font-medium text-gray-800">
                            {report.vitals.oxygenSaturation}%
                          </p>
                        </div>
                      </div>
                    )}

                    {report.vitals.weight && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                        <Weight className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Weight</p>
                          <p className="font-medium text-gray-800">
                            {report.vitals.weight} kg
                          </p>
                        </div>
                      </div>
                    )}

                    {report.vitals.height && (
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Height</p>
                          <p className="font-medium text-gray-800">
                            {report.vitals.height} cm
                          </p>
                        </div>
                      </div>
                    )}

                    {report.vitals.bmi && (
                      <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl">
                        <Monitor className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-600">BMI</p>
                          <p className="font-medium text-gray-800">
                            {report.vitals.bmi}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Report Owner */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Report Owner</span>
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {getInitials(report.owner.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {report.owner.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {report.owner.email}
                    </p>
                  </div>
                </div>

                {report.owner.walletAddress && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded-lg break-all">
                      {report.owner.walletAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Actions
              </h3>

              <div className="space-y-3">
                {report.type === "web3" && report.blockchainTxHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${report.blockchainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    <Link className="w-5 h-5" />
                    <span>View on Blockchain</span>
                  </a>
                )}
                <button
                  onClick={() => navigateTo(`/reports/${report._id}/ask`)}
                  className="w-full cursor-pointer flex items-center justify-center space-x-3 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 px-4 rounded-xl font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Ask AI About Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Report Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diagnosis Summary */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Diagnosis Summary</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {report.diagnosisSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason for Checkup */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Reason for Checkup</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {report.reasonOfCheckup}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Pill className="w-5 h-5" />
                  <span>Prescription & Treatment</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {report.prescription}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Files */}
            {(reportFiles.length > 0 || filesLoading) && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ImageIcon className="w-6 h-6" />
                    Medical Report Files
                    {reportFiles.length > 1 && (
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {currentFileIndex + 1} of {reportFiles.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {filesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">
                        Loading files from blockchain...
                      </p>
                    </div>
                  ) : reportFiles.length > 0 ? (
                    <div className="space-y-4">
                      {/* Current file display */}
                      <div className="relative group">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                              <p className="font-semibold text-gray-800">
                                {reportFiles[currentFileIndex]?.fileName ||
                                  reportFiles[currentFileIndex]?.name ||
                                  `Report File ${currentFileIndex + 1}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {reportFiles[currentFileIndex]?.fileType ||
                                  reportFiles[currentFileIndex]?.type ||
                                  "Unknown type"}
                              </p>
                              {report.type === "web3" && (
                                <p className="text-xs text-green-600 font-medium">
                                  <Shield className="w-3 h-3 inline mr-1" />
                                  Blockchain Secured
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const fileUrl =
                                  report.type === "web3"
                                    ? reportFiles[currentFileIndex]?.ipfsUrl
                                    : reportFiles[currentFileIndex]?.fileUrl;
                                const fileName =
                                  reportFiles[currentFileIndex]?.fileName ||
                                  reportFiles[currentFileIndex]?.name ||
                                  `Report_File_${currentFileIndex + 1}`;
                                handleDownloadFile(fileUrl, fileName);
                              }}
                              className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                              title="Download File"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Navigation for multiple files */}
                        {reportFiles.length > 1 && (
                          <div className="flex justify-center items-center space-x-4 mt-4">
                            <button
                              onClick={() =>
                                setCurrentFileIndex(
                                  Math.max(0, currentFileIndex - 1),
                                )
                              }
                              disabled={currentFileIndex === 0}
                              className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600">
                              {currentFileIndex + 1} of {reportFiles.length}
                            </span>
                            <button
                              onClick={() =>
                                setCurrentFileIndex(
                                  Math.min(
                                    reportFiles.length - 1,
                                    currentFileIndex + 1,
                                  ),
                                )
                              }
                              disabled={
                                currentFileIndex === reportFiles.length - 1
                              }
                              className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Image preview if it's an image file */}
                        {reportFiles[currentFileIndex]?.fileType
                          ?.toLowerCase()
                          .includes("image") && (
                          <div className="mt-2">
                            <img
                              src={
                                report.type === "web3"
                                  ? reportFiles[currentFileIndex]?.ipfsUrl
                                  : reportFiles[currentFileIndex]?.fileUrl
                              }
                              alt={
                                reportFiles[currentFileIndex]?.fileName ||
                                "Report File"
                              }
                              className="max-w-full h-auto rounded-lg shadow-lg border-4 border-white mx-auto transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No report files available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medicine List Files */}
            {(medicineFiles.length > 0 ||
              (report.type === "web3" && filesLoading)) && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Pill className="w-6 h-6" />
                    Medicine List Files
                    {medicineFiles.length > 1 && (
                      <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                        {currentMedicineIndex + 1} of {medicineFiles.length}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {filesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">
                        Loading medicine files from blockchain...
                      </p>
                    </div>
                  ) : medicineFiles.length > 0 ? (
                    <div className="space-y-4">
                      {/* Current medicine file display */}
                      <div className="relative group">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <Pill className="w-8 h-8 text-emerald-600" />
                            <div>
                              <p className="font-semibold text-gray-800">
                                {medicineFiles[currentMedicineIndex]
                                  ?.fileName ||
                                  medicineFiles[currentMedicineIndex]?.name ||
                                  `Medicine List ${currentMedicineIndex + 1}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {medicineFiles[currentMedicineIndex]
                                  ?.fileType ||
                                  medicineFiles[currentMedicineIndex]?.type ||
                                  "Unknown type"}
                              </p>
                              {report.type === "web3" && (
                                <p className="text-xs text-green-600 font-medium">
                                  <Shield className="w-3 h-3 inline mr-1" />
                                  Blockchain Secured
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const fileUrl =
                                  report.type === "web3"
                                    ? medicineFiles[currentMedicineIndex]
                                        ?.ipfsUrl
                                    : medicineFiles[currentMedicineIndex]
                                        ?.fileUrl;
                                window.open(fileUrl, "_blank");
                              }}
                              className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors"
                              title="View Medicine List"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const fileUrl =
                                  report.type === "web3"
                                    ? medicineFiles[currentMedicineIndex]
                                        ?.ipfsUrl
                                    : medicineFiles[currentMedicineIndex]
                                        ?.fileUrl;
                                const fileName =
                                  medicineFiles[currentMedicineIndex]
                                    ?.fileName ||
                                  medicineFiles[currentMedicineIndex]?.name ||
                                  `Medicine_List_${currentMedicineIndex + 1}`;
                                handleDownloadFile(fileUrl, fileName);
                              }}
                              className="p-2 bg-teal-100 hover:bg-teal-200 text-teal-600 rounded-lg transition-colors"
                              title="Download Medicine List"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Navigation for multiple medicine files */}
                        {medicineFiles.length > 1 && (
                          <div className="flex justify-center items-center space-x-4 mt-4">
                            <button
                              onClick={() =>
                                setCurrentMedicineIndex(
                                  Math.max(0, currentMedicineIndex - 1),
                                )
                              }
                              disabled={currentMedicineIndex === 0}
                              className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-600">
                              {currentMedicineIndex + 1} of{" "}
                              {medicineFiles.length}
                            </span>
                            <button
                              onClick={() =>
                                setCurrentMedicineIndex(
                                  Math.min(
                                    medicineFiles.length - 1,
                                    currentMedicineIndex + 1,
                                  ),
                                )
                              }
                              disabled={
                                currentMedicineIndex ===
                                medicineFiles.length - 1
                              }
                              className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Image preview for medicine files */}
                        {medicineFiles[currentMedicineIndex]?.fileType
                          ?.toLowerCase()
                          .includes("image") && (
                          <div className="mt-2">
                            <img
                              src={
                                report.type === "web3"
                                  ? medicineFiles[currentMedicineIndex]?.ipfsUrl
                                  : medicineFiles[currentMedicineIndex]?.fileUrl
                              }
                              alt={
                                medicineFiles[currentMedicineIndex]?.fileName ||
                                "Medicine List"
                              }
                              className="max-w-full h-auto rounded-lg shadow-lg border-4 border-white mx-auto transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No medicine files available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Blockchain Details for Web3 reports */}
            {report.type === "web3" && (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Blockchain Details</span>
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {report.blockchainTxHash && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Transaction Hash
                      </p>
                      <p className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">
                        {report.blockchainTxHash}
                      </p>
                    </div>
                  )}

                  {web3Files.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">IPFS Storage</p>
                      <div className="space-y-2">
                        {web3Files.map((file) => (
                          <div
                            key={file.id}
                            className="bg-gray-100 p-2 rounded"
                          >
                            <p className="text-sm font-medium">
                              {file.fileName}
                            </p>
                            <p className="font-mono text-xs text-gray-600 break-all">
                              {file.ipfsHash}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>
                      This report is cryptographically secured on the blockchain
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prescribed Medicines Table */}
        {report.medicines && report.medicines.length > 0 && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden mt-6">
            <div className="bg-gradient-to-r flex justify-between from-cyan-500 to-blue-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Pill className="w-5 h-5" />
                <span>Prescribed Medicines</span>
              </h2>
              <div className="mt-6">
                <button
                  onClick={handleGetSummary}
                  className="px-5 py-2 cursor-pointer bg-gradient-to-r from-blue-400 to-blue-600 
                    hover:bg-blue-900 text-white rounded-lg font-medium transition"
                  disabled={loading}
                >
                  {loading ? "Collecting..." : "Get AI Summary"}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                        Medicine Name
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                        Dose
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                        Frequency
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                        Timing
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.medicines.map((medicine, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">
                          {medicine.name}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-600">
                          {medicine.dose}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-600">
                          {medicine.frequency}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-gray-600">
                          {medicine.quantity}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {medicine.timing.map((time, timeIndex) => (
                              <span
                                key={timeIndex}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary Results */}
        {summaryResult.length > 0 && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl border mt-10 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>AI Medication Analysis</span>
              </h2>
            </div>
            <div className="p-6">
              <MedicationSummaryDisplay summaryResult={summaryResult} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportInDetail;
