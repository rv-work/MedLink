// components/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/doctor/get-dashboard/",
        {
          withCredentials: true,
        }
      );
      setDashboardData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
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

  const { doctor, stats, activeTreatments, recentSummaries } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Doctor Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">
              Welcome back, <span className="font-semibold">{doctor.name}</span>
            </p>
            <p className="text-sm text-gray-500">
              {doctor.specialization} at {doctor.hospital}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Experience: {doctor.experienceYears} years
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-500 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Treatments</h3>
          <p className="text-3xl font-bold">{stats.activeTreatments}</p>
        </div>
        <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Treatments</h3>
          <p className="text-3xl font-bold">{stats.totalTreatments}</p>
        </div>
        <div className="bg-purple-500 text-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold">{stats.completedTreatments}</p>
        </div>
      </div>

      {/* Active Treatments */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Active Treatments
        </h2>
        {activeTreatments.length === 0 ? (
          <p className="text-gray-500">No active treatments found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTreatments.map((treatment) => (
              <div
                key={treatment._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {treatment.patientName}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Patient: {treatment.owner.name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Hospital: {treatment.hospital}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Duration: {treatment.totalDays} days
                </p>
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Adherence:{" "}
                    <span className="font-semibold">
                      {treatment.progress.adherencePercentage}%
                    </span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${treatment.progress.adherencePercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    (window.location.href = `/doctor/treatment/${treatment._id}`)
                  }
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Summaries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Recent Summaries
        </h2>
        {recentSummaries.length === 0 ? (
          <p className="text-gray-500">No recent summaries found.</p>
        ) : (
          <div className="space-y-4">
            {recentSummaries.map((summary) => (
              <div
                key={summary._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">
                    {summary.treatment.patientName}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(summary.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Condition:{" "}
                  <span
                    className={`font-semibold ${
                      summary.condition === "better"
                        ? "text-green-600"
                        : summary.condition === "worse"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {summary.condition}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Adherence: {summary.medicineStats.adherence}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
