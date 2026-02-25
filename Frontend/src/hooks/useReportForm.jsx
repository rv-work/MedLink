import { useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import { useWeb3 } from "../context/Web3Context";
import { UploadToIPFS } from "../utils/IPFSUpload";

const useReportForm = () => {
  const { contractInstance, address } = useWeb3();

  const [formData, setFormData] = useState({
    patientName: "John Doe",
    doctorName: "Dr. SELF",
    hospital: "NEW NEELA MEDICAL STORE",
    diagnosisSummary:
      "Patient reported mild fever (99.5°F), frontal headache, nasal congestion, and chills. Symptoms suggestive of viral upper respiratory tract infection (common cold). No signs of bacterial infection observed. Vitals within normal limits.",
    reasonOfCheckup:
      "Fever, headache, and cold symptoms such as sneezing and body chills.",
    prescription:
      "Take adequate rest, stay well-hydrated, and maintain a light, nutritious diet. Use steam inhalation twice a day to relieve nasal congestion. Monitor your temperature regularly and avoid cold or refrigerated food. If symptoms persist beyond 5 days or worsen, consult your doctor again.",
    dateOfReport: "2025-07-01",
    reportType: "General Checkup",
    department: "General Medicine",
    ageAtReport: "32",
    vitals: {
      bloodPressure: "120/80",
      heartRate: "72",
      temperature: "99.5",
      oxygenSaturation: "98",
      weight: "70",
      height: "175",
      bmi: "22.9",
    },
    doctorMedlinkId: "",
    medicines: [
      {
        name: "Pacimol-Active Tab",
        dose: "1",
        frequency: "3",
        quantity: "9",
        timing: ["Morning", "Afternoon", "Evening"],
      },
      {
        name: "Foloup-200 Tab",
        dose: "1",
        frequency: "2",
        quantity: "6",
        timing: ["Morning", "Evening"],
      },
      {
        name: "Predicort-4mg Tab",
        dose: "1",
        frequency: "2",
        quantity: "6",
        timing: ["Morning", "Evening"],
      },
      {
        name: "Beplex Forte Tab",
        dose: "1",
        frequency: "2",
        quantity: "6",
        timing: ["Morning", "Evening"],
      },
      {
        name: "Malrid Tab",
        dose: "1",
        frequency: "1",
        quantity: "3",
        timing: ["Night"],
      },
      {
        name: "Fultos Tab",
        dose: "1",
        frequency: "1",
        quantity: "3",
        timing: ["Night"],
      },
      {
        name: "Rabobenz-DSR Cap",
        dose: "1",
        frequency: "1",
        quantity: "3",
        timing: ["Early Morning"],
      },
    ],
    reportFiles: [],
    medicineFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dose: "",
    frequency: "",
    quantity: "",
    timing: [],
  });

  const resetForm = () => {
    setFormData({
      patientName: "",
      doctorName: "",
      hospital: "",
      diagnosisSummary: "",
      reasonOfCheckup: "",
      prescription: "",
      dateOfReport: "",
      reportType: "General Checkup",
      department: "",
      ageAtReport: "",
      doctorMedlinkId: "",
      vitals: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        bmi: "",
      },
      medicines: [],
      reportFiles: [],
      medicineFile: null,
    });
    setError("");
  };
  const handleChange = (e) => {
    const { name, value, files, checked } = e.target;

    if (name === "reportFiles") {
      const newFiles = Array.from(files).filter(
        (f) =>
          !formData.reportFiles.some(
            (ex) => ex.name === f.name && ex.size === f.size,
          ),
      );
      setFormData((p) => ({
        ...p,
        reportFiles: [...p.reportFiles, ...newFiles].slice(0, 5),
      }));
    } else if (name === "medicineFile") {
      setFormData((p) => ({ ...p, medicineFile: files[0] || null }));
    } else if (name.startsWith("vitals.")) {
      const vital = name.split(".")[1];
      setFormData((p) => ({ ...p, vitals: { ...p.vitals, [vital]: value } }));
    } else if (name === "linkDoctor") {
      setFormData((p) => ({
        ...p,
        linkDoctor: checked,
        doctorMedlinkId: "",
        linkedDoctorInfo: null,
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const uploadType = e.target
        .closest("[data-upload-type]")
        ?.getAttribute("data-upload-type");

      if (uploadType === "medicine") {
        setFormData((p) => ({ ...p, medicineFile: files[0] }));
      } else {
        setFormData((p) => ({
          ...p,
          reportFiles: [...p.reportFiles, ...files].slice(0, 5),
        }));
      }
    }
  };

  const handleRemoveReportFile = (i) =>
    setFormData((p) => ({
      ...p,
      reportFiles: p.reportFiles.filter((_, idx) => idx !== i),
    }));

  const handleRemoveMedicineFile = () =>
    setFormData((p) => ({ ...p, medicineFile: null }));

  const handleGetMedicines = async () => {
    try {
      setMedicineLoading(true);
      setError("");
      if (!formData.medicineFile)
        return setError("Upload a medicine list file first.");

      const textResult = await Tesseract.recognize(
        formData.medicineFile,
        "eng",
      );
      const extractedText = textResult.data.text;

      const res = await fetch(
        "https://medlink-bh5c.onrender.com/api/user/report-medicines",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportData: extractedText }),
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Extraction failed");
      const result = await res.json();

      if (result.success) {
        setFormData((p) => ({ ...p, medicines: result.summary }));
      } else {
        setError("Failed to extract medicines.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to extract medicines.");
    } finally {
      setMedicineLoading(false);
    }
  };

  const handleAddMedicine = () => {
    if (!newMedicine.name.trim()) return;
    setFormData((p) => ({
      ...p,
      medicines: [
        ...p.medicines,
        {
          ...newMedicine,
          timing: newMedicine.timing.length ? newMedicine.timing : [""],
        },
      ],
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

  const handleSaveMedicine = (i, med) => {
    const updated = [...formData.medicines];
    updated[i] = med;
    setFormData((p) => ({ ...p, medicines: updated }));
    setEditingMedicine(null);
  };

  const handleDeleteMedicine = (i) =>
    setFormData((p) => ({
      ...p,
      medicines: p.medicines.filter((_, idx) => idx !== i),
    }));

  const handleSubmitWeb2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.reportFiles.length)
        return setError("Select at least one report file.");

      const uploadData = new FormData();
      uploadData.append("isIdAvailable", isIdAvailable);
      for (const key in formData) {
        if (key === "vitals" || key === "medicines")
          uploadData.append(key, JSON.stringify(formData[key]));
        else if (key === "reportFiles")
          formData.reportFiles.forEach((f) =>
            uploadData.append("reportFiles", f),
          );
        else if (key === "medicineFile" && formData.medicineFile)
          uploadData.append("medicineFile", formData.medicineFile);
        else if (key === "linkedDoctorInfo")
          uploadData.append(key, JSON.stringify(formData[key]));
        else uploadData.append(key, formData[key]);
      }
      uploadData.append(
        "dateOfReport",
        new Date(formData.dateOfReport).toISOString(),
      );

      const res = await fetch(
        "https://medlink-bh5c.onrender.com/api/user/upload-report-web2",
        {
          method: "POST",
          body: uploadData,
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Upload failed");
      await res.json();

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        resetForm();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to upload report.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWeb3 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!address || !contractInstance)
        return setError("Connect wallet first.");
      if (!formData.reportFiles.length)
        return setError("Select at least one report file.");

      const { reportFiles, medicineFile, ...reportDetails } = formData;

      // First, create the report in backend (without files)
      const reportPayload = {
        ...reportDetails,
        medicines: formData.medicines,
        dateOfReport: new Date(formData.dateOfReport),
        address,
        isIdAvailable,
        reportType: formData.reportType || "Other",
        department: formData.department || "",
        vitals: formData.vitals || {},
        ageAtReport: formData.ageAtReport
          ? parseInt(formData.ageAtReport)
          : undefined,
      };

      const res = await axios.post(
        "https://medlink-bh5c.onrender.com/api/user/upload-report-web3",
        reportPayload,
        { withCredentials: true },
      );

      const { reportId, userId } = res.data;

      // Upload all files to IPFS and prepare for blockchain storage
      const fileUploads = [];
      const fileNames = [];
      const fileTypes = [];

      // Upload report files
      for (const file of reportFiles) {
        const ipfsHash = await UploadToIPFS(file);
        fileUploads.push(ipfsHash);
        fileNames.push(file.name);
        fileTypes.push(file.type);
      }

      // Upload medicine file if present
      if (medicineFile) {
        const medicineIpfsHash = await UploadToIPFS(medicineFile);
        fileUploads.push(medicineIpfsHash);
        fileNames.push("Medicine List");
        fileTypes.push(medicineFile.type);
      }

      // Store report on blockchain with separate arrays
      const tx = await contractInstance.storeReport(
        reportId,
        userId,
        fileUploads, // string[] memory _ipfsHashes
        fileNames, // string[] memory _fileNames
        fileTypes, // string[] memory _fileTypes
      );

      const receipt = await tx.wait();

      // Update the report with blockchain transaction hash
      await axios.put(
        `https://medlink-bh5c.onrender.com/api/user/reports/${reportId}/blockchain`,
        { txHash: receipt.hash },
        { withCredentials: true },
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        resetForm();
      }, 3000);
    } catch (err) {
      console.error("Web3 upload error:", err);
      setError("Failed to upload report: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    loading,
    medicineLoading,
    error,
    success,
    dragActive,
    handleDrag,
    handleDrop,
    handleRemoveReportFile,
    handleRemoveMedicineFile,
    handleGetMedicines,
    showAddMedicine,
    setShowAddMedicine,
    newMedicine,
    setNewMedicine,
    handleAddMedicine,
    editingMedicine,
    setEditingMedicine,
    handleSaveMedicine,
    handleDeleteMedicine,
    handleSubmitWeb2,
    handleSubmitWeb3,
    setIsIdAvailable,
  };
};

export default useReportForm;
