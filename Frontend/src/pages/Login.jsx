import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  ArrowRight,
  Shield,
  Heart,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ModernLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { setIsLoggedIn } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // if (!formData.password) {
    //   newErrors.password = 'Password is required'
    // } else if (formData.password.length < 6) {
    //   newErrors.password = 'Password must be at least 6 characters'
    // }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Login successful!");
        setIsLoggedIn(true);
        navigate("/dashboard");
      }
      console.log("Login Success:", data);
    } catch (error) {
      console.error("Login Error:", error);
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-bounce"></div>
        <div
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        {/* Main login card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          {/* Card background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20 group-hover:scale-110 transition-all duration-300">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-white/80">Sign in to your MediCare+ account</p>
            </div>

            {/* Security features indicator */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-white/90">Secure Login</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70">Protected</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className=" text-white/90 font-medium flex items-center space-x-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-white/10 backdrop-blur-sm border ${
                      errors.email ? "border-red-500/50" : "border-white/20"
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-300 pl-12`}
                    placeholder="Enter your email address"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  {formData.email && !errors.email && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className=" text-white/90 font-medium flex items-center space-x-2"
                >
                  <Lock className="h-4 w-4" />
                  <span>Password</span>
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-white/10 backdrop-blur-sm border ${
                      errors.password ? "border-red-500/50" : "border-white/20"
                    } rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-300 pl-12 pr-12`}
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-5 h-5 bg-white/10 border border-white/30 rounded group-hover:bg-white/20 transition-all duration-300"></div>
                    <CheckCircle className="absolute inset-0 w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <span className="text-white/80 text-sm">Remember me</span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-blue-300 hover:text-blue-200 text-sm transition-colors duration-300"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500 hover:from-blue-600 hover:via-purple-700 hover:to-teal-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Social Login Options */}
            <div className="space-y-3">
              <button className="w-full bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 group">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span>Continue with Google</span>
              </button>

              <button className="w-full bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 group">
                <Heart className="h-5 w-5 text-red-400" />
                <span>Healthcare Provider Login</span>
              </button>
            </div>

            {/* Sign up link */}
            <div className="text-center mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <p className="text-white/80">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-300 inline-flex items-center space-x-1"
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom security info */}
        <div className="mt-6 text-center">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl px-6 py-3 inline-flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-white/80 text-sm">SSL Protected</span>
            </div>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-white/80 text-sm">HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin;
