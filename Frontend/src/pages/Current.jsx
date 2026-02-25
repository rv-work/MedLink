import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Pill,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Circle,
  Plus,
  Activity,
  Target,
  Award,
  AlertCircle,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";

const TreatmentDashboard = () => {
  const [activeTab, setActiveTab] = useState("treatments");
  const [treatments, setTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("same");
  const [conditionNotes, setConditionNotes] = useState("");
  const [error, setError] = useState(null);
  const [todayMedicineLoading, setTodayMedicineLoading] = useState(false);

  const API_BASE_URL = "https://medlink-bh5c.onrender.com/api/treatment";

  const fetchActiveTreatments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/active`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Convert date strings to Date objects
        const processedTreatments = data.treatments.map((treatment) => ({
          ...treatment,
          startDate: new Date(treatment.startDate),
          endDate: new Date(treatment.endDate),
          days: treatment.days.map((day) => ({
            ...day,
            date: new Date(day.date),
            medicines: day.medicines.map((medicine) => ({
              ...medicine,
              timings: medicine.timings.map((timing) => ({
                ...timing,
                takenAt: timing.takenAt ? new Date(timing.takenAt) : null,
              })),
            })),
          })),
          dailyNotes: treatment.dailyNotes.map((note) => ({
            ...note,
            date: new Date(note.date),
            notes: note.notes.map((n) => ({
              ...n,
              timestamp: new Date(n.timestamp),
            })),
          })),
        }));

        setTreatments(processedTreatments);
        if (processedTreatments.length > 0) {
          setSelectedTreatment(processedTreatments[0]);
        }
      } else {
        throw new Error(data.message || "Failed to fetch treatments");
      }
    } catch (error) {
      console.error("Error fetching treatments:", error);
      setError(error.message);
      // Set empty array to show "No treatments" UI
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTreatments();
  }, []);

  const getTodaysMedicines = (treatment) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return treatment.days.find((day) => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === today.getTime();
    });
  };

  const markMedicineAsTaken = async (dayIndex, medicineIndex, timingIndex) => {
    if (!selectedTreatment) return;

    console.log(
      "body: ",
      selectedTreatment,
      dayIndex,
      medicineIndex,
      timingIndex,
    );

    setTodayMedicineLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mark-taken`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          treatmentId: selectedTreatment._id,
          dayIndex,
          medicineIndex,
          timingIndex,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update the selected treatment with the response data
        const updatedTreatment = {
          ...data.treatment,
          startDate: new Date(data.treatment.startDate),
          endDate: new Date(data.treatment.endDate),
          days: data.treatment.days.map((day) => ({
            ...day,
            date: new Date(day.date),
            medicines: day.medicines.map((medicine) => ({
              ...medicine,
              timings: medicine.timings.map((timing) => ({
                ...timing,
                takenAt: timing.takenAt ? new Date(timing.takenAt) : null,
              })),
            })),
          })),
          dailyNotes: data.treatment.dailyNotes.map((note) => ({
            ...note,
            date: new Date(note.date),
            notes: note.notes.map((n) => ({
              ...n,
              timestamp: new Date(n.timestamp),
            })),
          })),
        };

        setSelectedTreatment(updatedTreatment);

        setTreatments((prev) =>
          prev.map((treatment) =>
            treatment._id === updatedTreatment._id
              ? updatedTreatment
              : treatment,
          ),
        );

        toast.success("Medicine marked as taken successfully");
      } else {
        throw new Error(data.message || "Failed to mark medicine as taken");
      }
    } catch (error) {
      toast.error("Error marking medicine as taken:", error.message);
      setError(error.message);
      // You can show an error toast here
    } finally {
      setTodayMedicineLoading(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim() && !selectedCondition) return;
    if (!selectedTreatment) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/add-note`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          treatmentId: selectedTreatment._id,
          message: noteText.trim(),
          condition: selectedCondition,
          conditionNotes: conditionNotes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Process the daily note
        const processedNote = {
          ...data.dailyNote,
          date: new Date(data.dailyNote.date),
          notes: data.dailyNote.notes.map((n) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          })),
        };

        // Update the selected treatment's daily notes
        setSelectedTreatment((prev) => {
          const updatedDailyNotes = [...prev.dailyNotes];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const todayNoteIndex = updatedDailyNotes.findIndex((note) => {
            const noteDate = new Date(note.date);
            noteDate.setHours(0, 0, 0, 0);
            return noteDate.getTime() === today.getTime();
          });

          if (todayNoteIndex >= 0) {
            updatedDailyNotes[todayNoteIndex] = processedNote;
          } else {
            updatedDailyNotes.push(processedNote);
          }

          return {
            ...prev,
            dailyNotes: updatedDailyNotes,
          };
        });

        // Clear form
        setNoteText("");
        setConditionNotes("");
        setSelectedCondition("same");

        console.log("Note added successfully");
      } else {
        throw new Error(data.message || "Failed to add note");
      }
    } catch (error) {
      console.error("Error adding note:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getConditionIcon = (condition) => {
    switch (condition) {
      case "better":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "worse":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "better":
        return "bg-green-100 text-green-800 border-green-200";
      case "worse":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const formatTime = (timeSlot) => {
    const timeMap = {
      "Early Morning": "6:00 AM",
      Morning: "8:00 AM",
      Afternoon: "2:00 PM",
      Evening: "6:00 PM",
      Night: "10:00 PM",
    };
    return timeMap[timeSlot] || timeSlot;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Loading Treatments...
            </h2>
            <p className="text-gray-600">
              Please wait while we fetch your treatment data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Treatments
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchActiveTreatments}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTreatment && treatments.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Active Treatments
            </h2>
            <p className="text-gray-600">
              Upload a health report with medicines to start tracking your
              treatment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Treatment Dashboard
              </h1>
              <p className="text-gray-600">
                Track your medications and monitor progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedTreatment.progress.adherencePercentage}%
                </div>
                <div className="text-sm text-gray-500">Adherence</div>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Treatment Selection */}
          {treatments.length > 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  Treatments:
                </span>
                {treatments.map((treatment) => (
                  <button
                    key={treatment._id}
                    onClick={() => setSelectedTreatment(treatment)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedTreatment?._id === treatment._id
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {treatment.patientName} - {treatment.doctorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("treatments")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "treatments"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Current Treatments & Progress
            </button>
            <button
              onClick={() => setActiveTab("medicines")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "medicines"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Pill className="w-4 h-4 inline mr-2" />
              Today's Medicines
            </button>
          </div>
        </div>

        {activeTab === "treatments" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Treatment Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Treatment Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    Treatment Overview
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {selectedTreatment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Patient
                    </label>
                    <p className="text-gray-800 font-medium">
                      {selectedTreatment.patientName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Doctor
                    </label>
                    <p className="text-gray-800 font-medium">
                      {selectedTreatment.doctorName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Hospital
                    </label>
                    <p className="text-gray-800 font-medium">
                      {selectedTreatment.hospital}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Duration
                    </label>
                    <p className="text-gray-800 font-medium">
                      {selectedTreatment.totalDays} days
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>
                      {selectedTreatment.progress.totalMedicinesTaken} /{" "}
                      {selectedTreatment.progress.totalMedicinesDue} doses
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${selectedTreatment.progress.adherencePercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Medicines List */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    Prescribed Medicines
                  </h4>
                  <div className="space-y-3">
                    {selectedTreatment.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {medicine.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {medicine.dose} • {medicine.frequency}x daily
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {medicine.timing.map((time, timeIndex) => (
                            <span
                              key={timeIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Condition Progress Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Condition Progress
                </h3>
                <div className="space-y-3">
                  {selectedTreatment.dailyNotes.map((note, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-xs font-medium">
                          {note.date.getDate()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Day {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            {note.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getConditionColor(
                            note.condition,
                          )}`}
                        >
                          <span className="flex items-center">
                            {getConditionIcon(note.condition)}
                            <span className="ml-1 capitalize">
                              {note.condition}
                            </span>
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-6">
              {/* Add Note Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Daily Note
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How are you feeling today?
                    </label>
                    <div className="flex space-x-2">
                      {["same", "better", "worse"].map((condition) => (
                        <button
                          key={condition}
                          onClick={() => setSelectedCondition(condition)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            selectedCondition === condition
                              ? getConditionColor(condition)
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <span className="flex items-center">
                            {getConditionIcon(condition)}
                            <span className="ml-1 capitalize">{condition}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add a note
                    </label>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="How are you feeling? Any side effects or improvements?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition details (optional)
                    </label>
                    <input
                      type="text"
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      placeholder="Any specific symptoms or changes?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={addNote}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {loading ? "Adding Note..." : "Add Note"}
                  </button>
                </div>
              </div>

              {/* Recent Notes */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Recent Notes
                </h3>
                <div className="space-y-3">
                  {selectedTreatment.dailyNotes
                    .slice(0, 3)
                    .map((dayNote, dayIndex) => (
                      <div key={dayIndex}>
                        {dayNote.notes.map((note, noteIndex) => (
                          <div
                            key={noteIndex}
                            className="p-3 bg-gray-50 rounded-lg mb-2"
                          >
                            <p className="text-sm text-gray-800 mb-1">
                              {note.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {note.timestamp.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Today's Medicines Tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Today's Schedule
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {(() => {
                  const todaysMedicines = getTodaysMedicines(selectedTreatment);
                  if (!todaysMedicines) {
                    return (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                          No medicines scheduled for today
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {todaysMedicines.medicines.map((medicine, medIndex) => (
                        <div
                          key={medIndex}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <Pill className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">
                                  {medicine.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {medicine.dose}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-800">
                                {medicine.timings.filter((t) => t.taken).length}{" "}
                                / {medicine.timings.length}
                              </div>
                              <div className="text-xs text-gray-500">
                                completed
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {medicine.timings.map((timing, timingIndex) => (
                              <div
                                key={timingIndex}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  timing.taken
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {timing.name}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {formatTime(timing.name)}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  {timing.taken ? (
                                    <div className="flex items-center text-green-600">
                                      <CheckCircle className="w-5 h-5 mr-2" />
                                      <span className="text-sm">
                                        {timing.takenAt.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        markMedicineAsTaken(
                                          0,
                                          medIndex,
                                          timingIndex,
                                        )
                                      }
                                      disabled={todayMedicineLoading}
                                      className="flex items-center text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {todayMedicineLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                                      ) : (
                                        <Circle className="w-5 h-5 mr-2" />
                                      )}
                                      <span className="text-sm">
                                        {todayMedicineLoading
                                          ? "Marking..."
                                          : "Mark taken"}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Today's Progress</h3>

                {(() => {
                  const todaysMedicines = getTodaysMedicines(selectedTreatment);
                  const todaysTaken = todaysMedicines?.taken || 0;
                  const todaysTotal =
                    todaysMedicines?.totalMedicinesToTake || 0;
                  const percentage =
                    todaysTotal > 0
                      ? Math.round((todaysTaken / todaysTotal) * 100)
                      : 0;

                  return (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          {percentage}%
                        </div>
                        <div className="text-blue-100">Completed Today</div>
                      </div>

                      <div className="w-full bg-blue-400 rounded-full h-3">
                        <div
                          className="bg-white h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {todaysTaken}
                          </div>
                          <div className="text-blue-100 text-sm">Taken</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {todaysTotal - todaysTaken}
                          </div>
                          <div className="text-blue-100 text-sm">Remaining</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Achievement Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Achievements
                </h3>
                <div className="space-y-3">
                  {selectedTreatment.progress.adherencePercentage >= 80 && (
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Award className="w-6 h-6 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-yellow-800">
                          Great Adherence!
                        </p>
                        <p className="text-sm text-yellow-600">
                          80%+ medication adherence
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTreatment.dailyNotes.some(
                    (note) => note.condition === "better",
                  ) && (
                    <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">
                          Improving Health
                        </p>
                        <p className="text-sm text-green-600">
                          Condition showing improvement
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Heart className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Treatment Active
                      </p>
                      <p className="text-sm text-blue-600">
                        Day {selectedTreatment.days.length} of treatment
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentDashboard;
