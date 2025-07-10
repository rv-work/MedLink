import { useState } from "react";
import {
  Upload,
  FileText,
  User,
  Stethoscope,
  Building2,
  Calendar,
  Pill,
  ClipboardList,
  Heart,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  File,
  Sparkles,
  ReceiptIcon,
} from "lucide-react";

import axios from "axios";
import { UploadToIPFS } from "../Utils/IPFSUpload.js";
import { useWeb3 } from "../context/Web3Context.jsx";

const BeautifulAddReport = () => {
  const { contractInstance, connectWallet, address } = useWeb3();
  const [formData, setFormData] = useState({
    patientName: "",
    doctorName: "",
    hospital: "",
    diagnosisSummary: "",
    reasonOfCheckup: "",
    prescription: "",
    dateOfReport: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData((prev) => ({ ...prev, file: e.dataTransfer.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { file, ...reportDetails } = formData;

      if (!file) {
        setError("Please select a report file.");
        setLoading(false);
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/user/upload-report",
        {
          ...reportDetails,
          dateOfReport: new Date(formData.dateOfReport),
          address,
        },
        { withCredentials: true }
      );

      const reportId = res.data.reportId;
      const userId = res.data.userId;

      console.log("reportid: ", reportId);
      console.log("useid: ", userId);

      const ipfsHash = await UploadToIPFS(file);

      console.log("ipfs :", ipfsHash);

      const tx = await contractInstance.storeReport(reportId, userId, ipfsHash);

      const receipt = await tx.wait();
      console.log("tr : ", receipt);
      const txHash = receipt.hash;
      console.log("hash : ", txHash);

      await axios.put(
        `http://localhost:5000/api/user/reports/${reportId}/blockchain`,
        { txHash },
        { withCredentials: true }
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          patientName: "",
          doctorName: "",
          hospital: "",
          diagnosisSummary: "",
          reasonOfCheckup: "",
          prescription: "",
          dateOfReport: "",
          file: null,
        });
      }, 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 text-center max-w-md w-full">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative bg-green-500/20 backdrop-blur-sm p-6 rounded-full border border-green-400/30 inline-block">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Success! 🎉</h2>
          <p className="text-white/80 text-lg">
            Your medical report has been uploaded successfully and stored
            securely on the blockchain.
          </p>
          <div className="flex items-center justify-center space-x-2 mt-6 text-green-400">
            <Shield className="h-5 w-5" />
            <span className="text-sm">HIPAA Compliant & Secure</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-32 right-32 w-56 h-56 bg-purple-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-bounce"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-24 h-24 bg-pink-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
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
                Secure • Private • Blockchain Protected
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2 text-green-400">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Online</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Blockchain Secured</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-400/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-orange-300">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Blockchain Connection</span>
              </div>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 px-4 py-2 rounded-lg font-semibold text-white transform hover:scale-105 transition-all duration-300"
              >
                {address
                  ? `Wallet Connected Address : ${address}`
                  : "Connect Wallet"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3 text-red-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <User className="h-4 w-4 text-blue-300" />
                  <span>Patient Name</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient's full name"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <Stethoscope className="h-4 w-4 text-green-300" />
                  <span>Doctor's Name</span>
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  placeholder="Enter doctor's name"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 focus:bg-white/15 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <Building2 className="h-4 w-4 text-purple-300" />
                  <span>Hospital/Clinic</span>
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  placeholder="Enter hospital or clinic name"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <Calendar className="h-4 w-4 text-teal-300" />
                  <span>Date of Report</span>
                </label>
                <input
                  type="date"
                  name="dateOfReport"
                  value={formData.dateOfReport}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-400/50 focus:bg-white/15 transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Text Areas */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <ClipboardList className="h-4 w-4 text-yellow-300" />
                  <span>Reason for Checkup</span>
                </label>
                <textarea
                  name="reasonOfCheckup"
                  value={formData.reasonOfCheckup}
                  onChange={handleChange}
                  placeholder="Describe the reason for the medical checkup or consultation"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <Heart className="h-4 w-4 text-red-300" />
                  <span>Diagnosis Summary</span>
                </label>
                <textarea
                  name="diagnosisSummary"
                  value={formData.diagnosisSummary}
                  onChange={handleChange}
                  placeholder="Enter the diagnosis summary and medical findings"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-red-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <Pill className="h-4 w-4 text-indigo-300" />
                  <span>Prescription & Advice</span>
                </label>
                <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleChange}
                  placeholder="List prescribed medicines, dosages, and medical advice"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-indigo-400/50 focus:bg-white/15 transition-all duration-300 resize-none"
                  required
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-white/90 font-medium">
                <Upload className="h-4 w-4 text-cyan-300" />
                <span>Upload Report File</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-cyan-400/70 bg-cyan-400/10"
                    : "border-white/30 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  name="file"
                  accept="image/*,application/pdf"
                  onChange={handleChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />

                <div className="space-y-4">
                  {formData.file ? (
                    <div className="flex items-center justify-center space-x-3 text-green-400">
                      <File className="h-8 w-8" />
                      <div>
                        <p className="font-medium">{formData.file.name}</p>
                        <p className="text-sm text-white/60">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="bg-cyan-400/20 p-4 rounded-full">
                          <Camera className="h-8 w-8 text-cyan-300" />
                        </div>
                        <div className="bg-purple-400/20 p-4 rounded-full">
                          <FileText className="h-8 w-8 text-purple-300" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white text-lg font-medium">
                          Drop your report file here or{" "}
                          <span className="text-cyan-400">click to browse</span>
                        </p>
                        <p className="text-white/60 text-sm mt-2">
                          Supports PDF, JPG, PNG files up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500 hover:from-blue-600 hover:via-purple-700 hover:to-teal-600 px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Uploading to Blockchain...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Upload Medical Report</span>
                      <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mt-8">
              <div className="flex items-center space-x-4 text-center justify-center">
                <div className="flex items-center space-x-2 text-green-400">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    End-to-End Encrypted
                  </span>
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Blockchain Verified
                  </span>
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
    </div>
  );
};

export default BeautifulAddReport;
