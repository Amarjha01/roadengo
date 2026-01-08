import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { EllipsisVertical } from 'lucide-react';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

   const dropdownRef = useRef(null);

  // Close the dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropDownOpen(false);
      }
    };

    // Add event listener on mount
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
    {/* Emergency Topbar */}
<div className="bg-red-600 text-white text-xs sm:text-sm">
  <div className="max-w-7xl mx-auto px-4 py-2">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-6">
      {/* Left Section - Emergency Contact */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 animate-pulse">
          <i className="ri-phone-line text-yellow-300 text-sm"></i>
          <span className="font-semibold">Emergency Roadside Assistance</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-yellow-100">
          <span>|</span>
          <i className="ri-customer-service-2-line text-xs"></i>
          <span className="text-xs">+91-1800-XXX-XXXX</span>
        </div>
      </div>

      {/* Center Section - Quick Info */}
      <div className="hidden md:flex items-center gap-4 text-center">
        <div className="flex items-center gap-1">
          <i className="ri-map-pin-line text-yellow-300 text-xs"></i>
          <span className="text-xs">Pan-India Service</span>
        </div>
        <span className="text-yellow-100">•</span>
        <div className="flex items-center gap-1">
          <i className="ri-shield-check-line text-yellow-300 text-xs"></i>
          <span className="text-xs">Genuine Parts</span>
        </div>
      </div>

      {/* Right Section - Availability */}
      <div className="hidden md:flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">24/7 Available</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-yellow-100">
          <i className="ri-time-line text-xs"></i>
          <span className="text-xs">Response in 30 mins</span>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Main Navigation */}
      <nav className="bg-gray-900 shadow-lg px-4 py-3 sticky top-0 w-full z-50 border-t-2 border-red-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 h-10 overflow-hidden rounded-sm scale-125">
            <img src="/images/logo.jpeg" className="w-20 " alt="logo" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-100 hover:text-red-400  transition-colors relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/spare-parts"
              className="text-gray-100 hover:text-red-400  transition-colors relative group"
            >
              Spare Parts
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/services"
              className="text-gray-100 hover:text-red-400  transition-colors relative group"
            >
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/about"
              className="text-gray-100 hover:text-red-400  transition-colors relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/contact"
              className="text-gray-100 hover:text-red-400 font-semibold transition-colors relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all group-hover:w-full"></span>
            </Link>
          </div>
          
          {/* Desktop Booking Button */}
          <div className="hidden lg:flex lg:justify-center lg:items-center">
            <Link 
              to="/booking" 
              className=" hidden md:block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              <i className="ri-customer-service-2-fill"></i> Book Service
            </Link>
          </div>

          
          <div className=" flex justify-center items-center">
                
             <div className="lg:flex lg:justify-center lg:items-center">
            <div className="relative flex justify-center items-center group">
              
              {/* Icon */}
              <EllipsisVertical className="text-white cursor-pointer" />

              {/* Dropdown */}
              <div
                className="absolute top-10 py-5 flex flex-col justify-center items-center gap-5 w-40 rounded-md bg-red-700 text-white opacity-0 scale-95 translate-y-2 invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out">
                <Link
                  className="hover:scale-110 transition-all duration-300"
                  to="/admin/login"
                >
                  Admin Login
                </Link>

                <Link
                  className="hover:scale-110 transition-all duration-300"
                  to="/mechanic/login"
                >
                  Mechanic Login
                </Link>
              </div>

            </div>
          </div>

                {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-gray-100 hover:text-red-400 transition-colors p-2"
            aria-label="Toggle menu"
          >
            
            {isMenuOpen ? (
              <i className="ri-close-line text-2xl"></i>
            ) : (
              <i className="ri-menu-line text-2xl"></i>
            )}
          </button>

          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-4 pb-2 space-y-2">
            
            <Link
              to="/"
              className="block text-gray-100 hover:text-red-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="ri-home-line mr-3"></i>
              Home
            </Link>
            <Link
              to="/spare-parts"
              className="block text-gray-100 hover:text-red-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="ri-settings-3-line mr-3"></i>
              Spare Parts
            </Link>
            <Link
              to="/services"
              className="block text-gray-100 hover:text-red-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="ri-tools-line mr-3"></i>
              Services
            </Link>
            <Link
              to="/about"
              className="block text-gray-100 hover:text-red-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="ri-information-line mr-3"></i>
              About
            </Link>
            <Link
              to="/contact"
              className="block text-gray-100 hover:text-red-400 font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="ri-phone-line mr-3"></i>
              Contact
            </Link>
            
            {/* Mobile Booking Button */}
            <div className="pt-2">
              <Link
                to="/booking"
                className="block bg-red-600 text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="ri-calendar-check-line mr-2"></i>
                Book Service
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
