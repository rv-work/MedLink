import React, { useState } from "react";
import { Edit2, Trash2, Check, X } from "lucide-react";
import TimingTagEditor from "./TimingTagEditor";

const MedicineItem = ({
  medicine,
  index,
  handleSaveMedicine,
  handleDeleteMedicine,
  editingMedicine,
  setEditingMedicine,
}) => {
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

  const handleEdit = () => {
    setEditingMedicine(index);
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
              onClick={handleEdit}
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

export default MedicineItem;
