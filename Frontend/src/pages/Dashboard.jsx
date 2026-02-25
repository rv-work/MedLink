import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  User,
  Edit3,
  Sparkles,
  Heart,
  Activity,
  Droplet,
  Thermometer,
  Plus,
  Calendar,
  Phone,
  AlertTriangle,
  Pill,
  Stethoscope,
  TrendingUp,
  Weight,
  Ruler,
  Shield,
  Clock,
  MapPin,
  FileText,
  Eye,
  Zap,
  Target,
  Users,
  Settings,
  Download,
  Share2,
  Filter,
  MoreVertical,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Bookmark,
  Bell,
  Calendar as CalendarIcon,
  Scissors,
  Syringe,
  Home,
  Building2,
  UserCheck,
  Clock3,
  Utensils,
  Moon,
  Cigarette,
  Wine,
  Dumbbell,
  Bed,
  Wallet,
  Mail,
  CreditCard,
} from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const flyLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const flyRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const flyUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};
const flyDown = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Section refs for GSAP scroll-fly-in
  const quickStatsRef = useRef();
  const vitalsRowRef = useRef();
  const chartRowRef = useRef();
  const historyRowRef = useRef();
  const lifestyleRowRef = useRef();
  const summaryRef = useRef();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          "https://medlink-bh5c.onrender.com/api/user/dashboard",
          { method: "GET", credentials: "include" },
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUserData(data.user);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // GSAP scroll-fly effect
  useEffect(() => {
    if (loading || error) return;
    const items = [
      [quickStatsRef, { x: -120, opacity: 0 }, { x: 0, opacity: 1 }],
      [vitalsRowRef, { x: 120, opacity: 0 }, { x: 0, opacity: 1 }],
      [chartRowRef, { y: 80, opacity: 0 }, { y: 0, opacity: 1 }],
      [historyRowRef, { x: -100, opacity: 0 }, { x: 0, opacity: 1 }],
      [lifestyleRowRef, { x: 100, opacity: 0 }, { x: 0, opacity: 1 }],
      [summaryRef, { y: 120, opacity: 0 }, { y: 0, opacity: 1 }],
    ];
    items.forEach(([ref, from, to]) => {
      if (ref.current)
        gsap.fromTo(ref.current, from, {
          ...to,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        });
    });
    // Cleanup
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [loading, error]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getLatestValue = (records) => {
    if (!records || records.length === 0) return null;
    return records[records.length - 1];
  };
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };
  const handleAddNew = (section) =>
    alert(`Add new ${section} functionality would be implemented here`);

  const getBMIStatus = (bmi) => {
    if (!bmi) return "Unknown";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };
  const getBPStatus = (systolic, diastolic) => {
    if (!systolic || !diastolic) return "Unknown";
    if (systolic < 120 && diastolic < 80) return "Normal";
    if (systolic < 140 && diastolic < 90) return "Elevated";
    return "High";
  };
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "severe":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "mild":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "current":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          <h2 className="text-5xl font-bold  mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
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
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Connection Error
            </h2>
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
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

  // Get latest readings:
  const latestWeight = getLatestValue(userData?.weightRecords);
  const latestHeight = getLatestValue(userData?.heightRecords);
  const latestBMI = getLatestValue(userData?.vitals?.bmi);
  const latestBP = getLatestValue(userData?.vitals?.bloodPressure);
  const latestHeartRate = getLatestValue(userData?.vitals?.heartRate);
  const latestBloodSugar = getLatestValue(userData?.vitals?.bloodSugar);
  const latestCholesterol = getLatestValue(userData?.vitals?.cholesterol);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Profile Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={flyDown}
        transition={{ staggerChildren: 0.2 }}
        className="bg-white shadow-2xl border-b border-gray-100 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Profile left (fly left) */}
            <motion.div
              variants={flyLeft}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 w-full lg:w-auto"
            >
              {/* Enhanced Profile Picture with Ring Animation */}
              <div className="relative group flex-shrink-0">
                {userData.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={userData.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                  </div>
                )}
                {/* Status Indicator with Pulse Animation */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-500 rounded-full border-2 sm:border-3 lg:border-4 border-white flex items-center justify-center shadow-lg animate-pulse">
                  <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-white" />
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left w-full sm:flex-1">
                {/* Enhanced Name with Animated Gradient Text */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient leading-tight">
                  {userData.name}
                </h1>

                {/* Contact Info with Icons */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
                      {userData.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">
                      {userData.phone}
                    </span>
                  </div>
                </div>

                {/* Enhanced Badges */}
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 lg:gap-4 mt-3 sm:mt-4">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      Gender:
                    </span>
                    <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-bold shadow-md capitalize">
                      {userData.gender}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      Blood:
                    </span>
                    <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-xs font-bold shadow-md">
                      {userData.bloodGroup}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      Age:
                    </span>
                    <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-md">
                      {calculateAge(userData.dob)} years
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile right (fly right) */}
            <motion.div
              variants={flyRight}
              initial="hidden"
              animate="visible"
              className="w-full sm:w-auto text-center sm:text-right lg:text-right"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner max-w-sm mx-auto sm:max-w-none">
                <div className="space-y-2">
                  <div className="flex items-center justify-center sm:justify-end text-gray-600">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">
                      DOB: {formatDate(userData.dob)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-end text-gray-600">
                    <Wallet className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-500 flex-shrink-0" />
                    <span className="text-xs font-mono bg-gradient-to-r from-purple-100 to-pink-100 px-2 sm:px-3 py-1 rounded-full border break-all sm:break-normal">
                      <span className="hidden sm:inline">
                        {userData.walletAddress?.slice(0, 8)}...
                        {userData.walletAddress?.slice(-6)}
                      </span>
                      <span className="sm:hidden">
                        {userData.walletAddress?.slice(0, 6)}...
                        {userData.walletAddress?.slice(-4)}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-end text-gray-600">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 flex-shrink-0" />
                    <span className="text-xs">
                      Joined: {formatDate(userData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* QUICK STATS */}
        <div
          ref={quickStatsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          {/* Animate EACH CARD flying from alternating left/right! */}
          <motion.div
            variants={flyLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="group relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 hover:border-indigo-300 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-60"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Weight className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-indigo-700 font-bold bg-indigo-100 px-3 py-1 rounded-full shadow-sm">
                    CURRENT
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-semibold">
                  Current Weight
                </p>
                <p className="text-4xl font-black text-indigo-700 tracking-tight">
                  {latestWeight?.value || "N/A"}
                  <span className="text-xl font-medium ml-1">kg</span>
                </p>
                <p className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full inline-block">
                  {latestWeight ? formatDate(latestWeight.date) : "No data"}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={flyRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="group relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 hover:border-green-300 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-60"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Ruler className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-700 font-bold bg-green-100 px-3 py-1 rounded-full shadow-sm">
                    STABLE
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-semibold">Height</p>
                <p className="text-4xl font-black text-green-700 tracking-tight">
                  {latestHeight?.value || "N/A"}
                  <span className="text-xl font-medium ml-1">cm</span>
                </p>
                <p className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full inline-block">
                  {latestHeight ? formatDate(latestHeight.date) : "No data"}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={flyLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="group relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 hover:border-purple-300 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 opacity-60"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                      latestBMI
                        ? latestBMI.value < 18.5
                          ? "bg-blue-100 text-blue-700"
                          : latestBMI.value < 25
                            ? "bg-green-100 text-green-700"
                            : latestBMI.value < 30
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {latestBMI ? getBMIStatus(latestBMI.value) : "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-semibold">BMI Index</p>
                <p className="text-4xl font-black text-purple-700 tracking-tight">
                  {latestBMI?.value || "N/A"}
                </p>
                <p className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full inline-block">
                  {latestBMI ? formatDate(latestBMI.date) : "No data"}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={flyRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="group relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 hover:border-red-300 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 opacity-60"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200 to-pink-300 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                      latestBP
                        ? latestBP.systolic < 120 && latestBP.diastolic < 80
                          ? "bg-green-100 text-green-700"
                          : latestBP.systolic < 140 && latestBP.diastolic < 90
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {latestBP
                      ? getBPStatus(latestBP.systolic, latestBP.diastolic)
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-semibold">
                  Blood Pressure
                </p>
                <p className="text-4xl font-black text-red-700 tracking-tight">
                  {latestBP
                    ? `${latestBP.systolic}/${latestBP.diastolic}`
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full inline-block">
                  {latestBP ? formatDate(latestBP.date) : "No data"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Vitals ROW */}
        <div
          ref={vitalsRowRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Animate each from bottom */}
          <motion.div
            variants={flyUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-pink-600 font-medium">
                HEART RATE
              </span>
            </div>
            <p className="text-2xl font-bold text-pink-600 mb-1">
              {latestHeartRate?.value || "N/A"}{" "}
              <span className="text-sm">BPM</span>
            </p>
            <p className="text-xs text-gray-500">
              {latestHeartRate ? formatDate(latestHeartRate.date) : "No data"}
            </p>
          </motion.div>
          <motion.div
            variants={flyUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Droplet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-blue-600 font-medium">
                BLOOD SUGAR
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {latestBloodSugar?.value || "N/A"}{" "}
              <span className="text-sm">mg/dL</span>
            </p>
            <p className="text-xs text-gray-500">
              {latestBloodSugar ? formatDate(latestBloodSugar.date) : "No data"}
            </p>
          </motion.div>
          <motion.div
            variants={flyUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-yellow-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-yellow-600 font-medium">
                CHOLESTEROL
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mb-1">
              {latestCholesterol?.value || "N/A"}{" "}
              <span className="text-sm">mg/dL</span>
            </p>
            <p className="text-xs text-gray-500">
              {latestCholesterol
                ? formatDate(latestCholesterol.date)
                : "No data"}
            </p>
          </motion.div>
        </div>

        {/* CHARTS */}
        <div
          ref={chartRowRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <motion.div
            variants={flyLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Weight className="w-4 h-4 text-white" />
                </div>
                Weight & Height Tracking
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAddNew("weight")}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Weight
                </button>
              </div>
            </div>

            {userData?.weightRecords && userData.weightRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={userData.weightRecords.map((record) => ({
                    date: formatDate(record.date),
                    weight: record.value,
                    height:
                      userData?.heightRecords?.find(
                        (h) =>
                          new Date(h.date).toDateString() ===
                          new Date(record.date).toDateString(),
                      )?.value || latestHeight?.value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis
                    yAxisId="weight"
                    orientation="left"
                    stroke="#6366f1"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="height"
                    orientation="right"
                    stroke="#10b981"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    yAxisId="weight"
                    stroke="#6366f1"
                    strokeWidth={3}
                    name="Weight (kg)"
                    dot={{ fill: "#6366f1", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#6366f1", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="height"
                    yAxisId="height"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Height (cm)"
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-350 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No blood pressure data available</p>
                </div>
              </div>
            )}
          </motion.div>
          <motion.div
            variants={flyRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                Heart Rate
              </h3>
              <button
                onClick={() => handleAddNew("heart rate")}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Reading
              </button>
            </div>

            {userData?.vitals?.heartRate &&
            userData.vitals.heartRate.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={userData.vitals.heartRate.map((record) => ({
                    date: formatDate(record.date),
                    heartRate: record.value,
                  }))}
                >
                  <defs>
                    <linearGradient
                      id="heartRateGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fill="url(#heartRateGradient)"
                    dot={{ fill: "#ec4899", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#ec4899", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-350 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No heart rate data available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            variants={flyLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                  <Droplet className="w-4 h-4 text-white" />
                </div>
                Blood Sugar
              </h3>
              <button
                onClick={() => handleAddNew("blood sugar")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Reading
              </button>
            </div>

            {userData?.vitals?.bloodSugar &&
            userData.vitals.bloodSugar.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={userData.vitals.bloodSugar.map((record) => ({
                    date: formatDate(record.date),
                    bloodSugar: record.value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bloodSugar"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-350 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Droplet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No blood sugar data available</p>
                </div>
              </div>
            )}
          </motion.div>
          <motion.div
            variants={flyRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <Thermometer className="w-4 h-4 text-white" />
                </div>
                Cholesterol
              </h3>
              <button
                onClick={() => handleAddNew("cholesterol")}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Reading
              </button>
            </div>

            {userData?.vitals?.cholesterol &&
            userData.vitals.cholesterol.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={userData.vitals.cholesterol.map((record) => ({
                    date: formatDate(record.date),
                    cholesterol: record.value,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cholesterol"
                    stroke="#eab308"
                    strokeWidth={3}
                    dot={{ fill: "#eab308", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#eab308", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-350 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Thermometer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No cholesterol data available</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        {/* MEDICAL HISTORY (fly-in) */}
        <div
          ref={historyRowRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          <motion.div
            variants={flyLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                Allergies & Reactions
              </h3>
              <button
                onClick={() => handleAddNew("allergy")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Allergy
              </button>
            </div>

            {userData?.medicalHistory?.allergies &&
            userData.medicalHistory.allergies.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userData.medicalHistory.allergies.map((allergy, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-r-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-orange-600" />
                          {allergy.allergen}
                        </h4>
                        <p className="text-sm text-gray-600 font-medium">
                          {allergy.type}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(
                          allergy.severity,
                        )}`}
                      >
                        {allergy.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          REACTION
                        </p>
                        <p className="text-sm text-gray-800 bg-white p-2 rounded-lg">
                          {allergy.reaction}
                        </p>
                      </div>

                      {allergy.emergencyMedication && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            EMERGENCY MEDICATION
                          </p>
                          <p className="text-sm text-red-700 bg-red-50 p-2 rounded-lg font-medium flex items-center">
                            <Pill className="w-4 h-4 mr-1" />
                            {allergy.emergencyMedication}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 font-medium">
                          Onset Date:
                        </span>
                        <p className="text-gray-700">
                          {formatDate(allergy.onsetDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">
                          Last Reaction:
                        </span>
                        <p className="text-gray-700">
                          {formatDate(allergy.lastReaction)}
                        </p>
                      </div>
                    </div>

                    {allergy.verifiedBy && (
                      <div className="mt-3 flex items-center text-xs text-gray-600">
                        <UserCheck className="w-4 h-4 mr-1" />
                        Verified by:{" "}
                        <span className="font-medium ml-1">
                          {allergy.verifiedBy}
                        </span>
                      </div>
                    )}

                    {allergy.notes && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-2 border-yellow-400">
                        <p className="text-xs text-gray-600 font-medium mb-1">
                          SPECIAL NOTES
                        </p>
                        <p className="text-sm text-gray-800">{allergy.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No known allergies</p>
                <p className="text-sm">This is good for your health!</p>
              </div>
            )}
          </motion.div>
          <motion.div
            variants={flyRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                Chronic Conditions
              </h3>
              <button
                onClick={() => handleAddNew("chronic condition")}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Condition
              </button>
            </div>

            {userData?.medicalHistory?.chronicConditions &&
            userData.medicalHistory.chronicConditions.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userData.medicalHistory.chronicConditions.map(
                  (condition, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-teal-500 bg-gradient-to-r from-teal-50 to-green-50 p-6 rounded-r-2xl hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-lg text-gray-800 flex items-center">
                            <Stethoscope className="w-5 h-5 mr-2 text-teal-600" />
                            {condition.conditionName}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              Diagnosed: {formatDate(condition.diagnosedOn)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(
                            condition.severityLevel,
                          )}`}
                        >
                          {condition.severityLevel}
                        </span>
                      </div>

                      {condition.medicines &&
                        condition.medicines.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                              <Pill className="w-4 h-4 mr-1" />
                              Current Medications:
                            </p>
                            <div className="space-y-2">
                              {condition.medicines.map((med, medIndex) => (
                                <div
                                  key={medIndex}
                                  className="bg-white p-3 rounded-lg border border-gray-200"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {med.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {med.form} - {med.dose}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-teal-600">
                                        {med.frequency}
                                      </p>
                                      {med.timing && med.timing.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {med.timing.map((time, timeIndex) => (
                                            <span
                                              key={timeIndex}
                                              className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full"
                                            >
                                              {time}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {condition.triggers && condition.triggers.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <Zap className="w-4 h-4 mr-1" />
                            Known Triggers:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {condition.triggers.map((trigger, triggerIndex) => (
                              <span
                                key={triggerIndex}
                                className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {condition.precautions &&
                        condition.precautions.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              Precautions:
                            </p>
                            <div className="bg-yellow-50 p-3 rounded-lg border-l-2 border-yellow-400">
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {condition.precautions.map(
                                  (precaution, precIndex) => (
                                    <li key={precIndex}>{precaution}</li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </div>
                        )}

                      {condition.lastReviewDate && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock3 className="w-4 h-4 mr-1" />
                          Last reviewed: {formatDate(condition.lastReviewDate)}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No chronic conditions</p>
                <p className="text-sm">Excellent health status!</p>
              </div>
            )}
          </motion.div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            variants={flyLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Scissors className="w-4 h-4 text-white" />
                </div>
                Surgical History
              </h3>
              <button
                onClick={() => handleAddNew("surgery")}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Surgery
              </button>
            </div>

            {userData?.medicalHistory?.surgicalHistory &&
            userData.medicalHistory.surgicalHistory.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userData.medicalHistory.surgicalHistory.map(
                  (surgery, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-lg text-gray-800 flex items-center">
                          <Scissors className="w-5 h-5 mr-2 text-red-600" />
                          {surgery.procedure}
                        </h4>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                          {formatDate(surgery.date)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            SURGEON
                          </p>
                          <p className="text-sm text-gray-800 flex items-center">
                            <UserCheck className="w-4 h-4 mr-1" />
                            {surgery.surgeon}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            HOSPITAL
                          </p>
                          <p className="text-sm text-gray-800 flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {surgery.hospital}
                          </p>
                        </div>
                      </div>

                      {surgery.indication && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            INDICATION
                          </p>
                          <p className="text-sm text-gray-800 bg-white p-2 rounded-lg">
                            {surgery.indication}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        {surgery.anesthesia && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              ANESTHESIA
                            </p>
                            <p className="text-sm text-gray-700">
                              {surgery.anesthesia}
                            </p>
                          </div>
                        )}
                        {surgery.recoveryTime && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">
                              RECOVERY TIME
                            </p>
                            <p className="text-sm text-gray-700 flex items-center">
                              <Clock3 className="w-4 h-4 mr-1" />
                              {surgery.recoveryTime}
                            </p>
                          </div>
                        )}
                      </div>

                      {surgery.complications && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            COMPLICATIONS
                          </p>
                          <p className="text-sm text-gray-800 bg-green-50 p-2 rounded-lg border-l-2 border-green-400">
                            {surgery.complications}
                          </p>
                        </div>
                      )}

                      {surgery.pathologyReport && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            PATHOLOGY REPORT
                          </p>
                          <p className="text-sm text-gray-800 bg-blue-50 p-2 rounded-lg">
                            {surgery.pathologyReport}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-600">
                        {surgery.followUpDate && (
                          <span>
                            Follow-up: {formatDate(surgery.followUpDate)}
                          </span>
                        )}
                        {surgery.notes && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {surgery.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Scissors className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No surgical history</p>
                <p className="text-sm">No major surgeries recorded</p>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={flyRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Syringe className="w-4 h-4 text-white" />
                </div>
                Immunizations
              </h3>
              <button
                onClick={() => handleAddNew("immunization")}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Vaccine
              </button>
            </div>

            {userData?.medicalHistory?.immunizations &&
            userData.medicalHistory.immunizations.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userData.medicalHistory.immunizations.map(
                  (immunization, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-lg text-gray-800 flex items-center">
                          <Syringe className="w-5 h-5 mr-2 text-green-600" />
                          {immunization.vaccine}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                            immunization.status,
                          )}`}
                        >
                          {immunization.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            DOSES RECEIVED
                          </p>
                          <p className="text-sm text-gray-800 font-bold">
                            {immunization.doses}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            LAST DOSE
                          </p>
                          <p className="text-sm text-gray-800">
                            {formatDate(immunization.lastDate)}
                          </p>
                        </div>
                      </div>

                      {immunization.nextDue && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            NEXT DUE
                          </p>
                          <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded-lg flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(immunization.nextDue)}
                          </p>
                        </div>
                      )}

                      {immunization.provider && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium mb-1">
                            PROVIDER
                          </p>
                          <p className="text-sm text-gray-800 flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {immunization.provider}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        {immunization.lotNumber && (
                          <div>
                            <span className="font-medium">Lot #:</span>{" "}
                            {immunization.lotNumber}
                          </div>
                        )}
                        {immunization.sideEffects && (
                          <div>
                            <span className="font-medium">Side Effects:</span>{" "}
                            {immunization.sideEffects}
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Syringe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No immunization records</p>
                <p className="text-sm">Add vaccination history</p>
              </div>
            )}
          </motion.div>
        </div>
        {/* LIFESTYLE & EMERGENCY (fly-in) */}
        <div
          ref={lifestyleRowRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Enhanced Lifestyle */}
          <motion.div
            variants={flyLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <Activity className="w-4 h-4 text-white" />
              </div>
              Lifestyle Information
            </h3>

            {userData?.lifestyle ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl border border-red-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-2">
                    <Cigarette className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Smoking Status
                    </p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg capitalize">
                    {userData.lifestyle.smokingStatus}
                  </p>
                  {userData.lifestyle.smokingStatus === "never" && (
                    <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      Excellent!
                    </span>
                  )}
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-2">
                    <Wine className="w-5 h-5 text-purple-600 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Alcohol Consumption
                    </p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg capitalize">
                    {userData.lifestyle.alcoholConsumption}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-2xl border border-green-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-2">
                    <Dumbbell className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Exercise Frequency
                    </p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg capitalize">
                    {userData.lifestyle.exerciseFrequency}
                  </p>
                  {userData.lifestyle.exerciseFrequency === "active" && (
                    <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      Great!
                    </span>
                  )}
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-2xl border border-orange-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-2">
                    <Utensils className="w-5 h-5 text-orange-600 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Diet Type
                    </p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg capitalize">
                    {userData.lifestyle.dietType}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 hover:shadow-md transition-all duration-200 md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Bed className="w-5 h-5 text-blue-600 mr-2" />
                    <p className="text-sm text-gray-600 font-medium">
                      Sleep Duration
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold text-gray-800 text-lg">
                      {userData.lifestyle.sleepDuration} hours per night
                    </p>
                    {parseInt(userData.lifestyle.sleepDuration) < 6 && (
                      <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        Consider more sleep
                      </span>
                    )}
                    {parseInt(userData.lifestyle.sleepDuration) >= 7 &&
                      parseInt(userData.lifestyle.sleepDuration) <= 9 && (
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Optimal!
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No lifestyle information available</p>
              </div>
            )}
          </motion.div>

          {/* Enhanced Emergency Contacts */}
          <motion.div
            variants={flyRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                Emergency Contacts
              </h3>
              <button
                onClick={() => handleAddNew("emergency contact")}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Contact
              </button>
            </div>

            {userData?.emergencyContacts &&
            userData.emergencyContacts.length > 0 ? (
              <div className="space-y-4">
                {userData.emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">
                          {contact.name}
                        </h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                            {contact.relation}
                          </span>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-1" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:text-red-600 transition-colors"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <button className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors mb-2">
                          <Phone className="w-5 h-5" />
                        </button>
                        <span className="text-xs text-gray-500">Call</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No emergency contacts</p>
                <p className="text-sm">Add emergency contacts for safety</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Emergency Status:
                  </p>
                  <p className="text-xs text-yellow-700">
                    {userData?.emergencyEnabled
                      ? "Emergency contacts enabled"
                      : "Emergency contacts disabled"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* SUMMARY PANEL (fly-up) */}
        <div
          ref={summaryRef}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8"
        >
          <motion.h3
            variants={flyUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Complete Health Overview
          </motion.h3>

          {/* vitals cards: animate each from bottom with stagger */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              variants={flyUp}
              className="bg-gradient-to-br from-red-50 via-red-100 to-red-50 p-6 rounded-2xl border border-red-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Heart className="w-10 h-10 text-red-500" />
                <span className="text-xs text-red-600 font-bold bg-red-200 px-2 py-1 rounded-full">
                  VITAL
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Blood Pressure
              </p>
              <p className="text-2xl font-bold text-red-700 mb-2">
                {latestBP
                  ? `${latestBP.systolic}/${latestBP.diastolic}`
                  : "N/A"}
              </p>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    latestBP
                      ? latestBP.systolic < 120 && latestBP.diastolic < 80
                        ? "bg-green-100 text-green-700"
                        : latestBP.systolic < 140 && latestBP.diastolic < 90
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {latestBP
                    ? getBPStatus(latestBP.systolic, latestBP.diastolic)
                    : "No data"}
                </span>
                <p className="text-xs text-gray-500">
                  {latestBP ? formatDate(latestBP.date) : "N/A"}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={flyUp}
              className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-6 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Droplet className="w-10 h-10 text-blue-500" />
                <span className="text-xs text-blue-600 font-bold bg-blue-200 px-2 py-1 rounded-full">
                  GLUCOSE
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Blood Sugar
              </p>
              <p className="text-2xl font-bold text-blue-700 mb-2">
                {latestBloodSugar?.value || "N/A"}{" "}
                <span className="text-sm">mg/dL</span>
              </p>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    latestBloodSugar
                      ? latestBloodSugar.value < 100
                        ? "bg-green-100 text-green-700"
                        : latestBloodSugar.value < 126
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {latestBloodSugar
                    ? latestBloodSugar.value < 100
                      ? "Normal"
                      : latestBloodSugar.value < 126
                        ? "Elevated"
                        : "High"
                    : "No data"}
                </span>
                <p className="text-xs text-gray-500">
                  {latestBloodSugar ? formatDate(latestBloodSugar.date) : "N/A"}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={flyUp}
              className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 p-6 rounded-2xl border border-yellow-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Thermometer className="w-10 h-10 text-yellow-500" />
                <span className="text-xs text-yellow-600 font-bold bg-yellow-200 px-2 py-1 rounded-full">
                  LIPID
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Cholesterol
              </p>
              <p className="text-2xl font-bold text-yellow-700 mb-2">
                {latestCholesterol?.value || "N/A"}{" "}
                <span className="text-sm">mg/dL</span>
              </p>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    latestCholesterol
                      ? latestCholesterol.value < 200
                        ? "bg-green-100 text-green-700"
                        : latestCholesterol.value < 240
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {latestCholesterol
                    ? latestCholesterol.value < 200
                      ? "Good"
                      : latestCholesterol.value < 240
                        ? "Borderline"
                        : "High"
                    : "No data"}
                </span>
                <p className="text-xs text-gray-500">
                  {latestCholesterol
                    ? formatDate(latestCholesterol.date)
                    : "N/A"}
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={flyUp}
              className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-50 p-6 rounded-2xl border border-pink-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-10 h-10 text-pink-500" />
                <span className="text-xs text-pink-600 font-bold bg-pink-200 px-2 py-1 rounded-full">
                  CARDIAC
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Heart Rate
              </p>
              <p className="text-2xl font-bold text-pink-700 mb-2">
                {latestHeartRate?.value || "N/A"}{" "}
                <span className="text-sm">BPM</span>
              </p>
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    latestHeartRate
                      ? latestHeartRate.value >= 60 &&
                        latestHeartRate.value <= 100
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {latestHeartRate
                    ? latestHeartRate.value >= 60 &&
                      latestHeartRate.value <= 100
                      ? "Normal"
                      : "Monitor"
                    : "No data"}
                </span>
                <p className="text-xs text-gray-500">
                  {latestHeartRate ? formatDate(latestHeartRate.date) : "N/A"}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Health Insights Panel */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={flyLeft}
            className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="absolute top-4 right-4 w-24 h-24 border-2 border-white/20 rounded-full animate-spin-slow"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-lg rotate-45 animate-bounce"></div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold mb-8 flex items-center">
                <Sparkles className="w-8 h-8 mr-3 text-yellow-300 animate-pulse drop-shadow-lg" />
                AI Health Insights
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* BMI */}
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-105 hover:bg-white/20 transition-all duration-300">
                  <div className="bg-gradient-to-tr from-green-400 to-green-600 p-3 rounded-full inline-block mb-4 shadow-md">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm text-white/80 font-medium mb-1">
                    BMI Status
                  </p>
                  <p className="font-bold text-2xl text-white">
                    {latestBMI?.value
                      ? getBMIStatus(latestBMI.value)
                      : "Unknown"}
                  </p>
                  {latestBMI?.value && (
                    <p className="mt-2 text-xs px-2 py-1 bg-white/20 rounded-full inline-block">
                      BMI: {latestBMI.value.toFixed(1)}
                    </p>
                  )}
                </div>

                {/* Cardiovascular */}
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-105 hover:bg-white/20 transition-all duration-300">
                  <div className="bg-gradient-to-tr from-red-400 to-red-600 p-3 rounded-full inline-block mb-4 shadow-md">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm text-white/80 font-medium mb-1">
                    Cardiovascular
                  </p>
                  <p className="font-bold text-2xl text-white">
                    {latestBP
                      ? getBPStatus(latestBP.systolic, latestBP.diastolic)
                      : "Unknown"}
                  </p>
                  <p className="mt-2 text-xs px-2 py-1 bg-white/20 rounded-full inline-block">
                    Monitor regularly
                  </p>
                </div>

                {/* Overall Health */}
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:scale-105 hover:bg-white/20 transition-all duration-300">
                  <div className="bg-gradient-to-tr from-blue-400 to-blue-600 p-3 rounded-full inline-block mb-4 shadow-md">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm text-white/80 font-medium mb-1">
                    Overall Health
                  </p>
                  <p className="font-bold text-2xl text-white">Good</p>
                  <p className="mt-2 text-xs px-2 py-1 bg-white/20 rounded-full inline-block">
                    Keep it up!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Information */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={flyRight}
            className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200"
          >
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Account Created</p>
                <p className="text-gray-800">
                  {formatDateTime(userData.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Last Updated</p>
                <p className="text-gray-800">
                  {formatDateTime(userData.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Profile Status</p>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-700 font-medium">Complete</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action buttons (fade/pop-in) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          className="flex flex-wrap gap-6 justify-center lg:justify-start"
        >
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
        </motion.div>
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
