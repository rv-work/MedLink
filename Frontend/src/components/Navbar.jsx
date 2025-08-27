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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ModernNavbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleAddReport = () => setIsAddReportOpen(!isAddReportOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const { isLoggedIn, user } = useAuth();

  const loggedInNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: Activity },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  const loggedOutNavItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Sign Up", href: "/signup", icon: UserPlus },
    { name: "Login", href: "/login", icon: LogIn },
  ];

  const navItems = isLoggedIn ? loggedInNavItems : loggedOutNavItems;

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        // Close menus first, then reload
        closeAllMenus();
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Still close menus on error
      closeAllMenus();
    }
  };

  const closeAllMenus = () => {
    setIsUserMenuOpen(false);
    setIsAddReportOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="relative z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 shadow-2xl backdrop-blur-lg">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-full border border-white/30 group-hover:scale-110 transition-all duration-300">
                  <Stethoscope className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white group-hover:text-blue-100" />
                </div>
              </div>
              <div className="text-white">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  MediCare+
                </h1>
                <p className="text-xs text-blue-100 opacity-80 hidden sm:block">
                  Healthcare Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group relative px-4 xl:px-6 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
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

              {/* Add Report Dropdown - Desktop Only */}
              {isLoggedIn && (
                <div className="relative ml-2">
                  <button
                    onClick={toggleAddReport}
                    aria-expanded={isAddReportOpen}
                    aria-haspopup="true"
                    className="group relative px-4 xl:px-6 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
                  >
                    <div className="flex items-center space-x-2">
                      <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
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

                  {/* Add Report Dropdown Menu */}
                  {isAddReportOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden z-[60]">
                      <a
                        href="/add-report-web2"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-green-50 transition-colors duration-200 border-b border-gray-200/50"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Globe className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Add in Web2</p>
                          <p className="text-xs text-green-600 font-semibold">
                            FREE
                          </p>
                        </div>
                      </a>
                      <a
                        href="/add-report-web3"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-purple-50 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Crown className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Add in Web3</p>
                          <p className="text-xs text-purple-600 font-semibold">
                            PREMIUM
                          </p>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Section - Desktop */}
              {isLoggedIn && (
                <div className="relative ml-6 pl-6 border-l border-white/20">
                  <button
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className="group flex items-center cursor-pointer space-x-2 px-4 py-2 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="hidden xl:block">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden z-[60]">
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-medium text-gray-800">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user?.email || "user@email.com"}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 cursor-pointer text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Emergency Button - Desktop */}
              <div className="ml-4">
                <a
                  href="/emergency"
                  className="group relative bg-red-500 hover:bg-red-600 text-white px-4 xl:px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                >
                  <Heart className="h-4 w-4 lg:h-5 lg:w-5 group-hover:animate-pulse" />
                  <span className="text-sm lg:text-base">Emergency</span>
                  <div className="absolute inset-0 bg-red-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>

            {/* Mobile Right Section */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Emergency Button - Mobile */}
              <a
                href="/emergency"
                className="group relative bg-red-500 hover:bg-red-600 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full font-semibold shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-1 sm:space-x-2"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse" />
                <span className="hidden sm:block text-sm">Emergency</span>
                <div className="absolute inset-0 bg-red-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
                className="group relative p-2 text-white/90 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
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

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 bg-white/5 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute -bottom-4 -left-4 w-20 sm:w-24 lg:w-32 h-20 sm:h-24 lg:h-32 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[45] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAllMenus}
          ></div>

          {/* Mobile Menu */}
          <div className="absolute top-16 sm:top-18 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-2xl border-b border-white/20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              {/* Navigation Items */}
              <div className="space-y-2 mb-6">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={closeAllMenus}
                      className="group flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-blue-50 transition-colors duration-200 rounded-xl"
                    >
                      <IconComponent className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  );
                })}
              </div>

              {/* Add Report Section - Mobile */}
              {isLoggedIn && (
                <div className="mb-6">
                  <button
                    onClick={toggleAddReport}
                    aria-expanded={isAddReportOpen}
                    aria-haspopup="true"
                    className="group flex items-center justify-between w-full px-4 py-3 text-gray-800 hover:bg-purple-50 transition-colors duration-200 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <Plus className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-medium">Add Report</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-purple-600 transition-transform duration-200 ${
                        isAddReportOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Add Report Options */}
                  {isAddReportOpen && (
                    <div className="mt-2 ml-8 space-y-2">
                      <a
                        href="/add-report-web2"
                        onClick={closeAllMenus}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 transition-colors duration-200 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Globe className="h-3 w-3 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Add in Web2</p>
                          <p className="text-xs text-green-600 font-semibold">
                            FREE
                          </p>
                        </div>
                      </a>
                      <a
                        href="/add-report-web3"
                        onClick={closeAllMenus}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-purple-50 transition-colors duration-200 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <Crown className="h-3 w-3 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Add in Web3</p>
                          <p className="text-xs text-purple-600 font-semibold">
                            PREMIUM
                          </p>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Section - Mobile */}
              {isLoggedIn && (
                <div className="border-t border-gray-200/50 pt-4">
                  <button
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    className="group flex items-center justify-between w-full px-4 py-3 text-gray-800 hover:bg-gray-50 transition-colors duration-200 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user?.email || "user@email.com"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Menu Options */}
                  {isUserMenuOpen && (
                    <div className="mt-2 ml-8">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Logout</span>
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
      {(isUserMenuOpen || isAddReportOpen) && !isMobileMenuOpen && (
        <div className="fixed inset-0 z-[35]" onClick={closeAllMenus}></div>
      )}
    </>
  );
};

export default ModernNavbar;
