import { Activity } from "lucide-react";

const PhysicalDataStep = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Activity className="text-green-600" size={28} />
        Physical Measurements
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Weight (kg)
          </label>
          <input
            name="weight"
            type="number"
            placeholder="70"
            value={formData.weight}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-300"
            required
          />
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Height (cm)
          </label>
          <input
            name="height"
            type="number"
            placeholder="170"
            value={formData.height}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-300"
            required
          />
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            BMI (Auto-calculated)
          </label>
          <input
            name="bmi"
            type="text"
            value={formData.bmi}
            readOnly
            className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-gray-600 font-semibold"
            placeholder="Will calculate automatically"
          />
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Blood Group
          </label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-all duration-300"
            required
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PhysicalDataStep;
