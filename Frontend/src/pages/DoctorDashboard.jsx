// components/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Users,
  CheckCircle,
  Clock,
  User,
  Building2,
  Calendar,
  TrendingUp,
  Eye,
  RefreshCw,
  AlertCircle,
  FileText,
  Award,
  Stethoscope,
  BarChart3,
  Heart,
  Smile,
  Frown,
  Meh,
  Target,
  ClipboardList,
} from "lucide-react";

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
        "https://medlink-bh5c.onrender.com/api/doctor/get-dashboard/",
        {
          withCredentials: true,
        },
      );
      setDashboardData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getAdherenceColor = (percentage) => {
    if (percentage >= 80) return "from-green-400 to-green-600";
    if (percentage >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const getConditionIcon = (condition) => {
    switch (condition) {
      case "better":
        return <Smile className="w-5 h-5" />;
      case "worse":
        return <Frown className="w-5 h-5" />;
      default:
        return <Meh className="w-5 h-5" />;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "better":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300";
      case "worse":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300";
      default:
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-transparent border-t-blue-500 shadow-2xl">
            <RefreshCw className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="absolute inset-0 animate-ping rounded-full h-24 w-24 border-4 border-blue-300 opacity-20"></div>
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2 flex items-center gap-2 justify-center">
              <Activity className="w-5 h-5" />
              Loading Dashboard
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200 p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-800 mb-4">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { doctor, stats, activeTreatments, recentSummaries } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-200/20 border border-white/50 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                  Welcome back, Dr. {doctor.name}!
                  <Heart className="w-8 h-8 text-red-500" />
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{doctor.specialization}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>{doctor.hospital}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-4 rounded-2xl border border-purple-200 shadow-lg shadow-purple-200/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-800">
                  {doctor.experienceYears}
                </div>
                <div className="text-sm text-purple-600 font-medium flex items-center gap-1 justify-center">
                  <Calendar className="w-3 h-3" />
                  Years Experience
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Active Treatments",
              value: stats.activeTreatments,
              icon: <Activity className="w-6 h-6" />,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100",
              shadowColor: "shadow-blue-200/30",
            },
            {
              title: "Total Treatments",
              value: stats.totalTreatments,
              icon: <BarChart3 className="w-6 h-6" />,
              gradient: "from-green-500 to-green-600",
              bgGradient: "from-green-50 to-green-100",
              shadowColor: "shadow-green-200/30",
            },
            {
              title: "Completed",
              value: stats.completedTreatments,
              icon: <CheckCircle className="w-6 h-6" />,
              gradient: "from-purple-500 to-purple-600",
              bgGradient: "from-purple-50 to-purple-100",
              shadowColor: "shadow-purple-200/30",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-xl ${stat.shadowColor} p-6 border border-white/50 transform hover:scale-105 transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:rotate-12 transition-transform duration-300`}
                >
                  <span className="text-white">{stat.icon}</span>
                </div>
                <div className="text-right">
                  <div
                    className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">
                {stat.title}
              </h3>
              <div
                className={`mt-3 h-1.5 bg-gradient-to-r ${stat.gradient} rounded-full shadow-sm`}
              ></div>
            </div>
          ))}
        </div>

        {/* Active Treatments */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200/20 border border-white/50 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Active Treatments
            </h2>
          </div>

          {activeTreatments.length === 0 ? (
            <div className="text-center py-16">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Active Treatments
              </h3>
              <p className="text-gray-500">
                All caught up! No active treatments at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTreatments.map((treatment) => (
                <div
                  key={treatment._id}
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg shadow-gray-200/20 hover:shadow-2xl hover:shadow-gray-300/30 border border-gray-200 p-6 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200/30">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {treatment.patientName}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Owner: {treatment.owner.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>Hospital: {treatment.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {treatment.totalDays} days</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Adherence
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {treatment.progress.adherencePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
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

                  <button
                    onClick={() =>
                      (window.location.href = `/doctor/treatment/${treatment._id}`)
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-300/40 transform hover:scale-105 transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-700"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Summaries */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200/20 border border-white/50 p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Recent Summaries
            </h2>
          </div>

          {recentSummaries.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Recent Summaries
              </h3>
              <p className="text-gray-500">
                Patient summaries will appear here as they're submitted.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSummaries.map((summary) => (
                <div
                  key={summary._id}
                  className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg shadow-gray-200/20 hover:shadow-xl hover:shadow-gray-300/30 border border-gray-200 p-6 transform hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200/30">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {summary.treatment.patientName}
                      </h3>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-xl shadow-sm">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(summary.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`px-4 py-3 rounded-xl border-2 ${getConditionColor(
                        summary.condition,
                      )} shadow-sm`}
                    >
                      <div className="flex items-center gap-2">
                        {getConditionIcon(summary.condition)}
                        <div>
                          <span className="text-sm font-medium">
                            Condition:
                          </span>
                          <span className="ml-2 font-bold capitalize">
                            {summary.condition}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-3 rounded-xl border-2 border-blue-300 shadow-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="text-sm font-medium text-blue-800">
                            Adherence:
                          </span>
                          <span className="ml-2 font-bold text-blue-900">
                            {summary.medicineStats.adherence}%
                          </span>
                        </div>
                      </div>
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

export default DoctorDashboard;
