import {
  FileText,
  AlertTriangle,
  Pill,
  Plus,
  Trash2,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { useState, useEffect } from "react";

const MedicalHistoryStep = ({ formData, handleChange }) => {
  const [allergies, setAllergies] = useState([
    {
      allergen: "Peanuts",
      type: "Food",
      severity: "Severe",
      reaction: "Anaphylaxis",
      onsetDate: "2010-05-12",
      verifiedBy: "Dr. Mehta",
      avoidanceInstructions: "Avoid peanuts and peanut oil",
      emergencyMedication: "Epinephrine auto-injector",
      lastReaction: "2021-08-22",
      notes: "Carries EpiPen at all times",
    },
  ]);

  const [chronicConditions, setChronicConditions] = useState([
    {
      conditionName: "Asthma",
      diagnosedOn: "2015-03-10",
      severityLevel: "Moderate",
      medicines: [
        {
          name: "Salbutamol",
          form: "Inhaler",
          dose: "100mcg",
          frequency: "As needed",
          timing: ["Morning", "Evening"],
        },
      ],
      triggers: ["Dust", "Cold weather", "Pollen"],
      precautions: ["Avoid dusty areas", "Use mask outdoors"],
      lastReviewDate: "2024-11-20",
    },
  ]);

  const [surgicalHistory, setSurgicalHistory] = useState([
    {
      procedure: "Appendectomy",
      date: "2018-06-15",
      surgeon: "Dr. Sharma",
      hospital: "Apollo Hospital",
      indication: "Appendicitis",
      complications: "None",
      recoveryTime: "3 weeks",
      anesthesia: "General",
      pathologyReport: "Appendix inflamed, no malignancy",
      followUpDate: "2018-07-05",
      notes: "Full recovery",
    },
  ]);

  const [immunizations, setImmunizations] = useState([
    {
      vaccine: "Tetanus",
      doses: "1",
      lastDate: "2024-01-10",
      nextDue: "2034-01-10",
      provider: "City Health Clinic",
      lotNumber: "TX123456",
      sideEffects: "Mild arm soreness",
      status: "Completed",
    },
  ]);

  useEffect(() => {
    if (formData.allergies && formData.allergies.length > 0) {
      setAllergies(formData.allergies);
    }
    if (formData.chronicConditions && formData.chronicConditions.length > 0) {
      setChronicConditions(formData.chronicConditions);
    }
    if (formData.surgicalHistory && formData.surgicalHistory.length > 0) {
      setSurgicalHistory(formData.surgicalHistory);
    }
    if (formData.immunizations && formData.immunizations.length > 0) {
      setImmunizations(formData.immunizations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAllergyChange = (index, field, value) => {
    const updatedAllergies = [...allergies];
    updatedAllergies[index][field] = value;
    setAllergies(updatedAllergies);
    handleChange({ target: { name: "allergies", value: updatedAllergies } });
  };

  const addAllergy = () => {
    const newAllergies = [
      ...allergies,
      {
        allergen: "",
        type: "",
        severity: "",
        reaction: "",
        onsetDate: "",
        verifiedBy: "",
        avoidanceInstructions: "",
        emergencyMedication: "",
        lastReaction: "",
        notes: "",
      },
    ];
    setAllergies(newAllergies);
    handleChange({ target: { name: "allergies", value: newAllergies } });
  };

  const removeAllergy = (index) => {
    const updatedAllergies = allergies.filter((_, i) => i !== index);
    setAllergies(updatedAllergies);
    handleChange({ target: { name: "allergies", value: updatedAllergies } });
  };

  // Handle chronic condition changes
  const handleChronicConditionChange = (index, field, value) => {
    const updated = [...chronicConditions];
    if (field === "triggers" || field === "precautions") {
      updated[index][field] = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else {
      updated[index][field] = value;
    }
    setChronicConditions(updated);
    handleChange({ target: { name: "chronicConditions", value: updated } });
  };

  const handleMedicineChange = (
    conditionIndex,
    medicineIndex,
    field,
    value
  ) => {
    const updated = [...chronicConditions];
    updated[conditionIndex].medicines[medicineIndex][field] = value;
    setChronicConditions(updated);
    handleChange({ target: { name: "chronicConditions", value: updated } });
  };

  const addChronicCondition = () => {
    const newConditions = [
      ...chronicConditions,
      {
        conditionName: "",
        diagnosedOn: "",
        severityLevel: "",
        medicines: [
          { name: "", form: "", dose: "", frequency: "", timing: [] },
        ],
        triggers: [],
        precautions: [],
        lastReviewDate: "",
      },
    ];
    setChronicConditions(newConditions);
    handleChange({
      target: { name: "chronicConditions", value: newConditions },
    });
  };

  const removeChronicCondition = (index) => {
    const updated = chronicConditions.filter((_, i) => i !== index);
    setChronicConditions(updated);
    handleChange({ target: { name: "chronicConditions", value: updated } });
  };

  const addMedicine = (conditionIndex) => {
    const updated = [...chronicConditions];
    updated[conditionIndex].medicines.push({
      name: "",
      form: "",
      dose: "",
      frequency: "",
      timing: [],
    });
    setChronicConditions(updated);
    handleChange({ target: { name: "chronicConditions", value: updated } });
  };

  const removeMedicine = (conditionIndex, medicineIndex) => {
    const updated = [...chronicConditions];
    updated[conditionIndex].medicines = updated[
      conditionIndex
    ].medicines.filter((_, i) => i !== medicineIndex);
    setChronicConditions(updated);
    handleChange({ target: { name: "chronicConditions", value: updated } });
  };

  // Handle surgical history changes
  const handleSurgicalHistoryChange = (index, field, value) => {
    const updated = [...surgicalHistory];
    updated[index][field] = value;
    setSurgicalHistory(updated);
    handleChange({ target: { name: "surgicalHistory", value: updated } });
  };

  const addSurgicalHistory = () => {
    const newHistory = [
      ...surgicalHistory,
      {
        procedure: "",
        date: "",
        surgeon: "",
        hospital: "",
        indication: "",
        complications: "",
        recoveryTime: "",
        anesthesia: "",
        pathologyReport: "",
        followUpDate: "",
        notes: "",
      },
    ];
    setSurgicalHistory(newHistory);
    handleChange({ target: { name: "surgicalHistory", value: newHistory } });
  };

  const removeSurgicalHistory = (index) => {
    const updated = surgicalHistory.filter((_, i) => i !== index);
    setSurgicalHistory(updated);
    handleChange({ target: { name: "surgicalHistory", value: updated } });
  };

  // Handle immunization changes
  const handleImmunizationChange = (index, field, value) => {
    const updated = [...immunizations];
    updated[index][field] = value;
    setImmunizations(updated);
    handleChange({ target: { name: "immunizations", value: updated } });
  };

  const addImmunization = () => {
    const newImmunizations = [
      ...immunizations,
      {
        vaccine: "",
        doses: "",
        lastDate: "",
        nextDue: "",
        provider: "",
        lotNumber: "",
        sideEffects: "",
        status: "",
      },
    ];
    setImmunizations(newImmunizations);
    handleChange({
      target: { name: "immunizations", value: newImmunizations },
    });
  };

  const removeImmunization = (index) => {
    const updated = immunizations.filter((_, i) => i !== index);
    setImmunizations(updated);
    handleChange({ target: { name: "immunizations", value: updated } });
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FileText className="text-purple-600" size={28} />
        Medical History
      </h3>

      {/* Allergies Section */}
      <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-400">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Allergies
          </h4>
          <button
            type="button"
            onClick={addAllergy}
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus size={16} />
            Add Allergy
          </button>
        </div>

        {allergies.map((allergy, index) => (
          <div key={index} className="bg-white p-4 rounded-lg mb-4 border">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-700">Allergy {index + 1}</h5>
              {allergies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAllergy(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergen
                </label>
                <input
                  type="text"
                  placeholder="e.g., Penicillin"
                  value={allergy.allergen}
                  onChange={(e) =>
                    handleAllergyChange(index, "allergen", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={allergy.type}
                  onChange={(e) =>
                    handleAllergyChange(index, "type", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400"
                >
                  <option value="">Select Type</option>
                  <option value="Drug Allergy">Drug Allergy</option>
                  <option value="Food Allergy">Food Allergy</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Contact Allergy">Contact Allergy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={allergy.severity}
                  onChange={(e) =>
                    handleAllergyChange(index, "severity", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400"
                >
                  <option value="">Select Severity</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reaction
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rash, Swelling"
                  value={allergy.reaction}
                  onChange={(e) =>
                    handleAllergyChange(index, "reaction", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Noticed Date
                </label>
                <input
                  type="date"
                  value={allergy.onsetDate}
                  onChange={(e) =>
                    handleAllergyChange(index, "onsetDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Medication
                </label>
                <input
                  type="text"
                  placeholder="e.g., EpiPen, Benadryl"
                  value={allergy.emergencyMedication}
                  onChange={(e) =>
                    handleAllergyChange(
                      index,
                      "emergencyMedication",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avoidance Instructions
              </label>
              <textarea
                placeholder="What should be avoided and special precautions..."
                value={allergy.avoidanceInstructions}
                onChange={(e) =>
                  handleAllergyChange(
                    index,
                    "avoidanceInstructions",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-400 h-20 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Chronic Conditions Section */}
      <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-400">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Stethoscope className="text-orange-500" size={20} />
            Chronic Conditions
          </h4>
          <button
            type="button"
            onClick={addChronicCondition}
            className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Add Condition
          </button>
        </div>

        {chronicConditions.map((condition, index) => (
          <div key={index} className="bg-white p-4 rounded-lg mb-4 border">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-700">
                Condition {index + 1}
              </h5>
              {chronicConditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChronicCondition(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Diabetes, Hypertension"
                  value={condition.conditionName}
                  onChange={(e) =>
                    handleChronicConditionChange(
                      index,
                      "conditionName",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosed Date
                </label>
                <input
                  type="date"
                  value={condition.diagnosedOn}
                  onChange={(e) =>
                    handleChronicConditionChange(
                      index,
                      "diagnosedOn",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity Level
                </label>
                <select
                  value={condition.severityLevel}
                  onChange={(e) =>
                    handleChronicConditionChange(
                      index,
                      "severityLevel",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-400"
                >
                  <option value="">Select Severity</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Review Date
                </label>
                <input
                  type="date"
                  value={condition.lastReviewDate}
                  onChange={(e) =>
                    handleChronicConditionChange(
                      index,
                      "lastReviewDate",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Triggers (comma separated)
                </label>
                <textarea
                  placeholder="e.g., stress, cold weather, exercise"
                  value={condition.triggers.join(", ")}
                  onChange={(e) =>
                    handleChronicConditionChange(
                      index,
                      "triggers",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-400 h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precautions (comma separated)
                </label>
                <textarea
                  placeholder="e.g., avoid salt, monitor blood sugar"
                  value={condition.precautions.join(", ")}
                  onChange={(e) =>
                    handleChronicConditionChange(
                      index,
                      "precautions",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-400 h-16 resize-none"
                />
              </div>
            </div>

            {/* Medicines for this condition */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h6 className="font-medium text-gray-600 flex items-center gap-2">
                  <Pill className="text-blue-500" size={16} />
                  Medicines
                </h6>
                <button
                  type="button"
                  onClick={() => addMedicine(index)}
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Medicine
                </button>
              </div>

              {condition.medicines.map((medicine, medicineIndex) => (
                <div
                  key={medicineIndex}
                  className="bg-gray-50 p-3 rounded-lg mb-2"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Medicine {medicineIndex + 1}
                    </span>
                    {condition.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index, medicineIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={medicine.name}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          medicineIndex,
                          "name",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Form (tablet, syrup, etc.)"
                      value={medicine.form}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          medicineIndex,
                          "form",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Dose"
                      value={medicine.dose}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          medicineIndex,
                          "dose",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={medicine.frequency}
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          medicineIndex,
                          "frequency",
                          e.target.value
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>

                  <div className="mt-2">
                    <label className="text-xs text-gray-600 mb-1 block">
                      Timing
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Early Morning",
                        "Morning",
                        "Afternoon",
                        "Evening",
                        "Night",
                      ].map((time) => (
                        <label
                          key={time}
                          className="flex items-center gap-1 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={medicine.timing.includes(time)}
                            onChange={(e) => {
                              let newTiming = [...medicine.timing];
                              if (e.target.checked) {
                                newTiming.push(time);
                              } else {
                                newTiming = newTiming.filter((t) => t !== time);
                              }
                              handleMedicineChange(
                                index,
                                medicineIndex,
                                "timing",
                                newTiming
                              );
                            }}
                            className="w-3 h-3"
                          />
                          {time}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Surgical History Section */}
      <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-400">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="text-purple-500" size={20} />
            Surgical History
          </h4>
          <button
            type="button"
            onClick={addSurgicalHistory}
            className="flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Plus size={16} />
            Add Surgery
          </button>
        </div>

        {surgicalHistory.map((surgery, index) => (
          <div key={index} className="bg-white p-4 rounded-lg mb-4 border">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-700">Surgery {index + 1}</h5>
              {surgicalHistory.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSurgicalHistory(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Procedure Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Appendectomy, Bypass Surgery"
                  value={surgery.procedure}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(
                      index,
                      "procedure",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surgery Date
                </label>
                <input
                  type="date"
                  value={surgery.date}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(index, "date", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surgeon Name
                </label>
                <input
                  type="text"
                  placeholder="Dr. Name"
                  value={surgery.surgeon}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(
                      index,
                      "surgeon",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  placeholder="Hospital/Clinic Name"
                  value={surgery.hospital}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(
                      index,
                      "hospital",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indication/Reason
                </label>
                <input
                  type="text"
                  placeholder="Why surgery was needed"
                  value={surgery.indication}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(
                      index,
                      "indication",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recovery Time
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2 weeks, 1 month"
                  value={surgery.recoveryTime}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(
                      index,
                      "recoveryTime",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complications (if any)
                </label>
                <textarea
                  placeholder="Any complications during or after surgery..."
                  value={surgery.complications}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(
                      index,
                      "complications",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400 h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  placeholder="Any other important details..."
                  value={surgery.notes}
                  onChange={(e) =>
                    handleSurgicalHistoryChange(index, "notes", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400 h-16 resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Immunizations Section */}
      <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-400">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Stethoscope className="text-green-500" size={20} />
            Immunizations
          </h4>
          <button
            type="button"
            onClick={addImmunization}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus size={16} />
            Add Immunization
          </button>
        </div>

        {immunizations.map((immunization, index) => (
          <div key={index} className="bg-white p-4 rounded-lg mb-4 border">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium text-gray-700">
                Immunization {index + 1}
              </h5>
              {immunizations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImmunization(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., COVID-19, Hepatitis B"
                  value={immunization.vaccine}
                  onChange={(e) =>
                    handleImmunizationChange(index, "vaccine", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Doses
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2/3, Complete"
                  value={immunization.doses}
                  onChange={(e) =>
                    handleImmunizationChange(index, "doses", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Vaccination Date
                </label>
                <input
                  type="date"
                  value={immunization.lastDate}
                  onChange={(e) =>
                    handleImmunizationChange(index, "lastDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={immunization.nextDue}
                  onChange={(e) =>
                    handleImmunizationChange(index, "nextDue", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Healthcare Provider
                </label>
                <input
                  type="text"
                  placeholder="Doctor/Clinic Name"
                  value={immunization.provider}
                  onChange={(e) =>
                    handleImmunizationChange(index, "provider", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={immunization.status}
                  onChange={(e) =>
                    handleImmunizationChange(index, "status", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-400"
                >
                  <option value="">Select Status</option>
                  <option value="Current">Current</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Side Effects (if any)
              </label>
              <textarea
                placeholder="Any side effects experienced after vaccination..."
                value={immunization.sideEffects}
                onChange={(e) =>
                  handleImmunizationChange(index, "sideEffects", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-400 h-16 resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalHistoryStep;
