import React from "react";
import { Pill, Sparkles, Plus, Loader2 } from "lucide-react";
import MedicineItem from "./MedicineItem";
import AddMedicineForm from "./AddMedicineForm";

const MedicineManagement = ({
  formData,
  medicineLoading,
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
}) => {
  return (
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
            disabled={medicineLoading || !formData.medicineFile}
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
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      <AddMedicineForm
        showAddMedicine={showAddMedicine}
        setShowAddMedicine={setShowAddMedicine}
        newMedicine={newMedicine}
        setNewMedicine={setNewMedicine}
        handleAddMedicine={handleAddMedicine}
      />

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
                handleSaveMedicine={handleSaveMedicine}
                handleDeleteMedicine={handleDeleteMedicine}
                editingMedicine={editingMedicine}
                setEditingMedicine={setEditingMedicine}
              />
            ))}
          </div>
        </div>
      )}

      {formData.medicines.length === 0 && (
        <div className="text-center py-8 text-white/50">
          <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No medicines added yet.</p>
          <p className="text-sm mt-1">
            Upload a report and extract medicines or add them manually.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
