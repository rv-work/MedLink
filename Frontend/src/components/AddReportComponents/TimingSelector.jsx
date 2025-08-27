import React from "react";

const timingOptions = [
  "Early Morning",
  "Morning",
  "Afternoon",
  "Evening",
  "Night",
];

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

export default TimingSelector;
