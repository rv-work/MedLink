import { useState } from "react";
import {
  Heart,
  Menu,
  X,
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
  Shield,
  Crown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ModernNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const toggleAddReport = () => setIsAddReportOpen(!isAddReportOpen);

  const { isLoggedIn, user } = useAuth();

  // Different navigation items based on login status
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
    console.log("inside handleLogout");
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="relative z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 shadow-2xl backdrop-blur-lg">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 group-hover:scale-110 transition-all duration-300">
                <Stethoscope className="h-8 w-8 text-white group-hover:text-blue-100" />
              </div>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                MediCare+
              </h1>
              <p className="text-xs text-blue-100 opacity-80">
                Healthcare Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group relative px-6 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
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

              {/* Add Report Dropdown - Only for Logged In Users */}
              {isLoggedIn && (
                <div className="relative ml-2">
                  <button
                    onClick={toggleAddReport}
                    className="group relative px-6 py-3 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
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
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden z-50">
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
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-gold-100 rounded-full flex items-center justify-center">
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

              {/* User Profile Section for Logged In Users */}
              {isLoggedIn && (
                <div className="relative ml-6 pl-6 border-l border-white/20">
                  <button
                    onClick={toggleUserMenu}
                    className="group flex items-center cursor-pointer space-x-2 px-4 py-2 text-white/90 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="hidden lg:block">
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
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden z-50">
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

              {/* Emergency Button - Always Show */}
              <div
                className={`${
                  isLoggedIn ? "ml-4" : "ml-6 pl-6 border-l border-white/20"
                }`}
              >
                <a
                  href="/emergency"
                  className="group relative bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                >
                  <Heart className="h-5 w-5 group-hover:animate-pulse" />
                  <span>Emergency</span>
                  <div className="absolute inset-0 bg-red-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="relative p-3 text-white hover:text-blue-100 focus:outline-none focus:text-blue-100 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-6 h-6 cursor-pointer relative">
                <Menu
                  className={`absolute inset-0 transform transition-all duration-300 ${
                    isOpen ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 transform transition-all duration-300 ${
                    isOpen ? "rotate-0 opacity-100" : "-rotate-180 opacity-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="py-4 space-y-2">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center space-x-3 px-6 py-4 text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-xl border border-transparent hover:border-white/20 transition-all duration-300 transform ${
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="relative">
                    <IconComponent className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="font-medium">{item.name}</span>
                  <div className="flex-1"></div>
                  <div className="w-2 h-2 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              );
            })}

            {/* Mobile Add Report Section */}
            {isLoggedIn && (
              <div className="px-6 pt-4 border-t border-white/20">
                <div className="text-white/70 text-sm font-medium mb-3">
                  Add Report
                </div>
                <a
                  href="/add-report-web2"
                  className="group flex items-center space-x-3 px-4 py-3 mb-2 text-white/90 hover:text-white hover:bg-green-500/20 backdrop-blur-sm rounded-xl border border-transparent hover:border-green-300/20 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-green-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Add in Web2</p>
                    <p className="text-xs text-green-300">FREE</p>
                  </div>
                </a>
                <a
                  href="/add-report-web3"
                  className="group flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-purple-500/20 backdrop-blur-sm rounded-xl border border-transparent hover:border-purple-300/20 transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Add in Web3</p>
                    <p className="text-xs text-purple-300">PREMIUM</p>
                  </div>
                </a>
              </div>
            )}

            {isLoggedIn && (
              <div className="px-6 pt-4 border-t border-white/20">
                <div className="flex items-center space-x-3 px-4 py-3 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-white/70">
                      {user?.email || "user@email.com"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full cursor-pointer flex items-center space-x-3 px-6 py-4 mt-2 text-red-200 hover:text-white hover:bg-red-500/20 backdrop-blur-sm rounded-xl border border-transparent hover:border-red-300/20 transition-all duration-300"
                >
                  <LogOut className="h-6 w-6" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Emergency Button */}
            <div className="px-6 pt-4 border-t border-white/20">
              <a
                href="/emergency"
                className="group flex items-center justify-center space-x-3 bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-1 transition-all duration-300"
                onClick={() => setIsOpen(false)}
              >
                <Heart className="h-6 w-6 group-hover:animate-pulse" />
                <span>Emergency Services</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Overlay for closing dropdowns */}
      {(isUserMenuOpen || isAddReportOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsAddReportOpen(false);
          }}
        ></div>
      )}
    </nav>
  );
};

export default ModernNavbar;
