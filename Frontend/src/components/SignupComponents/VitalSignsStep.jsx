import { Heart, Activity, Droplet } from "lucide-react";

const VitalSignsStep = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Heart className="text-red-600" size={28} />
        Vital Signs & Health Metrics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-100 to-pink-100 p-6 rounded-xl shadow-lg">
          <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Heart className="text-red-500" size={18} />
            Blood Pressure (mmHg)
          </label>
          <div className="flex gap-3">
            <input
              name="bloodPressureSystolic"
              type="number"
              placeholder="120"
              value={formData.bloodPressureSystolic}
              onChange={handleChange}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
            />
            <span className="text-2xl text-gray-400 self-center">/</span>
            <input
              name="bloodPressureDiastolic"
              type="number"
              placeholder="80"
              value={formData.bloodPressureDiastolic}
              onChange={handleChange}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">Systolic / Diastolic</p>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-6 rounded-xl shadow-lg">
          <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Droplet className="text-blue-500" size={18} />
            Blood Sugar (mg/dL)
          </label>
          <input
            name="bloodSugar"
            type="number"
            placeholder="100"
            value={formData.bloodSugar}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-400 transition-all duration-300"
          />
          <p className="text-xs text-gray-500 mt-2">Fasting glucose level</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-6 rounded-xl shadow-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Cholesterol (mg/dL)
          </label>
          <input
            name="cholesterol"
            type="number"
            placeholder="200"
            value={formData.cholesterol}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-400 transition-all duration-300"
          />
          <p className="text-xs text-gray-500 mt-2">Total cholesterol</p>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-xl shadow-lg">
          <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Activity className="text-green-500" size={18} />
            Heart Rate (BPM)
          </label>
          <input
            name="heartRate"
            type="number"
            placeholder="72"
            value={formData.heartRate}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-400 transition-all duration-300"
          />
          <p className="text-xs text-gray-500 mt-2">Resting heart rate</p>
        </div>
      </div>
    </div>
  );
};

export default VitalSignsStep;
