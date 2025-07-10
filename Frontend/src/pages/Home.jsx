import React, { useState, useEffect } from "react";
import {
  Heart,
  Stethoscope,
  Shield,
  Users,
  Activity,
  Star,
  ChevronRight,
  Play,
  Check,
  Zap,
  Clock,
  Award,
  Globe,
  ArrowRight,
  Sparkles,
  TrendingUp,
  UserCheck,
  Database,
  Lock,
  Smartphone,
  Headphones,
  Calendar,
  FileText,
  AlertCircle,
  Plus,
} from "lucide-react";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {}, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "Your medical data is secured with advanced blockchain technology, ensuring complete privacy and data integrity.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      description:
        "Track your health metrics in real-time with our advanced monitoring systems and get instant alerts.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Expert Network",
      description:
        "Connect with certified healthcare professionals and get expert consultations from anywhere.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Database,
      title: "Secure Storage",
      description:
        "All your medical records are stored securely and can be accessed instantly when needed.",
      color: "from-orange-500 to-red-500",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      content:
        "This platform has revolutionized how I manage patient data. The security and accessibility are unmatched.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Michael Chen",
      role: "Patient",
      content:
        "Having all my medical records in one secure place gives me peace of mind. The interface is incredibly user-friendly.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "General Practitioner",
      content:
        "The blockchain security and real-time access to patient data has improved my practice efficiency significantly.",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1594824804732-ca095dbf4114?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users", icon: Users },
    { number: "500+", label: "Healthcare Providers", icon: UserCheck },
    { number: "99.9%", label: "Uptime Guarantee", icon: Shield },
    { number: "50K+", label: "Secure Records", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-20 opacity-0"
              }`}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-full">
                    <Stethoscope className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <span className="text-white/90 text-sm font-medium">
                    Next-Gen Healthcare Platform
                  </span>
                </div>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Your Health,
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Secured Forever
                </span>
              </h1>

              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Experience the future of healthcare with our blockchain-secured
                platform. Manage your medical records, connect with doctors, and
                take control of your health journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <button className="group relative bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500 hover:from-blue-600 hover:via-purple-700 hover:to-teal-600 px-8 py-4 rounded-2xl font-bold text-white shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative cursor-pointer flex items-center space-x-3">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>

                <button className="group flex cursor-pointer items-center space-x-3 px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl font-medium text-white transition-all duration-300">
                  <div className="relative bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors duration-300">
                    <Play className="h-5 w-5 ml-1" />
                  </div>
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 text-white/60">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-sm">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">256-bit Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  <span className="text-sm">ISO Certified</span>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Dashboard Preview */}
            <div
              className={`transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-20 opacity-0"
              }`}
            >
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">
                      Health Dashboard
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Live</span>
                    </div>
                  </div>

                  {/* Health Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 p-4 rounded-xl border border-red-400/30">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-6 w-6 text-red-400" />
                        <div>
                          <p className="text-white/60 text-sm">Heart Rate</p>
                          <p className="text-white font-bold text-lg">72 BPM</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-400/30">
                      <div className="flex items-center space-x-3">
                        <Activity className="h-6 w-6 text-blue-400" />
                        <div>
                          <p className="text-white/60 text-sm">Steps Today</p>
                          <p className="text-white font-bold text-lg">8,542</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Reports */}
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold mb-3">
                      Recent Reports
                    </h4>
                    {[
                      { type: "Blood Test", date: "Dec 15", status: "Normal" },
                      { type: "Cardiology", date: "Dec 10", status: "Review" },
                    ].map((report, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <div>
                            <p className="text-white text-sm font-medium">
                              {report.type}
                            </p>
                            <p className="text-white/60 text-xs">
                              {report.date}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            report.status === "Normal"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg animate-bounce">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-full shadow-lg animate-pulse">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-16 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </h3>
                <p className="text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Powerful Features for
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Modern Healthcare
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover how our cutting-edge technology transforms the way you
              manage and access healthcare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${
                      feature.color.split(" ")[1]
                    }, ${feature.color.split(" ")[3]})`,
                  }}
                ></div>
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6">
                    <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 group-hover:translate-x-2 transition-all duration-300">
                      <span className="text-sm font-medium">Learn More</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-white/70">
              Trusted by healthcare professionals and patients worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-white/20 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div>
                    <h4 className="text-white font-semibold">
                      {testimonial.name}
                    </h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-teal-500/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Ready to Transform Your Healthcare?
              </span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust our platform for secure,
              accessible, and comprehensive healthcare management.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group relative bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500 hover:from-blue-600 hover:via-purple-700 hover:to-teal-600 px-10 py-5 rounded-2xl font-bold text-white text-lg shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <span>Start Your Free Trial</span>
                  <Zap className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </button>

              <button className="group flex items-center space-x-3 px-10 py-5 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl font-medium text-white text-lg transition-all duration-300">
                <Headphones className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Talk to Sales</span>
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-400" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-400" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
    </div>
  );
};

export default Home;
