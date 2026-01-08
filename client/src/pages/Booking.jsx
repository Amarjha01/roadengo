import React, { useState } from "react";
import DoorstepService from "./DoorstepService";
import EmergencyAssistance from "./EmergencyAssistance";
import SpareParts from "./SpareParts";

const Booking = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      type: "Emergency Assistance",
      icon: "🚨",
      description: "24/7 roadside support",
      subText: "15 min response",
      color: "red",
      features: ["Instant help", "GPS tracking", "Expert mechanics"],
    },
    {
      type: "Doorstep Service",
      icon: "🏠",
      description: "Service at your location",
      subText: "45-90 min arrival",
      color: "blue",
      features: ["Scheduled visit", "Full maintenance", "Quality parts"],
    },
    {
      type: "Spare Parts Inquiry",
      icon: "🔧",
      description: "Get genuine parts quote",
      subText: "24-48 hrs delivery",
      color: "green",
      features: ["Genuine parts", "Best prices", "Quality assured"],
    },
    {
      type: "Emergency Hotline",
      icon: "📞",
      description: "Instant phone support",
      subText: "Available 24/7",
      color: "orange",
      features: ["Direct call", "Immediate help", "No booking needed"],
      phone: "+91 9876543210",
      isPhoneService: true,
    },
  ];

  // Handle service routing
  if (selectedService === "Doorstep Service") {
    return <DoorstepService onBack={() => setSelectedService(null)} />;
  }

  if (selectedService === "Emergency Assistance") {
    return <EmergencyAssistance onBack={() => setSelectedService(null)} />;
  }

  if (selectedService === "Spare Parts Inquiry") {
    return <SpareParts onBack={() => setSelectedService(null)} />;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-red-50 min-h-screen">
      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-6xl mx-auto">
        {/* Hero Section - Mobile Optimized */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Book Your <span className="text-red-600">Bike Service</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
            Professional service with quick response guaranteed
          </p>
        </div>

        {/* Service Selection - Mobile: 2 cols, Tablet: 2 cols, Desktop: 4 cols */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 text-center">
            Choose Service Type
          </h2>

          {/* Mobile: 2 columns, Tablet: 2 columns, Desktop: 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                onClick={() =>
                  service.isPhoneService
                    ? window.open(`tel:${service.phone}`, "_self")
                    : setSelectedService(service.type)
                }
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-300 active:scale-[0.98] flex flex-col h-full"
              >
                {/* Fixed Top Section - Mobile Compact */}
                <div className="text-center p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3">
                    {service.icon}
                  </div>
                  <h3
                    className={`text-sm sm:text-base lg:text-lg font-bold mb-1 sm:mb-2 ${
                      service.color === "blue"
                        ? "text-blue-600"
                        : service.color === "red"
                        ? "text-red-600"
                        : service.color === "green"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {service.type}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-1 leading-relaxed">
                    {service.description}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {service.subText}
                  </p>
                  {/* Phone number for Emergency Hotline */}
                  {service.phone && (
                    <p className="text-xs sm:text-sm font-bold text-orange-600 mt-2">
                      {service.phone}
                    </p>
                  )}
                </div>

                {/* Flexible Middle Section */}
                <div className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col justify-center">
                  <div className="space-y-1 sm:space-y-2">
                    {service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="text-xs sm:text-sm text-gray-600 flex items-center justify-center"
                      >
                        <span className="text-green-500 mr-1 sm:mr-2 text-xs sm:text-sm">
                          ✓
                        </span>
                        <span className="text-center leading-tight">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Bottom Section */}
                <div className="p-3 sm:p-4 lg:p-6 mt-auto">
                  <button
                    className={`w-full ${
                      service.color === "blue"
                        ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                        : service.color === "red"
                        ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                        : service.color === "green"
                        ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                        : "bg-orange-600 hover:bg-orange-700 active:bg-orange-800"
                    } text-white py-2.5 sm:py-3 lg:py-4 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all transform active:scale-95 text-xs sm:text-sm lg:text-base shadow-md`}
                  >
                    {service.isPhoneService
                      ? "Call Now"
                      : service.type === "Spare Parts Inquiry"
                      ? "Get Quote"
                      : "Book Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works - Mobile Simplified */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h3>

          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
            {[
              {
                step: "1",
                title: "Choose Service",
                desc: "Select service type",
                icon: "📱",
              },
              {
                step: "2",
                title: "We Come to You",
                desc: "Mechanic arrives",
                icon: "🏍️",
              },
              {
                step: "3",
                title: "Service Complete",
                desc: "Pay after service",
                icon: "✅",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center sm:flex-col sm:text-center group"
              >
                <div className="flex-shrink-0 mr-4 sm:mr-0 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm sm:text-lg font-bold shadow-md group-hover:bg-blue-700 transition-colors">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 sm:flex-none">
                  <div className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
