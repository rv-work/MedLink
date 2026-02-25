// components/DoctorTreatmentDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  User,
  Building2,
  Calendar,
  TrendingUp,
  Pill,
  Clock,
  FileText,
  Send,
  Loader2,
  ArrowLeft,
  Heart,
  Smile,
  Frown,
  Meh,
  Activity,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Stethoscope,
  Target,
  BarChart3,
  RefreshCw,
  ClipboardList,
  Timer,
  Users,
  Mail,
  CalendarDays,
} from "lucide-react";

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
        `https://medlink-bh5c.onrender.com/api/doctor/get-treatment-detail/${treatmentId}`,
        {
          withCredentials: true,
        },
      );
      setTreatmentData(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch treatment details",
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
        `https://medlink-bh5c.onrender.com/api/doctor/summary/${summaryId}/`,
        { message: messageInput[summaryId] },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
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

  const getStatusBadge = (status) => {
    const styles = {
      active:
        "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-green-200/20",
      completed:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-blue-200/20",
      paused:
        "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-yellow-200/20",
    };
    return `px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-lg ${styles[status]} transform hover:scale-105 transition-all duration-200`;
  };

  const getConditionIcon = (condition) => {
    switch (condition) {
      case "better":
        return <Smile className="w-5 h-5 text-green-600" />;
      case "worse":
        return <Frown className="w-5 h-5 text-red-600" />;
      default:
        return <Meh className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "better":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-green-200/20";
      case "worse":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 shadow-red-200/20";
      default:
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-yellow-200/20";
    }
  };

  const getAdherenceColor = (percentage) => {
    if (percentage >= 80) return "from-green-400 to-green-600";
    if (percentage >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-t-blue-500 shadow-2xl shadow-blue-200/30">
            <RefreshCw className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="absolute inset-0 animate-ping rounded-full h-24 w-24 border-4 border-blue-300 opacity-20"></div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2 justify-center">
              <Stethoscope className="w-5 h-5" />
              Loading Treatment Details
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch the information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-red-200/20 border border-red-200 p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-800 mb-4">
            Failed to Load Treatment
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchTreatmentDetail}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { treatment, summaries } = treatmentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 group transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Treatments
        </button>

        {/* Treatment Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-200/20 border border-white/50 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  {treatment.patientName}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Treatment Details</span>
                </div>
              </div>
            </div>
            <span className={getStatusBadge(treatment.status)}>
              <Activity className="w-4 h-4 inline mr-2" />
              {treatment.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl shadow-lg shadow-purple-200/20 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-800">
                  Patient Owner
                </p>
              </div>
              <p className="font-bold text-lg text-gray-800">
                {treatment.owner.name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3 text-gray-500" />
                <p className="text-sm text-gray-600">{treatment.owner.email}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl shadow-lg shadow-green-200/20 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <p className="text-sm font-medium text-green-800">Hospital</p>
              </div>
              <p className="font-bold text-lg text-gray-800">
                {treatment.hospital}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl shadow-lg shadow-blue-200/20 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">Duration</p>
              </div>
              <p className="font-bold text-lg text-gray-800">
                {treatment.totalDays} days
              </p>
              <div className="flex items-center gap-1 mt-1">
                <CalendarDays className="w-3 h-3 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {new Date(treatment.startDate).toLocaleDateString()} -{" "}
                  {new Date(treatment.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl shadow-lg shadow-orange-200/20 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <p className="text-sm font-medium text-orange-800">Adherence</p>
              </div>
              <p className="font-bold text-2xl text-gray-800">
                {treatment.progress.adherencePercentage}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2 shadow-inner">
                <div
                  className={`h-3 rounded-full bg-gradient-to-r ${getAdherenceColor(
                    treatment.progress.adherencePercentage,
                  )} shadow-sm transition-all duration-500`}
                  style={{
                    width: `${treatment.progress.adherencePercentage}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200/20 border border-white/50 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200/30">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Prescribed Medicines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treatment.medicines.map((medicine, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg shadow-gray-200/20 hover:shadow-2xl hover:shadow-gray-300/30 border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {medicine.name}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>
                      Dose:{" "}
                      <span className="font-semibold">{medicine.dose}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Frequency:{" "}
                      <span className="font-semibold">
                        {medicine.frequency}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4" />
                    <span>
                      Quantity:{" "}
                      <span className="font-semibold">{medicine.quantity}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    Timing:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicine.timing.map((time, idx) => (
                      <span
                        key={idx}
                        className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm"
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
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200/20 border border-white/50 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Treatment Summaries
            </h2>
          </div>

          {summaries.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Summaries Yet
              </h3>
              <p className="text-gray-500">
                Patient summaries will appear here when submitted.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {summaries.map((summary) => (
                <div
                  key={summary._id}
                  className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg shadow-gray-200/20 hover:shadow-2xl hover:shadow-gray-300/30 border border-gray-200 p-6 transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/30">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors">
                          Daily Summary
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(summary.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full border-2 shadow-lg flex items-center gap-2 ${getConditionColor(
                        summary.condition,
                      )}`}
                    >
                      {getConditionIcon(summary.condition)}
                      <span className="font-bold capitalize">
                        {summary.condition}
                      </span>
                    </div>
                  </div>

                  {/* Medicine Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl shadow-lg shadow-blue-200/20 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-800">
                          Total Due
                        </p>
                      </div>
                      <p className="font-bold text-2xl text-gray-800">
                        {summary.medicineStats.totalDue}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-lg shadow-green-200/20 border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-sm font-medium text-green-800">
                          Total Taken
                        </p>
                      </div>
                      <p className="font-bold text-2xl text-gray-800">
                        {summary.medicineStats.totalTaken}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-lg shadow-purple-200/20 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <p className="text-sm font-medium text-purple-800">
                          Adherence
                        </p>
                      </div>
                      <p className="font-bold text-2xl text-gray-800">
                        {summary.medicineStats.adherence}%
                      </p>
                    </div>
                  </div>

                  {/* Condition Notes */}
                  {summary.conditionNotes && (
                    <div className="mb-6">
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
                        <MessageSquare className="w-5 h-5" />
                        Condition Notes:
                      </h4>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
                        <p className="text-gray-700">
                          {summary.conditionNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Patient Notes */}
                  {summary.patientNotes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
                        <User className="w-5 h-5" />
                        Patient Notes:
                      </h4>
                      <div className="space-y-3">
                        {summary.patientNotes.map((note, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm"
                          >
                            <p className="text-gray-700 mb-2">{note.message}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(note.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Message */}
                  {summary.doctorMessage && (
                    <div className="mb-6">
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
                        <Stethoscope className="w-5 h-5" />
                        Your Response:
                      </h4>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                        <p className="text-gray-700">{summary.doctorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Reply Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                      <Send className="w-5 h-5" />
                      {summary.doctorMessage
                        ? "Update Response:"
                        : "Send Response:"}
                    </h4>
                    <div className="space-y-4">
                      <textarea
                        value={messageInput[summary._id] || ""}
                        onChange={(e) =>
                          setMessageInput((prev) => ({
                            ...prev,
                            [summary._id]: e.target.value,
                          }))
                        }
                        placeholder="Write your response to the patient..."
                        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm resize-none"
                        rows="4"
                      />
                      <button
                        onClick={() => handleSendMessage(summary._id)}
                        disabled={
                          !messageInput[summary._id]?.trim() ||
                          submitting[summary._id]
                        }
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                      >
                        {submitting[summary._id] ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Response
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorTreatmentDetail;
