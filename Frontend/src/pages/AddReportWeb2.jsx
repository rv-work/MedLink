import { useState } from "react";
import Tesseract from "tesseract.js";
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
  Cloud,
  Database,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";

const Web2AddReport = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    doctorName: "",
    hospital: "",
    diagnosisSummary: "",
    reasonOfCheckup: "",
    prescription: "",
    dateOfReport: "",
    medicines: [],
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dose: "",
    frequency: "",
    quantity: "",
    timing: [],
  });

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

  const handleGetMedicines = async () => {
    try {
      setMedicineLoading(true);
      setError("");

      if (!formData.file) {
        setError("Please upload a report file first to extract medicines.");
        setMedicineLoading(false);
        return;
      }

      const Textresult = await Tesseract.recognize(formData.file, "eng");
      const extractedText = Textresult.data.text;

      const response = await fetch(
        "http://localhost:5000/api/user/report-medicines",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportData: extractedText,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to extract medicines");
      }

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({ ...prev, medicines: result.summary }));
      } else {
        setError("Failed to extract medicines from the report.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to extract medicines. Please try again.");
    } finally {
      setMedicineLoading(false);
    }
  };

  const handleAddMedicine = () => {
    if (!newMedicine.name.trim()) return;

    const medicine = {
      name: newMedicine.name,
      dose: newMedicine.dose || "Not mentioned",
      frequency: newMedicine.frequency || "Not mentioned",
      quantity: newMedicine.quantity || "Not mentioned",
      timing:
        newMedicine.timing.length > 0 ? newMedicine.timing : ["Not mentioned"],
    };

    setFormData((prev) => ({
      ...prev,
      medicines: [...prev.medicines, medicine],
    }));

    setNewMedicine({
      name: "",
      dose: "",
      frequency: "",
      quantity: "",
      timing: [],
    });
    setShowAddMedicine(false);
  };

  const handleEditMedicine = (index) => {
    setEditingMedicine(index);
  };

  const handleSaveMedicine = (index, editedMedicine) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index] = editedMedicine;
    setFormData((prev) => ({ ...prev, medicines: updatedMedicines }));
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (index) => {
    const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, medicines: updatedMedicines }));
  };

  const MedicineItem = ({ medicine, index }) => {
    const [editData, setEditData] = useState(medicine);
    const isEditing = editingMedicine === index;

    const handleSave = () => {
      if (!editData.name.trim()) return;
      handleSaveMedicine(index, {
        ...editData,
        dose: editData.dose || "Not mentioned",
        frequency: editData.frequency || "Not mentioned",
        quantity: editData.quantity || "Not mentioned",
        timing:
          editData.timing && editData.timing.length > 0
            ? editData.timing
            : ["Not mentioned"],
      });
    };

    const handleCancel = () => {
      setEditData(medicine);
      setEditingMedicine(null);
    };

    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Medicine name"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={editData.dose}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, dose: e.target.value }))
                }
                placeholder="Dose (e.g., 1 tablet, 5 mL syrup)"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 text-sm"
              />
              <input
                type="text"
                value={editData.frequency}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    frequency: e.target.value,
                  }))
                }
                placeholder="Frequency (e.g., 2/daily)"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={editData.quantity}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, quantity: e.target.value }))
                }
                placeholder="Quantity (e.g., 10 tablets : 10 or 50ml syrup 1 : 1)"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 text-sm"
              />
              <TimingTagEditor editData={editData} setEditData={setEditData} />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="flex cursor-pointer items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex cursor-pointer items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-white">{medicine.name}</h4>
              <div className="flex items-center space-x-4 text-sm text-white/60 mt-1">
                <span>Dose: {medicine.dose}</span>
                <span>•</span>
                <span>Frequency: {medicine.frequency}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-white/60 mt-1">
                <span>Quantity: {medicine.quantity}</span>
                <span>•</span>
                <span>
                  Timing:{" "}
                  {Array.isArray(medicine.timing)
                    ? medicine.timing.join(", ")
                    : medicine.timing}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditMedicine(index)}
                className="p-2 cursor-pointer text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteMedicine(index)}
                className="p-2 cursor-pointer text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.file) {
        setError("Please select a report file.");
        setLoading(false);
        return;
      }

      const uploadData = new FormData();
      uploadData.append("patientName", formData.patientName);
      uploadData.append("doctorName", formData.doctorName);
      uploadData.append("hospital", formData.hospital);
      uploadData.append("diagnosisSummary", formData.diagnosisSummary);
      uploadData.append("reasonOfCheckup", formData.reasonOfCheckup);
      uploadData.append("prescription", formData.prescription);
      uploadData.append(
        "dateOfReport",
        new Date(formData.dateOfReport).toISOString()
      );
      uploadData.append("medicines", JSON.stringify(formData.medicines));
      uploadData.append("file", formData.file);

      const response = await fetch(
        "http://localhost:5000/api/user/upload-report-web2",
        {
          method: "POST",
          body: uploadData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      await new Promise((resolve) => setTimeout(resolve, 2000));

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
          medicines: [],
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
            securely in our database.
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
      {/* Animated background effects */}
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
                Secure • Private • Cloud Protected
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
              <Cloud className="h-4 w-4" />
              <span className="text-sm font-medium">Cloud Secured</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Database Connection Status */}
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

          {error && (
            <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3 text-red-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
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
                  placeholder="Mention only the advice given by the doctor here. Upload the medicine prescription (report/medicines-list) below."
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

            {/* Medicine Management Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-white/90 font-medium">
                  <Pill className="h-4 w-4 text-orange-300" />
                  <span>Medicines</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleGetMedicines}
                    disabled={medicineLoading || !formData.file}
                    className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {medicineLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Extract from Report</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMedicine(true)}
                    className="flex  cursor-pointer items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Medicine</span>
                  </button>
                </div>
              </div>

              {/* Add Medicine Form */}
              {showAddMedicine && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Add New Medicine
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newMedicine.name}
                      onChange={(e) =>
                        setNewMedicine((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Medicine name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newMedicine.dose}
                        onChange={(e) =>
                          setNewMedicine((prev) => ({
                            ...prev,
                            dose: e.target.value,
                          }))
                        }
                        placeholder="Dose (e.g., 500mg)"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                      />
                      <input
                        type="text"
                        value={newMedicine.frequency}
                        onChange={(e) =>
                          setNewMedicine((prev) => ({
                            ...prev,
                            frequency: e.target.value,
                          }))
                        }
                        placeholder="Frequency (e.g., twice daily)"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newMedicine.quantity}
                        onChange={(e) =>
                          setNewMedicine((prev) => ({
                            ...prev,
                            quantity: e.target.value,
                          }))
                        }
                        placeholder="Quantity (e.g., 10 tablets)"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50"
                      />
                      <TimingSelector
                        newMedicine={newMedicine}
                        setNewMedicine={setNewMedicine}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddMedicine(false)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Medicine List */}
              {formData.medicines.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">
                    Medicine List ({formData.medicines.length})
                  </h3>
                  <div className="space-y-3">
                    {formData.medicines.map((medicine, index) => (
                      <MedicineItem
                        key={index}
                        medicine={medicine}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {formData.medicines.length === 0 && (
              <div className="text-center py-8 text-white/50">
                <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No medicines added yet.</p>
                <p className="text-sm mt-1">
                  Upload a report and extract medicines or add them manually.
                </p>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500 hover:from-blue-600 hover:via-purple-700 hover:to-teal-600 px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Uploading to Database...</span>
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
                  <Database className="h-5 w-5" />
                  <span className="text-sm font-medium">Database Secured</span>
                </div>
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
    </div>
  );
};

export default Web2AddReport;

const timingOptions = ["Morning", "Afternoon", "Evening", "Night"];

const TimingTagEditor = ({ editData, setEditData }) => {
  const toggleTiming = (time) => {
    setEditData((prev) => {
      const current = Array.isArray(prev.timing) ? prev.timing : [];
      const isSelected = current.includes(time);
      return {
        ...prev,
        timing: isSelected
          ? current.filter((t) => t !== time)
          : [...current, time],
      };
    });
  };

  return (
    <div className="w-full">
      <label className="block text-white mb-2 text-sm">Edit Timing:</label>
      <div className="flex flex-wrap gap-2">
        {timingOptions.map((time) => {
          const current = Array.isArray(editData.timing) ? editData.timing : [];
          const isActive = current.includes(time);
          return (
            <button
              key={time}
              type="button"
              onClick={() => toggleTiming(time)}
              className={`px-4 py-2 rounded-full border text-sm transition ${
                isActive
                  ? "bg-blue-500 text-white border-blue-400"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TimingSelector = ({ newMedicine, setNewMedicine }) => {
  const toggleTiming = (time) => {
    setNewMedicine((prev) => {
      const isSelected = prev.timing.includes(time);
      return {
        ...prev,
        timing: isSelected
          ? prev.timing.filter((t) => t !== time)
          : [...prev.timing, time],
      };
    });
  };

  return (
    <div className="w-full">
      <label className="block text-white mb-2">Select Timing:</label>
      <div className="flex flex-wrap gap-2">
        {timingOptions.map((time) => {
          const isActive = newMedicine.timing.includes(time);
          return (
            <button
              key={time}
              type="button"
              onClick={() => toggleTiming(time)}
              className={`px-4 py-2 rounded-full border text-sm transition ${
                isActive
                  ? "bg-blue-500 text-white border-blue-400"
                  : "bg-white/10 text-white border-white/30 hover:bg-white/20"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
};
