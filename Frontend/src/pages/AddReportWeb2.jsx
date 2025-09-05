import React from "react";
import Header from "../components/AddReportComponents/Header";
import AnimatedBackground from "../components/AddReportComponents/AnimatedBackground";
import DatabaseStatus from "../components/AddReportComponents/DatabaseStatus";
import ErrorAlert from "../components/AddReportComponents/ErrorAlert";
import PatientInfoFields from "../components/AddReportComponents/PatientInfoFields";
import DoctorLinkingFields from "../components/AddReportComponents/DoctorLinkingFields"; // New import
import TextAreaFields from "../components/AddReportComponents/TextAreaFields";
import FileUpload from "../components/AddReportComponents/FileUpload";
import MedicineManagement from "../components/AddReportComponents/MedicineManagement";
import SubmitButton from "../components/AddReportComponents/SubmitButton";
import SecurityFooter from "../components/AddReportComponents/SecurityFooter";
import AdditionalFields from "../components/AddReportComponents/AdditionalFields";
import SuccessModal from "../components/AddReportComponents/SuccessModal";
import useReportForm from "../hooks/useReportForm";

const Web2AddReport = () => {
  const {
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
    setIsIdAvailable,
  } = useReportForm();

  if (success) return <SuccessModal type="web2" />;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900">
      <AnimatedBackground />

      <div className="relative max-w-6xl mx-auto p-6">
        <Header pageType="web2" />

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <DatabaseStatus />
          <ErrorAlert error={error} />

          <form className="space-y-8" onSubmit={handleSubmitWeb2}>
            <PatientInfoFields
              formData={formData}
              handleChange={handleChange}
            />

            {/* New Doctor Linking Fields */}
            <DoctorLinkingFields
              formData={formData}
              handleChange={handleChange}
              setIsIdAvailable={setIsIdAvailable}
            />

            <AdditionalFields formData={formData} handleChange={handleChange} />
            <TextAreaFields formData={formData} handleChange={handleChange} />

            <FileUpload
              formData={formData}
              handleChange={handleChange}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleRemoveReportFile={handleRemoveReportFile}
              handleRemoveMedicineFile={handleRemoveMedicineFile}
            />

            <MedicineManagement
              formData={formData}
              medicineLoading={medicineLoading}
              handleGetMedicines={handleGetMedicines}
              showAddMedicine={showAddMedicine}
              setShowAddMedicine={setShowAddMedicine}
              newMedicine={newMedicine}
              setNewMedicine={setNewMedicine}
              handleAddMedicine={handleAddMedicine}
              editingMedicine={editingMedicine}
              setEditingMedicine={setEditingMedicine}
              handleSaveMedicine={handleSaveMedicine}
              handleDeleteMedicine={handleDeleteMedicine}
            />

            <SubmitButton
              loading={loading}
              loadingText="Uploading to Database..."
              buttonText="Upload Medical Report"
            />
            <SecurityFooter />
          </form>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500" />
    </div>
  );
};

export default Web2AddReport;
