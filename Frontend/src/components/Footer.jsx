import React from 'react'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Stethoscope, Shield, Clock, Users, ChevronRight, ExternalLink } from 'lucide-react'

const ModernFooter = () => {
  const quickLinks = [
    { name: 'About Us', href: '/about', icon: Users },
    { name: 'Sign Up', href: '/signup', icon: ChevronRight },
    { name: 'Login', href: '/login', icon: ChevronRight },
    { name: 'Privacy Policy', href: '/privacy', icon: Shield },
    { name: 'Terms of Service', href: '/terms', icon: ChevronRight },
  ]

  const services = [
    { name: 'Health Records', href: '/records', icon: Heart },
    { name: 'Telemedicine', href: '/telemedicine', icon: Stethoscope },
    { name: '24/7 Support', href: '/support', icon: Clock },
    { name: 'Emergency Care', href: '/emergency', icon: Heart },
  ]

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook, color: 'hover:bg-blue-600' },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter, color: 'hover:bg-sky-500' },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram, color: 'hover:bg-pink-600' },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin, color: 'hover:bg-blue-700' },
  ]

  return (
    <footer className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-teal-900 text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-teal-900/40 animate-pulse"></div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl animate-bounce" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-full border border-white/20 group-hover:scale-110 transition-all duration-300">
                  <Stethoscope className="h-8 w-8 text-white group-hover:text-blue-200" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  MediCare+
                </h2>
                <p className="text-xs text-blue-200 opacity-80">Healthcare Platform</p>
              </div>
            </div>
            
            <p className="text-white/80 text-base leading-relaxed mb-6">
              We are dedicated to providing a secure, modern platform to store, manage, and access your health data with complete privacy and 24/7 accessibility.
            </p>

            {/* Health Stats */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">System Status: Online</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-blue-300" />
                <span className="text-white/80 text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-purple-300" />
                <span className="text-white/80 text-sm">24/7 Monitoring</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <ChevronRight className="h-5 w-5 text-blue-300" />
              <span>Quick Links</span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all duration-300 border border-transparent hover:border-white/10"
                    >
                      <IconComponent className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-300" />
              <span>Our Services</span>
            </h3>
            <ul className="space-y-3">
              {services.map((service) => {
                const IconComponent = service.icon
                return (
                  <li key={service.name}>
                    <a 
                      href={service.href} 
                      className="group flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all duration-300 border border-transparent hover:border-white/10"
                    >
                      <IconComponent className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{service.name}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
              <Mail className="h-5 w-5 text-teal-300" />
              <span>Get in Touch</span>
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-white/80">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Email</p>
                  <p className="font-medium">support@medicare-plus.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-white/80">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-white/60">24/7 Hotline</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-white/80">
                <div className="bg-white/10 p-2 rounded-lg">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Address</p>
                  <p className="font-medium">Healthcare District, Medical City</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-sm text-white/80 mb-4">Follow us on social media</p>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:scale-110 transition-all duration-300 ${social.color}`}
                    >
                      <IconComponent className="h-5 w-5 text-white group-hover:text-white" />
                      <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-white/80">Get the latest health tips and platform updates delivered to your inbox</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
            />
            <button className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Subscribe</span>
              <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-white/60 text-sm">
              <p>© 2025 MediCare+ Health Platform. All Rights Reserved.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="/privacy" className="text-white/60 hover:text-white transition-colors duration-300 flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Privacy</span>
              </a>
              <a href="/terms" className="text-white/60 hover:text-white transition-colors duration-300">Terms</a>
              <a href="/cookies" className="text-white/60 hover:text-white transition-colors duration-300">Cookies</a>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/60">Secure Connection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
    </footer>
  )
}

export default ModernFooter