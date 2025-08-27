import React from "react";
import { Plus, X } from "lucide-react";
import TimingSelector from "./TimingSelector";

const AddMedicineForm = ({
  showAddMedicine,
  setShowAddMedicine,
  newMedicine,
  setNewMedicine,
  handleAddMedicine,
}) => {
  if (!showAddMedicine) return null;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-medium text-white mb-4">Add New Medicine</h3>
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
            <span>Add Medicine</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddMedicine(false)}
            className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineForm;
