import { useState } from "react";
import {
  Heart,
  Stethoscope,
  User,
  UserPlus,
  LogIn,
  Home,
  Activity,
  FileText,
  LogOut,
  ChevronDown,
  Plus,
  Globe,
  Crown,
  Menu,
  X,
  Shield,
  MessageCircle,
  UserCheck,
  Calendar,
  Clock,
  Video,
  Building,
  Pill,
  Search,
  ShoppingBag,
  Users,
  Briefcase,
  AlertTriangle,
  Settings,
  Database,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ModernNavbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPatientMenuOpen, setIsPatientMenuOpen] = useState(false);
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = useState(false);
  const [isConsultationMenuOpen, setIsConsultationMenuOpen] = useState(false);
  const [isClinicMenuOpen, setIsClinicMenuOpen] = useState(false);

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleAddReport = () => setIsAddReportOpen(!isAddReportOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const togglePatientMenu = () => setIsPatientMenuOpen(!isPatientMenuOpen);
  const toggleDoctorMenu = () => setIsDoctorMenuOpen(!isDoctorMenuOpen);
  const toggleConsultationMenu = () =>
    setIsConsultationMenuOpen(!isConsultationMenuOpen);
  const toggleClinicMenu = () => setIsClinicMenuOpen(!isClinicMenuOpen);

  const { isLoggedIn, user } = useAuth();

  const loggedInNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: Activity },
  ];

  const loggedOutNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Sign Up", href: "/signup", icon: UserPlus },
    { name: "Login", href: "/login", icon: LogIn },
  ];

  const navItems = isLoggedIn ? loggedInNavItems : loggedOutNavItems;

  // Patient Services Menu
  const patientMenuItems = [
    {
      name: "My Reports",
      href: "/reports",
      icon: FileText,
      description: "View your medical reports",
    },
    {
      name: "Current Treatment",
      href: "/current",
      icon: Activity,
      description: "Ongoing treatments",
    },
    {
      name: "Medical Chat",
      href: "/chat",
      icon: MessageCircle,
      description: "Chat with AI assistant",
    },
    {
      name: "Request Consultation",
      href: "/request-consultant",
      icon: Calendar,
      description: "Book doctor consultation",
    },
    {
      name: "Enable Emergency",
      href: "/enable-emergency",
      icon: Shield,
      description: "Setup emergency contacts",
    },
  ];

  // Doctor Services Menu
  const doctorMenuItems = [
    {
      name: "Register as Doctor",
      href: "/register-doctor",
      icon: UserCheck,
      description: "Join our medical team",
    },
    {
      name: "Doctor Dashboard",
      href: "/doctor-dashboard",
      icon: Briefcase,
      description: "Manage your practice",
    },
    {
      name: "All Treatments",
      href: "/doctor-all-treatments",
      icon: Users,
      description: "View patient treatments",
    },
    {
      name: "Consultation Requests",
      href: "/doctor/consultants",
      icon: Calendar,
      description: "Pending consultations",
    },
  ];

  // Consultation Services Menu
  const consultationMenuItems = [
    {
      name: "Video Call",
      href: "/videocall",
      icon: Video,
      description: "Join video consultation",
    },
    {
      name: "Request Consultation",
      href: "/request-consultant",
      icon: Calendar,
      description: "Book new consultation",
    },
  ];

  // Clinic Services Menu
  const clinicMenuItems = [
    {
      name: "Register Clinic",
      href: "/clinic/register",
      icon: Building,
      description: "Register your clinic",
    },
    {
      name: "Manage Medicines",
      href: "/clinic/my-medicines",
      icon: Pill,
      description: "Your medicine inventory",
    },
    {
      name: "Add Medicine",
      href: "/clinic/add-medicine",
      icon: Plus,
      description: "Add new medicine",
    },
    {
      name: "Search Medicines",
      href: "/clinic/medicine/search",
      icon: Search,
      description: "Find medicines",
    },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/auth/logout",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        closeAllMenus();
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      closeAllMenus();
    }
  };

  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsAddReportOpen(false);
    setIsMobileMenuOpen(false);
    setIsPatientMenuOpen(false);
    setIsDoctorMenuOpen(false);
    setIsConsultationMenuOpen(false);
    setIsClinicMenuOpen(false);
  };

  const DropdownMenu = ({
    items,
    isOpen,
    onToggle,
    title,
    icon: IconComponent,
    colorScheme = "blue",
  }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group relative px-3 xl:px-5 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 hover:shadow-lg"
      >
        <div className="flex items-center space-x-2">
          <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative">
            {title}
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-blue-200 group-hover:w-full transition-all duration-300"></div>
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white/96 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-[60] transform transition-all duration-200">
          <div className="p-2">
            {items.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-4 px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-${colorScheme}-50 hover:to-${colorScheme}-100 transition-all duration-300 rounded-xl group ${
                    index < items.length - 1 ? "mb-1" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 bg-gradient-to-br from-${colorScheme}-100 to-${colorScheme}-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}
                  >
                    <ItemIcon className={`h-5 w-5 text-${colorScheme}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 group-hover:text-gray-700">
                      {item.description}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg] group-hover:text-gray-600 transition-colors duration-300" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const MobileDropdown = ({
    items,
    isOpen,
    onToggle,
    title,
    icon: IconComponent,
    colorScheme = "blue",
  }) => (
    <div className="mb-4">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center justify-between w-full px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-${colorScheme}-50 hover:to-${colorScheme}-100 transition-all duration-300 rounded-2xl shadow-sm`}
      >
        <div className="flex items-center space-x-4">
          <div
            className={`w-10 h-10 bg-gradient-to-br from-${colorScheme}-100 to-${colorScheme}-200 rounded-xl flex items-center justify-center`}
          >
            <IconComponent className={`h-5 w-5 text-${colorScheme}-600`} />
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-${colorScheme}-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-3 ml-6 space-y-2">
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={closeAllMenus}
                className={`flex items-center space-x-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-${colorScheme}-50 hover:to-${colorScheme}-100 transition-all duration-300 rounded-xl group`}
              >
                <div
                  className={`w-8 h-8 bg-gradient-to-br from-${colorScheme}-100 to-${colorScheme}-200 rounded-lg flex items-center justify-center`}
                >
                  <ItemIcon className={`h-4 w-4 text-${colorScheme}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="relative z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 shadow-2xl backdrop-blur-lg w-full">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-teal-600/30 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 lg:h-24">
            {/* Enhanced Logo Section */}
            <div className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-white/40 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/25 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/40 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                  <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white group-hover:text-blue-100 drop-shadow-lg" />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                  CareConnect
                </h1>
                <p className="text-sm text-blue-100 opacity-90 hidden sm:block font-medium">
                  Advanced Healthcare Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group relative px-4 xl:px-6 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/15 backdrop-blur-sm border border-transparent hover:border-white/30 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="relative">
                        {item.name}
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-blue-200 group-hover:w-full transition-all duration-300"></div>
                      </span>
                    </div>
                  </a>
                );
              })}

              {/* Service Dropdowns - Desktop Only */}
              {isLoggedIn && (
                <>
                  <DropdownMenu
                    items={patientMenuItems}
                    isOpen={isPatientMenuOpen}
                    onToggle={togglePatientMenu}
                    title="Patient Services"
                    icon={User}
                    colorScheme="emerald"
                  />

                  <DropdownMenu
                    items={doctorMenuItems}
                    isOpen={isDoctorMenuOpen}
                    onToggle={toggleDoctorMenu}
                    title="Doctor Services"
                    icon={Stethoscope}
                    colorScheme="blue"
                  />

                  <DropdownMenu
                    items={consultationMenuItems}
                    isOpen={isConsultationMenuOpen}
                    onToggle={toggleConsultationMenu}
                    title="Consultations"
                    icon={Video}
                    colorScheme="purple"
                  />

                  <DropdownMenu
                    items={clinicMenuItems}
                    isOpen={isClinicMenuOpen}
                    onToggle={toggleClinicMenu}
                    title="Clinic Services"
                    icon={Building}
                    colorScheme="amber"
                  />

                  {/* Enhanced Add Report Dropdown */}
                  <div className="relative">
                    <button
                      onClick={toggleAddReport}
                      aria-expanded={isAddReportOpen}
                      aria-haspopup="true"
                      className="group relative px-3 xl:px-5 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/15 backdrop-blur-sm border border-transparent hover:border-white/30 hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Plus className="h-5 w-5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
                        <span className="relative">
                          Add Report
                          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-white to-blue-200 group-hover:w-full transition-all duration-300"></div>
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isAddReportOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isAddReportOpen && (
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white/96 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-[60]">
                        <div className="p-2">
                          <a
                            href="/add-report-web2"
                            className="flex items-center space-x-4 px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 transition-all duration-300 rounded-xl group mb-1"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                              <Globe className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">
                                Add in Web2
                              </p>
                              <p className="text-xs text-emerald-600 font-bold">
                                ✨ FREE FOREVER
                              </p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-100 rounded-full">
                              <span className="text-xs font-bold text-emerald-700">
                                FREE
                              </span>
                            </div>
                          </a>
                          <a
                            href="/add-report-web3"
                            className="flex items-center space-x-4 px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300 rounded-xl group"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                              <Crown className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">
                                Add in Web3
                              </p>
                              <p className="text-xs text-purple-600 font-bold">
                                👑 BLOCKCHAIN SECURED
                              </p>
                            </div>
                            <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full">
                              <span className="text-xs font-bold text-purple-700">
                                PRO
                              </span>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Enhanced User Profile Section - Desktop */}
              {isLoggedIn && (
                <div className="relative ml-6 pl-6 border-l border-white/30">
                  <button
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className="group flex items-center cursor-pointer space-x-3 px-4 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/15 backdrop-blur-sm border border-transparent hover:border-white/30 hover:shadow-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-white/30 to-white/20 rounded-full flex items-center justify-center shadow-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="hidden xl:block font-medium">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white/96 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-[60]">
                      <div className="px-5 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user?.email || "user@email.com"}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-5 py-4 cursor-pointer text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Emergency Button - Desktop */}
              <div className="ml-4">
                <a
                  href="/emergency"
                  className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 xl:px-7 py-3 rounded-2xl font-bold shadow-xl hover:shadow-red-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 border border-red-400/30"
                >
                  <Heart className="h-5 w-5 lg:h-6 lg:w-6 group-hover:animate-pulse" />
                  <span className="text-sm lg:text-base">Emergency</span>
                  <div className="absolute inset-0 bg-red-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 -z-10"></div>
                </a>
              </div>
            </div>

            {/* Enhanced Mobile Right Section */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Emergency Button - Mobile */}
              <a
                href="/emergency"
                className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 sm:px-4 sm:py-3 rounded-2xl font-bold shadow-xl hover:shadow-red-500/30 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
              >
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-pulse" />
                <span className="hidden sm:block text-sm font-bold">
                  Emergency
                </span>
                <div className="absolute inset-0 bg-red-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300 -z-10"></div>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
                className="group relative p-3 text-white/90 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/15 backdrop-blur-sm border border-transparent hover:border-white/30"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[45] lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={closeAllMenus}
          ></div>

          <div className="absolute top-18 sm:top-20 left-0 right-0 bg-white/97 backdrop-blur-xl shadow-2xl border-b border-white/30 overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="w-full px-4 sm:px-6 py-6">
              {/* Navigation Items */}
              <div className="space-y-3 mb-8">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={closeAllMenus}
                      className="group flex items-center space-x-4 px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 rounded-2xl shadow-sm"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="font-semibold">{item.name}</span>
                    </a>
                  );
                })}
              </div>

              {/* Mobile Service Dropdowns */}
              {isLoggedIn && (
                <>
                  <MobileDropdown
                    items={patientMenuItems}
                    isOpen={isPatientMenuOpen}
                    onToggle={togglePatientMenu}
                    title="Patient Services"
                    icon={User}
                    colorScheme="emerald"
                  />

                  <MobileDropdown
                    items={doctorMenuItems}
                    isOpen={isDoctorMenuOpen}
                    onToggle={toggleDoctorMenu}
                    title="Doctor Services"
                    icon={Stethoscope}
                    colorScheme="blue"
                  />

                  <MobileDropdown
                    items={consultationMenuItems}
                    isOpen={isConsultationMenuOpen}
                    onToggle={toggleConsultationMenu}
                    title="Consultations"
                    icon={Video}
                    colorScheme="purple"
                  />

                  <MobileDropdown
                    items={clinicMenuItems}
                    isOpen={isClinicMenuOpen}
                    onToggle={toggleClinicMenu}
                    title="Clinic Services"
                    icon={Building}
                    colorScheme="amber"
                  />

                  {/* Add Report Section - Mobile */}
                  <div className="mb-6">
                    <button
                      onClick={toggleAddReport}
                      aria-expanded={isAddReportOpen}
                      aria-haspopup="true"
                      className="group flex items-center justify-between w-full px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-300 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                          <Plus className="h-5 w-5 text-indigo-600 group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        <span className="font-semibold">Add Report</span>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-indigo-600 transition-transform duration-200 ${
                          isAddReportOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isAddReportOpen && (
                      <div className="mt-3 ml-6 space-y-3">
                        <a
                          href="/add-report-web2"
                          onClick={closeAllMenus}
                          className="flex items-center space-x-4 px-4 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 transition-all duration-300 rounded-xl group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                            <Globe className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">Add in Web2</p>
                            <p className="text-xs text-emerald-600 font-bold">
                              ✨ FREE FOREVER
                            </p>
                          </div>
                        </a>
                        <a
                          href="/add-report-web3"
                          onClick={closeAllMenus}
                          className="flex items-center space-x-4 px-4 py-4 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300 rounded-xl group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                            <Crown className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold">Add in Web3</p>
                            <p className="text-xs text-purple-600 font-bold">
                              👑 BLOCKCHAIN SECURED
                            </p>
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* User Profile Section - Mobile */}
              {isLoggedIn && (
                <div className="border-t border-gray-200/50 pt-6 mt-6">
                  <button
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className="group flex items-center justify-between w-full px-4 py-4 text-gray-800 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user?.email || "user@email.com"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="mt-3 ml-6">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-4 px-4 py-4 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-xl w-full text-left group"
                      >
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-semibold">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for closing dropdowns */}
      {(isUserMenuOpen ||
        isAddReportOpen ||
        isPatientMenuOpen ||
        isDoctorMenuOpen ||
        isConsultationMenuOpen ||
        isClinicMenuOpen) &&
        !isMobileMenuOpen && (
          <div className="fixed inset-0 z-[35]" onClick={closeAllMenus}></div>
        )}
    </>
  );
};

export default ModernNavbar;
