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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MedicationSummaryDisplay from "@/components/Summary";
import toast from "react-hot-toast";

// interface Report {
//   _id: string;
//   type: "web2" | "web3";
//   reportFileUrl?: string;
//   blockchainTxHash?: string;
//   patientName: string;
//   doctorName: string;
//   hospital: string;
//   dateOfReport: string;
//   diagnosisSummary: string;
//   reasonOfCheckup: string;
//   prescription: string;
//   medicines : [{
//     name: string;
//     dose: string;
//     frequency: string;
//     quantity : string;,
//     timing : string[]; // ['morning', 'afternoon', 'evening', 'night']
//     }]
//   owner: {
//     name: string,
//     email: string,
//     walletAddress?: string,
//   };
// }

const ReportInDetail = () => {
  const [report, setReport] = useState(null);
  const [ipfsUrl, setIpfsUrl] = useState(null);
  const [summaryResult, setSummaryResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const { contractInstance, connectWallet } = useWeb3();
  const navigateTo = useNavigate();

  const fetchReport = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user/reports/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const data = await response.json();
      setReport(data.report);

      if (data.report.type === "web3" && !contractInstance) {
        connectWallet();
      }

      if (data.report.type === "web3" && contractInstance) {
        await connectWallet();

        const reportData = await contractInstance.getReportById(
          data.userId,
          data.report._id
        );

        const cleanHash = reportData.ipfsHash.replace("ipfs://", "");
        setIpfsUrl(`https://ipfs.io/ipfs/${cleanHash}`);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, contractInstance]);

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

      console.log("reporrtID : ", report._id);

      const response = await axios.get(
        `http://localhost:5000/api/user/report-summary?reportId=${report._id}`,
        {
          withCredentials: true,
        }
      );

      setSummaryResult(response.data.summary);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to extract summary. Please try again.", error);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="relative z-10  hadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 animate-pulse"></div>
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center  space-x-4">
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
          <div className="lg:col-span-1 space-y-6">
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
                {(report.reportFileUrl || ipfsUrl) && (
                  <button
                    onClick={async () => {
                      const fileUrl = report.reportFileUrl || ipfsUrl;
                      const response = await fetch(fileUrl, { mode: "cors" });
                      const blob = await response.blob();

                      const link = document.createElement("a");
                      link.href = window.URL.createObjectURL(blob);
                      link.download = fileUrl.split("/").pop() || "report.png"; // 🧠 dynamic
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    }}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Report</span>
                  </button>
                )}

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
                  <span>Want to Ask Something?</span>
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
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <ImageIcon className="w-6 h-6" />
                  Medical Report File
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <div className="text-center">
                  {report.type === "web2" ? (
                    <div className="relative group">
                      <img
                        src={report.reportFileUrl}
                        alt="Medical Report"
                        className="max-w-full h-auto rounded-lg shadow-lg border-4 border-white mx-auto transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    </div>
                  ) : ipfsUrl ? (
                    <div className="relative group">
                      <img
                        src={ipfsUrl}
                        alt="IPFS Medical Report"
                        className="max-w-full h-auto rounded-lg shadow-lg border-4 border-white mx-auto transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        IPFS Secured
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
                        <p className="text-gray-600 font-medium">
                          Loading IPFS data...
                        </p>
                        <p className="text-sm text-gray-500">
                          Fetching from decentralized storage
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

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

                  {ipfsUrl && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">IPFS Storage</p>
                      <p className="font-mono text-sm bg-gray-100 p-3 rounded-lg break-all">
                        {ipfsUrl}
                      </p>
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
                  {loading ? "Collecting..." : "Get Summary Detail"}
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
