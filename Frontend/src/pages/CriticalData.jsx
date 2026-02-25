import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Phone,
  Heart,
  Activity,
  Pill,
  FileText,
  User,
  Calendar,
  Thermometer,
  Scale,
  Ruler,
  Shield,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";

const CriticalData = () => {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://medlink-bh5c.onrender.com/api/user/${userId}`,
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to fetch critical data");
        console.error("Error fetching critical data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCriticalData();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-red-700 text-lg">Loading Emergency Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    patientInfo,
    emergencyContacts,
    allergies,
    chronicConditions,
    currentMedications,
    latestVitals,
    latestWeight,
    latestHeight,
    recentSurgeries,
    recentReports,
    surgicalHistory,
    immunizations,
  } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">EMERGENCY MEDICAL DATA</h1>
                <p className="text-red-100">
                  Critical Information for Medical Personnel
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">Accessed at</p>
              <p className="font-mono">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Patient Basic Info */}
        <div className="bg-white p-6 border-l-4 border-red-500 shadow-lg">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              Patient Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-xl font-bold text-gray-800">
                {patientInfo.name}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-xl font-bold text-gray-800">
                {patientInfo.age || "N/A"} years
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-xl font-bold text-gray-800">
                {patientInfo.gender || "N/A"}
              </p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg border border-red-300">
              <p className="text-sm text-red-600 font-semibold">Blood Group</p>
              <p className="text-2xl font-bold text-red-800">
                {patientInfo.bloodGroup || "Unknown"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Phone className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">
                Emergency Contacts
              </h3>
            </div>
            {emergencyContacts.length > 0 ? (
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="bg-green-50 p-4 rounded-lg border border-green-200"
                  >
                    <p className="font-semibold text-gray-800">
                      {contact.name}
                    </p>
                    <p className="text-green-700 font-mono text-lg">
                      {contact.phone}
                    </p>
                    <p className="text-sm text-gray-600">{contact.relation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No emergency contacts available
              </p>
            )}
          </div>

          {/* Allergies - CRITICAL */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-xl font-bold text-red-800">⚠️ ALLERGIES</h3>
            </div>
            {allergies.length > 0 ? (
              <div className="space-y-3">
                {allergies.map((allergy, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      allergy.severity === "Severe"
                        ? "bg-red-100 border-red-500"
                        : allergy.severity === "Moderate"
                          ? "bg-orange-100 border-orange-500"
                          : "bg-yellow-100 border-yellow-500"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-lg text-gray-800">
                        {allergy.allergen}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          allergy.severity === "Severe"
                            ? "bg-red-500 text-white"
                            : allergy.severity === "Moderate"
                              ? "bg-orange-500 text-white"
                              : "bg-yellow-500 text-white"
                        }`}
                      >
                        {allergy.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{allergy.type}</p>
                    {allergy.reaction && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Reaction:</strong> {allergy.reaction}
                      </p>
                    )}
                    {allergy.emergencyMedication && (
                      <p className="text-sm text-blue-700 font-semibold">
                        <strong>Emergency Med:</strong>{" "}
                        {allergy.emergencyMedication}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No known allergies</p>
            )}
          </div>

          {/* Chronic Conditions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">
                Chronic Conditions
              </h3>
            </div>
            {chronicConditions.length > 0 ? (
              <div className="space-y-3">
                {chronicConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="bg-purple-50 p-4 rounded-lg border border-purple-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-800">
                        {condition.conditionName}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          condition.severityLevel === "severe"
                            ? "bg-red-500 text-white"
                            : condition.severityLevel === "moderate"
                              ? "bg-orange-500 text-white"
                              : "bg-green-500 text-white"
                        }`}
                      >
                        {condition.severityLevel}
                      </span>
                    </div>
                    {condition.triggers && condition.triggers.length > 0 && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Triggers:</strong>{" "}
                        {condition.triggers.join(", ")}
                      </p>
                    )}
                    {condition.precautions &&
                      condition.precautions.length > 0 && (
                        <p className="text-sm text-red-700">
                          <strong>Precautions:</strong>{" "}
                          {condition.precautions.join(", ")}
                        </p>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No chronic conditions recorded
              </p>
            )}
          </div>
        </div>

        {/* Current Medications */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center mb-4">
            <Pill className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">
              Current Medications
            </h3>
          </div>
          {currentMedications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMedications.map((med, index) => (
                <div
                  key={index}
                  className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                >
                  <p className="font-bold text-gray-800 mb-2">{med.name}</p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Dose:</strong> {med.dose}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {med.frequency}
                    </p>
                    {med.timing && (
                      <p>
                        <strong>Timing:</strong> {med.timing.join(", ")}
                      </p>
                    )}
                    {med.condition && (
                      <p className="text-purple-700">
                        <strong>For:</strong> {med.condition}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No current medications recorded
            </p>
          )}
        </div>

        {/* Latest Vitals */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-800">Latest Vitals</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {latestVitals?.bloodPressure && (
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <Thermometer className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Blood Pressure</p>
                <p className="font-bold text-lg">
                  {latestVitals.bloodPressure.systolic}/
                  {latestVitals.bloodPressure.diastolic}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(
                    latestVitals.bloodPressure.date,
                  ).toLocaleDateString()}
                </p>
              </div>
            )}
            {latestVitals?.heartRate && (
              <div className="bg-pink-50 p-4 rounded-lg text-center">
                <Heart className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Heart Rate</p>
                <p className="font-bold text-lg">
                  {latestVitals.heartRate.value} bpm
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(latestVitals.heartRate.date).toLocaleDateString()}
                </p>
              </div>
            )}
            {latestVitals?.bloodSugar && (
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <Activity className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Blood Sugar</p>
                <p className="font-bold text-lg">
                  {latestVitals.bloodSugar.value} mg/dL
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(latestVitals.bloodSugar.date).toLocaleDateString()}
                </p>
              </div>
            )}
            {latestWeight && (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Scale className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-bold text-lg">{latestWeight.value} kg</p>
                <p className="text-xs text-gray-500">
                  {new Date(latestWeight.date).toLocaleDateString()}
                </p>
              </div>
            )}
            {latestHeight && (
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Ruler className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Height</p>
                <p className="font-bold text-lg">{latestHeight.value} cm</p>
                <p className="text-xs text-gray-500">
                  {new Date(latestHeight.date).toLocaleDateString()}
                </p>
              </div>
            )}
            {latestVitals?.bmi && (
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">BMI</p>
                <p className="font-bold text-lg">{latestVitals.bmi.value}</p>
                <p className="text-xs text-gray-500">
                  {new Date(latestVitals.bmi.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Medical History */}
        {(recentSurgeries.length > 0 ||
          recentReports.length > 0 ||
          surgicalHistory?.length > 0 ||
          immunizations?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* All Surgeries */}
            {(surgicalHistory?.length > 0 || recentSurgeries.length > 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-orange-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Surgical History
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* All surgical history */}
                  {surgicalHistory?.slice(0, 5).map((surgery, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 p-4 rounded-lg border border-orange-200"
                    >
                      <p className="font-bold text-gray-800">
                        {surgery.procedure}
                      </p>
                      <p className="text-sm text-gray-600">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {surgery.date
                          ? new Date(surgery.date).toLocaleDateString()
                          : "Date not recorded"}
                      </p>
                      {surgery.surgeon && (
                        <p className="text-sm text-gray-600">
                          Dr. {surgery.surgeon}
                        </p>
                      )}
                      {surgery.hospital && (
                        <p className="text-sm text-gray-600">
                          Hospital: {surgery.hospital}
                        </p>
                      )}
                      {surgery.indication && (
                        <p className="text-sm text-blue-700">
                          Indication: {surgery.indication}
                        </p>
                      )}
                      {surgery.complications && (
                        <p className="text-sm text-red-700">
                          <strong>Complications:</strong>{" "}
                          {surgery.complications}
                        </p>
                      )}
                      {surgery.anesthesia && (
                        <p className="text-sm text-gray-600">
                          Anesthesia: {surgery.anesthesia}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Immunizations */}
            {immunizations?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Immunizations
                  </h3>
                </div>
                <div className="space-y-3">
                  {immunizations.slice(0, 8).map((immunization, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        immunization.status === "Current"
                          ? "bg-green-50 border-green-200"
                          : immunization.status === "Overdue"
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-800">
                          {immunization.vaccine}
                        </p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            immunization.status === "Current"
                              ? "bg-green-500 text-white"
                              : immunization.status === "Overdue"
                                ? "bg-red-500 text-white"
                                : "bg-gray-500 text-white"
                          }`}
                        >
                          {immunization.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {immunization.doses && (
                          <p>
                            <strong>Doses:</strong> {immunization.doses}
                          </p>
                        )}
                        {immunization.lastDate && (
                          <p>
                            <strong>Last Date:</strong>{" "}
                            {new Date(
                              immunization.lastDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {immunization.nextDue && (
                          <p
                            className={
                              immunization.status === "Overdue"
                                ? "text-red-700 font-semibold"
                                : "text-blue-700"
                            }
                          >
                            <strong>Next Due:</strong>{" "}
                            {new Date(
                              immunization.nextDue,
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {immunization.provider && (
                          <p>
                            <strong>Provider:</strong> {immunization.provider}
                          </p>
                        )}
                        {immunization.sideEffects && (
                          <p className="text-orange-700">
                            <strong>Side Effects:</strong>{" "}
                            {immunization.sideEffects}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Reports */}
            {recentReports.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-indigo-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Recent Reports
                  </h3>
                </div>
                <div className="space-y-3">
                  {recentReports.map((report, index) => (
                    <div
                      key={index}
                      className="bg-indigo-50 p-4 rounded-lg border border-indigo-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-800">
                          {report.reportType}
                        </p>
                        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">
                          {report.department}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(report.dateOfReport).toLocaleDateString()}
                      </p>
                      {report.doctorName && (
                        <p className="text-sm text-gray-600">
                          Dr. {report.doctorName}
                        </p>
                      )}
                      {report.diagnosisSummary && (
                        <p className="text-sm text-gray-700 mt-2">
                          {report.diagnosisSummary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-800 text-white p-4 rounded-b-xl mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="h-5 w-5" />
            <p className="text-sm">
              This data was accessed in an emergency situation
            </p>
          </div>
          <p className="text-xs text-gray-400">
            For complete medical records, please contact the patient's primary
            healthcare provider
          </p>
        </div>
      </div>
    </div>
  );
};

export default CriticalData;
