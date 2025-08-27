import { Stethoscope, Plus, Trash2 } from "lucide-react";

const LifestyleStep = ({ formData, handleChange }) => {
  const addEmergencyContact = () => {
    const newContact = {
      name: "",
      phone: "",
      relation: "",
    };

    const updatedContacts = [...(formData.emergencyContacts || []), newContact];
    handleChange({
      target: {
        name: "emergencyContacts",
        value: updatedContacts,
      },
    });
  };

  const removeEmergencyContact = (index) => {
    const updatedContacts = formData.emergencyContacts.filter(
      (_, i) => i !== index
    );
    handleChange({
      target: {
        name: "emergencyContacts",
        value: updatedContacts,
      },
    });
  };

  const updateEmergencyContact = (index, field, value) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value,
    };

    handleChange({
      target: {
        name: "emergencyContacts",
        value: updatedContacts,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Stethoscope className="text-indigo-600" size={28} />
        Lifestyle & Emergency Contacts
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2">
            Lifestyle Information
          </h4>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Smoking Status
            </label>
            <select
              name="smokingStatus"
              value={formData.smokingStatus}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
            >
              <option value="">Select Status</option>
              <option value="never">Never Smoked</option>
              <option value="former">Former Smoker</option>
              <option value="current">Current Smoker</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alcohol Consumption
            </label>
            <select
              name="alcoholConsumption"
              value={formData.alcoholConsumption}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
            >
              <option value="">Select Frequency</option>
              <option value="never">Never</option>
              <option value="occasionally">Occasionally</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Exercise Frequency
            </label>
            <select
              name="exerciseFrequency"
              value={formData.exerciseFrequency}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
            >
              <option value="">Select Frequency</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light (1-2 times/week)</option>
              <option value="moderate">Moderate (3-4 times/week)</option>
              <option value="active">Very Active (5+ times/week)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Diet Type
            </label>
            <select
              name="dietType"
              value={formData.dietType}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
            >
              <option value="">Select Diet</option>
              <option value="omnivore">Omnivore</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Ketogenic</option>
              <option value="mediterranean">Mediterranean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sleep Duration (hours/night)
            </label>
            <input
              name="sleepDuration"
              type="number"
              min="1"
              max="24"
              placeholder="8"
              value={formData.sleepDuration}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 transition-all duration-300"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-700 border-b-2 border-red-200 pb-2">
              Emergency Contacts
            </h4>
            <button
              type="button"
              onClick={addEmergencyContact}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={16} />
              Add Contact
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(formData.emergencyContacts || []).map((contact, index) => (
              <div
                key={index}
                className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-semibold text-gray-700">
                    Contact {index + 1}
                  </h5>
                  {formData.emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="Emergency contact name"
                    value={contact.name}
                    onChange={(e) =>
                      updateEmergencyContact(index, "name", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Emergency contact phone"
                    value={contact.phone}
                    onChange={(e) =>
                      updateEmergencyContact(index, "phone", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relationship
                  </label>
                  <select
                    value={contact.relation}
                    onChange={(e) =>
                      updateEmergencyContact(index, "relation", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-400 transition-all duration-300"
                    required
                  >
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            ))}

            {(!formData.emergencyContacts ||
              formData.emergencyContacts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No emergency contacts added yet.</p>
                <p className="text-sm">
                  Click "Add Contact" to add your first emergency contact.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleStep;
