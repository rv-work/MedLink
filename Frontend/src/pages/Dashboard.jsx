import { useEffect, useState } from "react";
import {
  Heart,
  Activity,
  User,
  Phone,
  Mail,
  Calendar,
  Droplet,
  Scale,
  Shield,
  Pill,
  Utensils,
  AlertTriangle,
  TrendingUp,
  Plus,
  Edit3,
  Sparkles,
  Zap,
  Target,
  Award,
} from "lucide-react";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/user/dashboard",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
        console.log("data: ", data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(() => {
      fetchUserData();
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center relative z-10">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-6 bg-slate-900 rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-red-500 animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-ping" />
            <Zap className="absolute -bottom-4 -left-4 w-6 h-6 text-cyan-400 animate-bounce" />
          </div>
          <h2 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text  animate-pulse">
            Initializing Health Dashboard
          </h2>
          <p className="text-gray-300 text-xl mb-8">
            Analyzing your health data with AI insights...
          </p>
          <div className="flex justify-center space-x-3 mb-8">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-4 h-4 bg-pink-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-4 h-4 bg-cyan-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
          <div className="text-sm text-gray-400 animate-pulse">
            Powered by Advanced AI Analytics
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to Load Data
          </h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(userData.dob).getFullYear();
  const bmi =
    userData.weightRecords[0]?.value && userData.heightRecords[0]?.value
      ? (
          userData.weightRecords[0].value /
          Math.pow(userData.heightRecords[0].value / 100, 2)
        ).toFixed(1)
      : 0;

  const vitalsData = [
    {
      name: "Heart Rate",
      value: userData.vitals.heartRate,
      unit: "bpm",
      color: "#ef4444",
      bgGradient: "from-red-400 to-pink-500",
      icon: Heart,
      status: "normal",
    },
    {
      name: "Blood Sugar",
      value: userData.vitals.bloodSugar,
      unit: "mg/dL",
      color: "#f59e0b",
      bgGradient: "from-amber-400 to-orange-500",
      icon: Droplet,
      status: "excellent",
    },
    {
      name: "Cholesterol",
      value: userData.vitals.cholesterol,
      unit: "mg/dL",
      color: "#8b5cf6",
      bgGradient: "from-purple-400 to-indigo-500",
      icon: Activity,
      status: "good",
    },
    {
      name: "Systolic BP",
      value: userData.vitals.bloodPressure.systolic,
      unit: "mmHg",
      color: "#06b6d4",
      bgGradient: "from-cyan-400 to-blue-500",
      icon: TrendingUp,
      status: "optimal",
    },
  ];

  const lifestyleData = [
    {
      name: "Exercise",
      value: userData.lifestyle.exerciseFrequency,
      color: "#10b981",
      icon: Target,
    },
    {
      name: "Diet",
      value: userData.lifestyle.dietType,
      color: "#f59e0b",
      icon: Utensils,
    },
    {
      name: "Sleep",
      value: `${userData.lifestyle.sleepDuration}h`,
      color: "#8b5cf6",
      icon: Calendar,
    },
    {
      name: "Smoking",
      value: userData.lifestyle.smokingStatus,
      color: "#ef4444",
      icon: Shield,
    },
  ];

  const healthScore = Math.round(
    (userData.vitals.heartRate <= 100 ? 25 : 15) +
      (userData.vitals.bloodSugar <= 140 ? 25 : 15) +
      (userData.vitals.cholesterol <= 200 ? 25 : 15) +
      (userData.lifestyle.exerciseFrequency === "active" ? 25 : 15)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-100";
      case "optimal":
        return "text-blue-600 bg-blue-100";
      case "good":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-40 left-20 w-64 h-64 bg-gradient-to-r from-pink-200 to-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>

          {/* Floating geometric shapes */}
          <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white/20 rounded-full animate-spin"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-lg rotate-45 animate-bounce"></div>
          <div className="absolute top-1/2 right-8 w-8 h-8 bg-yellow-400/30 rounded-full animate-ping"></div>

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <Sparkles className="absolute -top-2 -left-2 w-6 h-6 text-yellow-300 animate-bounce" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                    Welcome back, {userData.name}
                  </h1>
                  <p className="text-xl text-blue-100 opacity-90 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Your Personalized Health Dashboard
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-6 h-6 text-blue-200" />
                    <span className="text-sm text-blue-100 font-medium">
                      Age
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{age} years</p>
                </div>
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <Droplet className="w-6 h-6 text-red-300" />
                    <span className="text-sm text-blue-100 font-medium">
                      Blood Group
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{userData.bloodGroup}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <Scale className="w-6 h-6 text-green-300" />
                    <span className="text-sm text-blue-100 font-medium">
                      BMI
                    </span>
                  </div>
                  <p className="text-3xl font-bold">{bmi}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <Shield className="w-6 h-6 text-purple-300" />
                    <span className="text-sm text-blue-100 font-medium">
                      Health Score
                    </span>
                  </div>
                  <p className="text-3xl font-bold flex items-center">
                    {healthScore}%
                    <Sparkles className="w-5 h-5 ml-2 text-yellow-300 animate-pulse" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Vital Signs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vitalsData.map((vital) => {
            const IconComponent = vital.icon;
            return (
              <div
                key={vital.name}
                className="group bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200/50 relative overflow-hidden"
              >
                {/* Background gradient effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${vital.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}
                ></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-r ${vital.bgGradient} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        {vital.value}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {vital.unit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-700 text-lg">
                      {vital.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        vital.status
                      )} capitalize`}
                    >
                      {vital.status}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${vital.bgGradient} transition-all duration-1000 shadow-sm relative`}
                      style={{
                        width: `${Math.min(
                          (vital.value /
                            (vital.name === "Heart Rate"
                              ? 100
                              : vital.name === "Blood Sugar"
                              ? 200
                              : 300)) *
                            100,
                          100
                        )}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Health Score */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>

            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center relative z-10">
              <TrendingUp className="w-8 h-8 mr-4 text-green-500" />
              Health Score Analytics
            </h3>
            <div className="h-96 flex flex-col items-center justify-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-56 h-56 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 p-2 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center relative">
                    <div className="text-center z-50">
                      <div className="text-5xl font-bold text-gray-800 mb-2">
                        {healthScore}%
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, #10b981 0deg ${
                      healthScore * 3.6
                    }deg, #e5e7eb ${healthScore * 3.6}deg 360deg)`,
                  }}
                ></div>

                <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-500 animate-bounce z-20" />
                <Award className="absolute -bottom-4 -left-4 w-8 h-8 text-purple-500 animate-pulse z-20" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>

            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center relative z-10">
              <Utensils className="w-8 h-8 mr-4 text-orange-500" />
              Lifestyle Overview
            </h3>
            <div className="space-y-6 relative z-10">
              {lifestyleData.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.name}
                    className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:from-white hover:to-gray-50 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: item.color }}
                        />
                      </div>
                      <span className="font-bold text-gray-700 text-lg">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-600 capitalize font-semibold bg-gray-100 px-4 py-2 rounded-xl">
                        {item.value}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Medical Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Medical History */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20"></div>

            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center relative z-10">
              <Pill className="w-8 h-8 mr-4 text-purple-500" />
              Medical History
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border-l-4 border-red-400">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                  Chronic Conditions (
                  {userData.medicalHistory.chronicConditions.length})
                </h4>
                <div className="grid gap-3">
                  {userData.medicalHistory.chronicConditions.map(
                    (condition, index) => (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-xl text-sm font-medium shadow-sm border border-red-100"
                      >
                        {condition}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-l-4 border-blue-400">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  Current Medications (
                  {userData.medicalHistory.medications.length})
                </h4>
                <div className="grid gap-3">
                  {userData.medicalHistory.medications.map(
                    (medication, index) => (
                      <div
                        key={index}
                        className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-xl text-sm font-medium shadow-sm border border-blue-100"
                      >
                        {medication}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-yellow-400">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                  Previous Surgeries ({userData.medicalHistory.surgeries.length}
                  )
                </h4>
                <div className="grid gap-3">
                  {userData.medicalHistory.surgeries.map((surgery, index) => (
                    <div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-3 rounded-xl text-sm font-medium shadow-sm border border-yellow-100"
                    >
                      {surgery}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Contact Information */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200/50 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-green-200 to-blue-200 rounded-full blur-3xl opacity-20"></div>

            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center relative z-10">
              <Phone className="w-8 h-8 mr-4 text-green-500" />
              Contact Information
            </h3>

            <div className="space-y-8 relative z-10">
              <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-200/50 shadow-lg">
                <h4 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  Personal Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 bg-white/70 p-4 rounded-xl shadow-sm">
                    <Mail className="w-6 h-6 text-blue-500" />
                    <span className="text-gray-700 font-medium">
                      {userData.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 bg-white/70 p-4 rounded-xl shadow-sm">
                    <Phone className="w-6 h-6 text-green-500" />
                    <span className="text-gray-700 font-medium">
                      {userData.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-red-50 via-orange-50 to-pink-50 rounded-2xl border-l-4 border-red-500 shadow-lg relative">
                <div className="absolute top-4 right-4">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <h4 className="font-bold text-gray-800 mb-6 flex items-center text-xl">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                  Emergency Contact
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/70 p-4 rounded-xl shadow-sm">
                    <span className="text-gray-600 font-medium">Name:</span>
                    <span className="font-bold text-gray-800">
                      {userData.emergencyContact.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/70 p-4 rounded-xl shadow-sm">
                    <span className="text-gray-600 font-medium">Phone:</span>
                    <span className="font-bold text-gray-800">
                      {userData.emergencyContact.phone}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/70 p-4 rounded-xl shadow-sm">
                    <span className="text-gray-600 font-medium">Relation:</span>
                    <span className="font-bold text-gray-800 capitalize">
                      {userData.emergencyContact.relation}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
          <button className="group cursor-pointer relative bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Plus className="w-6 h-6 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Add New Record</span>
            <Sparkles className="w-5 h-5 relative z-10 animate-pulse" />
          </button>

          <button className="group relative cursor-pointer bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Edit3 className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Update Profile</span>
            <Zap className="w-5 h-5 relative z-10 animate-bounce" />
          </button>

          <button className="group relative cursor-pointer bg-gradient-to-r from-red-500 via-pink-500 to-rose-600 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Heart className="w-6 h-6 relative z-10 group-hover:scale-110 animate-pulse transition-transform duration-300" />
            <span className="relative z-10">Emergency Services</span>
            <AlertTriangle className="w-5 h-5 relative z-10 animate-pulse" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
          <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full animate-spin"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-lg rotate-45 animate-bounce"></div>

          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-6 flex items-center">
              <Sparkles className="w-8 h-8 mr-4 animate-pulse" />
              AI Health Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-green-400 mr-3" />
                  <h4 className="font-bold text-xl">Health Goals</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Weight Target</span>
                    <span className="font-bold text-green-400">65kg</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="w-4/5 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm text-white/70">
                    You're 80% towards your goal!
                  </p>
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <Activity className="w-8 h-8 text-blue-400 mr-3" />
                  <h4 className="font-bold text-xl">Recommendations</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-white/90">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Increase sleep to 7-8 hours
                  </div>
                  <div className="flex items-center text-white/90">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                    Add 30 min cardio daily
                  </div>
                  <div className="flex items-center text-white/90">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Maintain current diet
                  </div>
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-yellow-400 mr-3" />
                  <h4 className="font-bold text-xl">Achievements</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-yellow-400">
                    <Award className="w-5 h-5 mr-2" />
                    <span className="text-sm">30-Day Streak</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <Heart className="w-5 h-5 mr-2" />
                    <span className="text-sm">Healthy Heart</span>
                  </div>
                  <div className="flex items-center text-purple-400">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="text-sm">Wellness Warrior</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="text-center py-8">
          <div className="flex justify-center items-center space-x-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">AI Powered</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
