import React from "react";

const timingOptions = [
  "Early Morning",
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
];

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

export default TimingTagEditor;
