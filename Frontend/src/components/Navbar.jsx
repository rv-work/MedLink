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
  Video,
  Building,
  Pill,
  Search,
  Users,
  Briefcase,
  Droplet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ModernNavbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleAddReport = () => setIsAddReportOpen(!isAddReportOpen);
  const toggleServices = () => setIsServicesOpen(!isServicesOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const { isLoggedIn, user } = useAuth();

  const navItems = isLoggedIn
    ? [
        { name: "Home", href: "/", icon: Home },
        { name: "Dashboard", href: "/dashboard", icon: Activity },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Sign Up", href: "/signup", icon: UserPlus },
        { name: "Login", href: "/login", icon: LogIn },
      ];

  // Grouped Services
  const servicesLinks = [
    {
      section: "Patient",
      items: [
        { name: "My Reports", href: "/reports", icon: FileText },
        { name: "Current Treatment", href: "/current", icon: Activity },
        { name: "Medical Chat", href: "/chat", icon: MessageCircle },
        { name: "Enable Emergency", href: "/enable-emergency", icon: Shield },
      ],
    },
    {
      section: "Doctor",
      items: [
        { name: "Register Doctor", href: "/register-doctor", icon: UserCheck },
        {
          name: "Doctor Dashboard",
          href: "/doctor-dashboard",
          icon: Briefcase,
        },
        { name: "All Treatments", href: "/doctor-all-treatments", icon: Users },
      ],
    },
    {
      section: "Clinic",
      items: [
        { name: "Register Clinic", href: "/clinic/register", icon: Building },
        { name: "Medicines", href: "/clinic/my-medicines", icon: Pill },
        { name: "Add Medicine", href: "/clinic/add-medicine", icon: Plus },
        { name: "Search", href: "/clinic/medicine/search", icon: Search },
      ],
    },

    // ✅ BLOOD SECTION ADDED
    {
      section: "Blood",
      items: [
        { name: "Blood Community", href: "/blood/community", icon: Droplet },
        {
          name: "All Blood Requests",
          href: "/blood/requests/all",
          icon: Droplet,
        },
        {
          name: "My Blood Requests",
          href: "/blood/requests/my",
          icon: Droplet,
        },
        {
          name: "Create Blood Request",
          href: "/blood/requests/create",
          icon: Plus,
        },
      ],
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
        },
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
    setIsServicesOpen(false);
    setIsMobileMenuOpen(false);
  };

  const ServicesDropdown = ({ isOpen, onToggle }) => (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="group relative px-2 py-2 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
      >
        <div className="flex items-center space-x-1">
          <Stethoscope className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="relative text-[15px]">Services</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 min-w-[350px] max-w-[90vw] bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 z-[60] p-4">
          <div className="space-y-2">
            {servicesLinks.map((section) => (
              <div key={section.section} className="mb-2">
                <div className="font-semibold text-xs text-blue-700 mb-1 pl-2">
                  {section.section}
                </div>
                <div className="flex flex-wrap gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        href={item.href}
                        key={item.name}
                        className="flex items-center px-2 py-1 text-xs rounded bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800 shadow-sm transition-all duration-150 mr-2 mb-2"
                      >
                        <Icon className="h-3.5 w-3.5 mr-1 text-blue-500" />
                        {item.name}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="relative z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 shadow-2xl w-full px-2">
        <div className="relative w-full px-2">
          <div className="flex items-center justify-between h-14">
            {/* Compact Logo Section */}
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <div className="relative bg-white/25 backdrop-blur-md p-2 rounded-xl border border-white/40 group-hover:scale-105 transition-all duration-300">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                MedLink
              </h1>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group relative px-2 py-2 text-white/90 hover:text-white font-medium text-sm transition-all duration-300 rounded-lg hover:bg-white/15 backdrop-blur-sm border border-transparent hover:border-white/30"
                  >
                    <div className="flex items-center space-x-1">
                      <IconComponent className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  </a>
                );
              })}

              {/* All Services in one dropdown */}
              {isLoggedIn && (
                <ServicesDropdown
                  isOpen={isServicesOpen}
                  onToggle={toggleServices}
                />
              )}

              {/* Add Report Dropdown */}
              {isLoggedIn && (
                <div className="relative">
                  <button
                    onClick={toggleAddReport}
                    aria-expanded={isAddReportOpen}
                    aria-haspopup="true"
                    className="group relative px-2 py-2 text-white/90 hover:text-white font-medium text-sm rounded-lg hover:bg-white/15 backdrop-blur-sm border border-transparent hover:border-white/30"
                  >
                    <div className="flex items-center space-x-1">
                      <Plus className="h-4 w-4" />
                      <span>Add Report</span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-200 ${
                          isAddReportOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>
                  {isAddReportOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-white/96 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 z-[60] p-2">
                      <a
                        href="/add-report-web2"
                        className="flex items-center space-x-2 px-2 py-2 text-gray-800 bg-blue-50 hover:bg-blue-100 rounded mb-1 text-xs"
                      >
                        <Globe className="h-4 w-4 text-blue-500" />
                        <span>Web2 (FREE)</span>
                      </a>
                      <a
                        href="/add-report-web3"
                        className="flex items-center space-x-2 px-2 py-2 text-gray-800 bg-purple-50 hover:bg-purple-100 rounded text-xs"
                      >
                        <Crown className="h-4 w-4 text-purple-500" />
                        <span>Web3 (PRO)</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Section */}
              {isLoggedIn && (
                <div className="relative ml-2 border-l border-white/30">
                  <button
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className="group flex items-center cursor-pointer space-x-1 px-2 py-2 text-white/90 hover:text-white font-medium text-sm transition-all duration-300 rounded-lg hover:bg-white/15 border border-transparent hover:border-white/30"
                  >
                    <div className="w-5 h-5 bg-gradient-to-br from-white/30 to-white/20 rounded-full flex items-center justify-center">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="hidden xl:block max-w-20 truncate">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-white/96 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 z-[60]">
                      <div className="px-2 py-2 border-b border-gray-200/50">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.email || "user@email.com"}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-2 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-all duration-200 rounded"
                      >
                        <LogOut className="h-3 w-3 mr-1 inline-block" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Emergency Button */}
              <div className="ml-2">
                <a
                  href="/emergency"
                  className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg font-bold shadow-lg hover:shadow-red-500/30 transition-all duration-200 flex items-center space-x-1"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-xs font-semibold">Emergency</span>
                </a>
              </div>
            </div>

            {/* Mobile Section */}
            <div className="flex lg:hidden items-center space-x-2">
              <a
                href="/emergency"
                className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-lg font-bold shadow-lg hover:shadow-red-500/30 transition-all duration-200 flex items-center space-x-1"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:block text-xs">Emergency</span>
              </a>
              <button
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
                className="group relative p-2 text-white/90 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/15 border border-transparent hover:border-white/30"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[45] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAllMenus}
          ></div>
          <div className="absolute top-14 left-0 right-0 bg-white/97 shadow-2xl border-b border-white/30 overflow-hidden max-h-[80vh] overflow-y-auto">
            <div className="w-full px-3 py-4">
              {/* Navigation Items */}
              <div className="space-y-2 mb-6">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={closeAllMenus}
                      className="group flex items-center space-x-2 px-3 py-3 text-gray-800 hover:bg-blue-50 rounded"
                    >
                      <IconComponent className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </a>
                  );
                })}
              </div>
              {/* ONE dropdown for services, paragraph style */}
              {isLoggedIn && (
                <div className="mb-4">
                  <button
                    onClick={toggleServices}
                    aria-expanded={isServicesOpen}
                    aria-haspopup="true"
                    className="group flex items-center justify-between w-full px-3 py-3 text-blue-800 bg-blue-50 hover:bg-blue-100 rounded transition-all duration-200 font-semibold"
                  >
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">Services</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-blue-600 transition-transform duration-200 ${
                        isServicesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isServicesOpen && (
                    <div className="bg-white border mt-2 rounded-xl px-3 py-2 text-xs shadow-xl">
                      {servicesLinks.map((section) => (
                        <div key={section.section} className="mb-2">
                          <span className="font-semibold text-blue-700">
                            {section.section}:{" "}
                          </span>
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <a
                                key={item.name}
                                href={item.href}
                                onClick={closeAllMenus}
                                className="inline-flex items-center px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 mr-2 mb-1 transition-all duration-100"
                              >
                                <Icon className="h-3 w-3 mr-1" />
                                {item.name}
                              </a>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Add Report */}
              {isLoggedIn && (
                <div className="mb-4">
                  <button
                    onClick={toggleAddReport}
                    aria-expanded={isAddReportOpen}
                    aria-haspopup="true"
                    className="group flex items-center justify-between w-full px-3 py-3 text-purple-800 bg-purple-50 hover:bg-purple-100 rounded font-semibold"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Add Report</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-purple-600 transition-transform duration-200 ${
                        isAddReportOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isAddReportOpen && (
                    <div className="bg-white border mt-2 rounded-xl px-3 py-2 text-xs shadow-lg">
                      <a
                        href="/add-report-web2"
                        onClick={closeAllMenus}
                        className="flex items-center px-2 py-2 mb-2 rounded bg-blue-50 hover:bg-blue-100 text-blue-700"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        Web2 (FREE)
                      </a>
                      <a
                        href="/add-report-web3"
                        onClick={closeAllMenus}
                        className="flex items-center px-2 py-2 rounded bg-purple-50 hover:bg-purple-100 text-purple-700"
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        Web3 (PRO)
                      </a>
                    </div>
                  )}
                </div>
              )}

              {isLoggedIn && (
                <div className="mt-2">
                  <button
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className="group flex items-center space-x-2 px-3 py-3 w-full text-gray-800 bg-gray-50 rounded mb-2 font-medium"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm truncate">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-blue-600 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isUserMenuOpen && (
                    <div className="bg-white border rounded-lg px-2 py-2 text-xs shadow-lg">
                      <div className="border-b pb-1 mb-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.email || "user@email.com"}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-2 py-2 rounded text-red-600 hover:bg-red-50 font-medium"
                      >
                        <LogOut className="h-3 w-3 mr-1" /> Logout
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
      {(isUserMenuOpen || isAddReportOpen || isServicesOpen) &&
        !isMobileMenuOpen && (
          <div className="fixed inset-0 z-[35]" onClick={closeAllMenus}></div>
        )}
    </>
  );
};

export default ModernNavbar;
