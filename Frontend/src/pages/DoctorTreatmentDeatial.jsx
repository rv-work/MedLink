// components/DoctorTreatmentDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DoctorTreatmentDetail = () => {
  const { treatmentId } = useParams();
  const [treatmentData, setTreatmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    if (treatmentId) {
      fetchTreatmentDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentId]);

  const fetchTreatmentDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/doctor/get-treatment-detail/${treatmentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setTreatmentData(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch treatment details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (summaryId) => {
    if (!messageInput[summaryId]?.trim()) return;

    try {
      setSubmitting((prev) => ({ ...prev, [summaryId]: true }));

      await axios.post(
        `http://localhost:5000/api/doctor/summary/${summaryId}/`,
        { message: messageInput[summaryId] },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Refresh the data to show the new message
      await fetchTreatmentDetail();

      // Clear the input
      setMessageInput((prev) => ({ ...prev, [summaryId]: "" }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSubmitting((prev) => ({ ...prev, [summaryId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const { treatment, summaries } = treatmentData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Treatment Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {treatment.patientName}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              treatment.status === "active"
                ? "bg-green-100 text-green-800"
                : treatment.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {treatment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="font-semibold">{treatment.owner.name}</p>
            <p className="text-sm text-gray-600">{treatment.owner.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hospital</p>
            <p className="font-semibold">{treatment.hospital}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-semibold">{treatment.totalDays} days</p>
            <p className="text-sm text-gray-600">
              {new Date(treatment.startDate).toLocaleDateString()} -
              {new Date(treatment.endDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Adherence</p>
            <p className="font-semibold text-lg">
              {treatment.progress.adherencePercentage}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${treatment.progress.adherencePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Prescribed Medicines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {treatment.medicines.map((medicine, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{medicine.name}</h3>
              <p className="text-sm text-gray-600">Dose: {medicine.dose}</p>
              <p className="text-sm text-gray-600">
                Frequency: {medicine.frequency}
              </p>
              <p className="text-sm text-gray-600">
                Quantity: {medicine.quantity}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Timing:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {medicine.timing.map((time, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Summaries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Treatment Summaries
        </h2>

        {summaries.length === 0 ? (
          <p className="text-gray-500">No summaries available yet.</p>
        ) : (
          <div className="space-y-6">
            {summaries.map((summary) => (
              <div
                key={summary._id}
                className="border border-gray-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">
                    Summary - {new Date(summary.date).toLocaleDateString()}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      summary.condition === "better"
                        ? "bg-green-100 text-green-800"
                        : summary.condition === "worse"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {summary.condition}
                  </span>
                </div>

                {/* Medicine Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Due</p>
                    <p className="font-semibold text-xl">
                      {summary.medicineStats.totalDue}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Total Taken</p>
                    <p className="font-semibold text-xl">
                      {summary.medicineStats.totalTaken}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Adherence</p>
                    <p className="font-semibold text-xl">
                      {summary.medicineStats.adherence}%
                    </p>
                  </div>
                </div>

                {/* Condition Notes */}
                {summary.conditionNotes && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Condition Notes:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                      {summary.conditionNotes}
                    </p>
                  </div>
                )}

                {/* Patient Notes */}
                {summary.patientNotes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Patient Notes:</h4>
                    <div className="space-y-2">
                      {summary.patientNotes.map((note, idx) => (
                        <div key={idx} className="bg-blue-50 p-3 rounded">
                          <p className="text-gray-700">{note.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(note.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Message */}
                {summary.doctorMessage && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Your Response:</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-500">
                      {summary.doctorMessage}
                    </p>
                  </div>
                )}

                {/* Reply Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">
                    {summary.doctorMessage
                      ? "Update Response:"
                      : "Send Response:"}
                  </h4>
                  <div className="flex gap-2">
                    <textarea
                      value={messageInput[summary._id] || ""}
                      onChange={(e) =>
                        setMessageInput((prev) => ({
                          ...prev,
                          [summary._id]: e.target.value,
                        }))
                      }
                      placeholder="Write your response to the patient..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                    <button
                      onClick={() => handleSendMessage(summary._id)}
                      disabled={
                        !messageInput[summary._id]?.trim() ||
                        submitting[summary._id]
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    >
                      {submitting[summary._id] ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorTreatmentDetail;
