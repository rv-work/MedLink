// components/DoctorAllTreatments.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Activity,
  Users,
  CheckCircle,
  Pause,
  User,
  Building2,
  Calendar,
  TrendingUp,
  Eye,
  RefreshCw,
  AlertCircle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Timer,
  Mail,
  Stethoscope,
  Target,
  Award,
  BarChart3,
  Heart,
  CalendarDays,
} from "lucide-react";

const DoctorAllTreatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTreatments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTreatments = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };
      if (filter !== "all") {
        params.status = filter;
      }

      const response = await axios.get(
        "https://medlink-bh5c.onrender.com/api/doctor/get-treatments",
        {
          params,
          withCredentials: true,
        },
      );

      setTreatments(response.data.data.treatments);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch treatments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: {
        className:
          "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg shadow-green-200/30",
        icon: <Activity className="w-3 h-3" />,
      },
      completed: {
        className:
          "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-200/30",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      paused: {
        className:
          "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-200/30",
        icon: <Pause className="w-3 h-3" />,
      },
    };
    return {
      className: `px-3 py-1.5 rounded-full text-xs font-semibold transform hover:scale-105 transition-all duration-200 ${styles[status].className}`,
      icon: styles[status].icon,
    };
  };

  const getAdherenceColor = (percentage) => {
    if (percentage >= 80) return "from-green-400 to-green-600";
    if (percentage >= 60) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const getAdherenceIcon = (percentage) => {
    if (percentage >= 80) return <Target className="w-4 h-4 text-green-600" />;
    if (percentage >= 60)
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
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
              Loading Treatments
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-blue-200/20 border border-white/50 p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/30">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  All Treatments
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Manage and monitor all patient treatments</span>
                </div>
              </div>
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              {[
                {
                  key: "all",
                  label: "All Treatments",
                  icon: <BarChart3 className="w-4 h-4" />,
                },
                {
                  key: "active",
                  label: "Active",
                  icon: <Activity className="w-4 h-4" />,
                },
                {
                  key: "completed",
                  label: "Completed",
                  icon: <CheckCircle className="w-4 h-4" />,
                },
                {
                  key: "paused",
                  label: "Paused",
                  icon: <Pause className="w-4 h-4" />,
                },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    filter === key
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/30"
                      : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-lg shadow-md border border-gray-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {icon}
                    {label}
                  </span>
                  {filter === key && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-800 px-6 py-4 rounded-2xl mb-6 shadow-xl shadow-red-200/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-lg">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-gray-200/20 border border-white/50 overflow-hidden">
          {/* Treatments Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  {[
                    {
                      label: "Patient Information",
                      icon: <User className="w-4 h-4" />,
                    },
                    {
                      label: "Treatment Details",
                      icon: <Building2 className="w-4 h-4" />,
                    },
                    {
                      label: "Duration",
                      icon: <CalendarDays className="w-4 h-4" />,
                    },
                    {
                      label: "Status",
                      icon: <BarChart3 className="w-4 h-4" />,
                    },
                    {
                      label: "Adherence",
                      icon: <TrendingUp className="w-4 h-4" />,
                    },
                    { label: "Actions", icon: <Eye className="w-4 h-4" /> },
                  ].map(({ label, icon }) => (
                    <th
                      key={label}
                      className="px-6 py-4 text-left text-sm font-bold text-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        {icon}
                        {label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/60 divide-y divide-gray-100">
                {treatments.map((treatment) => (
                  <tr
                    key={treatment._id}
                    className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/30">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {treatment.patientName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              <span>{treatment.owner.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              <span>{treatment.owner.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {treatment.hospital}
                        </div>
                        <div className="text-xs text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 shadow-sm">
                          <Calendar className="w-3 h-3" />
                          {new Date(
                            treatment.startDate,
                          ).toLocaleDateString()} →{" "}
                          {new Date(treatment.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-purple-200/20 border border-purple-200">
                        <Timer className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-purple-800">
                          {treatment.totalDays} days
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={getStatusBadge(treatment.status).className}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusBadge(treatment.status).icon}
                          {treatment.status.toUpperCase()}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            {treatment.progress.adherencePercentage}%
                          </span>
                          {getAdherenceIcon(
                            treatment.progress.adherencePercentage,
                          )}
                        </div>
                        <div className="w-28 bg-gray-200 rounded-full h-2.5 shadow-inner">
                          <div
                            className={`h-2.5 rounded-full bg-gradient-to-r ${getAdherenceColor(
                              treatment.progress.adherencePercentage,
                            )} shadow-sm transition-all duration-500`}
                            style={{
                              width: `${treatment.progress.adherencePercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() =>
                          (window.location.href = `/doctor/treatment/${treatment._id}`)
                        }
                        className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200/30 hover:shadow-xl hover:shadow-blue-300/40 transform hover:scale-105 transition-all duration-300 hover:from-blue-600 hover:to-indigo-700"
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </span>
                        <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {treatments.length === 0 && !loading && (
            <div className="text-center py-20">
              <Search className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 mb-3">
                No treatments found
              </h3>
              <p className="text-gray-500 text-lg">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}

          {/* Enhanced Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-6 border-t border-gray-200">
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() =>
                    fetchTreatments(Math.max(1, pagination.page - 1))
                  }
                  disabled={pagination.page === 1}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 hover:text-blue-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-2 mx-4">
                  {Array.from(
                    { length: Math.min(5, pagination.pages) },
                    (_, i) => {
                      const startPage = Math.max(1, pagination.page - 2);
                      const page = startPage + i;
                      if (page > pagination.pages) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => fetchTreatments(page)}
                          className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-lg ${
                            page === pagination.page
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200/30"
                              : "bg-white text-gray-700 hover:bg-gray-50 shadow-gray-200/20 hover:shadow-xl"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() =>
                    fetchTreatments(
                      Math.min(pagination.pages, pagination.page + 1),
                    )
                  }
                  disabled={pagination.page === pagination.pages}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700 hover:text-blue-600"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mt-6">
                <span className="bg-white px-4 py-2 rounded-xl shadow-sm text-sm font-medium text-gray-600">
                  Showing page {pagination.page} of {pagination.pages}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAllTreatments;
