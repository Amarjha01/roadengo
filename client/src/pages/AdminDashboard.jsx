// pages/AdminDashboard.jsx - COMPLETE FUNCTIONAL VERSION WITH ALL TABS
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, STATUS } from "../routing/apiClient";

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [activeTab, setActiveTab] = useState("appointments");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateMechanicModal, setShowCreateMechanicModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [newMechanic, setNewMechanic] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialization: [],
    experience: 0,
    location: {
      city: "",
    },
  });

  const navigate = useNavigate();

  // Stable fetch functions
  const fetchMechanics = useCallback(async () => {
    try {
      const response = await apiService.getMechanics();
      setMechanics(response.data || []);
      console.log("Mechanics fetched:", response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      setMechanics([]);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await apiService.getAppointments();
      setAppointments(response.data || []);
      console.log("Appointments fetched:", response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  }, []);

  const fetchEmergencies = useCallback(async () => {
    try {
      const response = await apiService.getEmergencies();
      setEmergencies(response.data || []);
      console.log("Emergencies fetched:", response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      setEmergencies([]);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const response = await apiService.getInquiries();
      setInquiries(response.data || []);
      console.log("Inquiries fetched:", response.data?.length || 0);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]);
    }
  }, []);

  const fetchAllData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchEmergencies(),
        fetchInquiries(),
        fetchMechanics(),
      ]);
    } catch (err) {
      console.error("Dashboard data loading error:", err);
      setError("Error loading dashboard data. Please refresh the page.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [fetchAppointments, fetchEmergencies, fetchInquiries, fetchMechanics]);

  // Auth check and initial fetch
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.log("No admin token found, redirecting to login");
      navigate("/admin/login");
      return;
    }
    fetchAllData();
  }, [navigate, fetchAllData]);

  // Auto-update polling (30 seconds)
  const POLL_INTERVAL = 30000;
  const intervalRef = useRef(null);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      console.log("Auto-updating dashboard data...");
      fetchAllData(false); // No loader for background updates
    }, POLL_INTERVAL);
  }, [fetchAllData]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startPolling();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Tab visible: refreshing data");
        fetchAllData(false);
        startPolling();
      } else {
        console.log("Tab hidden: stopping polling");
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startPolling, stopPolling, fetchAllData]);

  // Create New Mechanic
  const handleCreateMechanic = async (e) => {
    e.preventDefault();

    if (!newMechanic.name || !newMechanic.email || !newMechanic.phone || !newMechanic.password) {
      setError("Please fill in all required fields");
      return;
    }

    const isArray = Array.isArray(newMechanic.specialization);
    const specializationValid = isArray
      ? newMechanic.specialization.length > 0
      : Boolean(newMechanic.specialization);

    if (!specializationValid) {
      setError("Please select at least one specialization");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...newMechanic,
        specialization: isArray ? newMechanic.specialization : [newMechanic.specialization],
      };
      await apiService.registerMechanic(payload);
      await fetchMechanics();
      setShowCreateMechanicModal(false);
      setNewMechanic({
        name: "",
        email: "",
        phone: "",
        password: "",
        specialization: [],
        experience: 0,
        location: { city: "" },
      });
      alert("✅ Mechanic created successfully!");
    } catch (error) {
      console.error("Error creating mechanic:", error);
      setError(`Failed to create mechanic: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Assign Task to Mechanic
  const handleAssignTask = async (mechanicId) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.assignTask({
        mechanicId,
        taskId: selectedTask._id,
        taskType: selectedTask.taskType,
      });

      alert("✅ Task assigned successfully!");
      await fetchAllData(false);
      setShowAssignModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error assigning task:", error);
      setError(`Assignment failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update Status Functions
  const updateAppointmentStatus = async (id, status) => {
    try {
      setLoading(true);
      await apiService.updateAppointment(id, { status });
      await fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Failed to update appointment status");
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id, status) => {
    try {
      setLoading(true);
      await apiService.updateInquiry(id, { status });
      await fetchInquiries();
    } catch (error) {
      console.error("Error updating inquiry:", error);
      setError("Failed to update inquiry status");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/admin/login");
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN");
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-IN");
    } catch {
      return "Invalid Date";
    }
  };

  // Enhanced Assign Modal Component
  const EnhancedAssignModal = () => {
    if (!showAssignModal || !selectedTask) return null;

    const getFilteredMechanics = () => {
      return mechanics
        .filter((mechanic) => {
          if (mechanic.availability !== "available") return false;

          const requiredSpecializations =
            selectedTask.taskType === "appointment"
              ? ["doorstep-service"]
              : ["emergency-repair"];

          const hasRequiredSkill = mechanic.specialization?.some((spec) =>
            requiredSpecializations.includes(spec)
          );

          return hasRequiredSkill;
        })
        .sort((a, b) => {
          if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
          return (b.experience || 0) - (a.experience || 0);
        });
    };

    const filteredMechanics = getFilteredMechanics();

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-4 mx-2 sm:mx-4 md:mx-auto p-3 sm:p-4 md:p-5 border w-full sm:w-11/12 md:w-5/6 lg:w-4/6 xl:w-1/2 2xl:max-w-4xl shadow-lg rounded-md bg-white min-h-screen sm:min-h-0 sm:top-8 md:top-12 lg:top-20">
          <div className="mt-0 sm:mt-3">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                Assign Mechanic to Task
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTask(null);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Task Details Card */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Task Details</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {selectedTask.taskType?.toUpperCase()}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Service:</span>{" "}
                    {selectedTask.taskType === "appointment"
                      ? selectedTask.serviceType
                      : selectedTask.issueDescription}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Customer:</span> {selectedTask.name}
                  </p>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {selectedTask.phone}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    <span className="font-medium">Location:</span>{" "}
                    {selectedTask.address || selectedTask.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-3 sm:mb-4 bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 flex items-start">
                <div className="text-red-500 mr-2 mt-0.5 text-sm sm:text-base">⚠️</div>
                <div className="flex-1">
                  <p className="text-red-600 text-xs sm:text-sm">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 ml-2 text-lg"
                >
                  ×
                </button>
              </div>
            )}

            {/* Available Mechanics Grid */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                Available Mechanics ({filteredMechanics.length})
              </h4>

              {filteredMechanics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-[60vh] sm:max-h-96 overflow-y-auto">
                  {filteredMechanics.map((mechanic) => (
                    <div
                      key={mechanic._id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
                      onClick={() => handleAssignTask(mechanic._id)}
                    >
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {mechanic.name}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{mechanic.email}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{mechanic.phone}</p>
                        </div>
                        <div className="flex flex-col items-end ml-2">
                          <span className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mb-1">
                            AVAILABLE
                          </span>
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-xs sm:text-sm">⭐</span>
                            <span className="ml-1 text-xs sm:text-sm text-gray-600">
                              {mechanic.rating || 0}/5
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-2 sm:mb-3 space-y-1">
                        <p className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Experience:</span> {mechanic.experience} years
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Location:</span> {mechanic.location?.city}
                        </p>
                      </div>

                      <div className="mb-2 sm:mb-3">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Specializations:</p>
                        <div className="flex flex-wrap gap-1">
                          {mechanic.specialization?.map((spec, index) => (
                            <span
                              key={index}
                              className="inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                            >
                              {spec.replace("-", " ")}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 space-y-1">
                        <p>
                          Active Tasks:{" "}
                          {mechanic.assignedTasks?.filter(
                            (t) => t.status === "assigned" || t.status === "in-progress"
                          ).length || 0}
                        </p>
                        <p>Completed: {mechanic.completedTasks || 0}</p>
                      </div>

                      <div className="pt-2 sm:pt-3 border-t border-gray-200">
                        <button
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {loading ? "Assigning..." : "Assign This Mechanic"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 4 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Available Mechanics</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 px-4">
                    No mechanics are currently available with the required skills for this task.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading && appointments.length === 0 && emergencies.length === 0 && inquiries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-base sm:text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            🏍️ RoadEngo Admin
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("mechanics")}
              className="bg-green-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Manage </span>Mechanics
            </button>
            <button
              onClick={() => setShowCreateMechanicModal(true)}
              className="bg-purple-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Add </span>Mechanic
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">View </span>Website
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 flex justify-between items-center text-sm">
            <span className="flex-1 min-w-0 truncate">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2 text-lg">
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
              Appointments
            </h3>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600">
              {appointments.length}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
              <span className="hidden sm:inline">Emergency </span>Requests
            </h3>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-red-600">
              {emergencies.length}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
              <span className="hidden sm:inline">Cart </span>Inquiries
            </h3>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600">
              {inquiries.length}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
              <span className="hidden sm:inline">Total </span>Mechanics
            </h3>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-purple-600">
              {mechanics.length}
            </p>
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow col-span-2 sm:col-span-1">
            <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
              Available<span className="hidden sm:inline"> Mechanics</span>
            </h3>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-600">
              {mechanics.filter((m) => m.availability === "available").length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <nav className="flex flex-wrap gap-1 sm:gap-2 md:gap-4">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm ${
                activeTab === "appointments"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="hidden sm:inline">Appointments </span>
              <span className="sm:hidden">Apt </span>
              ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab("emergencies")}
              className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm ${
                activeTab === "emergencies"
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="hidden sm:inline">Emergencies </span>
              <span className="sm:hidden">Emg </span>
              ({emergencies.length})
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm ${
                activeTab === "inquiries"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="hidden sm:inline">Cart </span>Inquiries ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveTab("mechanics")}
              className={`px-2 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm ${
                activeTab === "mechanics"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Mechanics ({mechanics.length})
            </button>
          </nav>
        </div>

        {/* Loading Indicator for Updates */}
        {loading && (
          <div className="fixed top-4 right-4 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg z-50 text-xs sm:text-sm">
            Updating...
          </div>
        )}

        {/* MECHANICS TAB */}
        {activeTab === "mechanics" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Mobile Card View */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {mechanics.map((mechanic) => (
                  <div key={mechanic._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{mechanic.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{mechanic.email}</p>
                        <p className="text-sm text-gray-500">{mechanic.phone}</p>
                        <p className="text-xs text-gray-400">ID: {mechanic.mechanicId}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          mechanic.availability === "available"
                            ? "bg-green-100 text-green-800"
                            : mechanic.availability === "busy"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {mechanic.availability?.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Experience</p>
                        <p className="text-sm font-medium">{mechanic.experience} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rating</p>
                        <div className="flex items-center">
                          <span className="text-yellow-400 text-sm">⭐</span>
                          <span className="ml-1 text-sm">{mechanic.rating || 0}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Specializations</p>
                      <div className="flex flex-wrap gap-1">
                        {mechanic.specialization?.map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {spec.replace("-", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Active Tasks</p>
                        <p className="text-sm font-medium">
                          {mechanic.assignedTasks?.filter(
                            (t) => t.status === "assigned" || t.status === "in-progress"
                          ).length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Completed</p>
                        <p className="text-sm font-medium">{mechanic.completedTasks || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mechanic Details
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mechanics.map((mechanic) => (
                    <tr key={mechanic._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900">{mechanic.name}</div>
                          <div className="text-sm text-gray-600">{mechanic.email}</div>
                          <div className="text-sm text-gray-500">{mechanic.phone}</div>
                          <div className="text-xs text-gray-400">ID: {mechanic.mechanicId}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {mechanic.specialization?.map((spec, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                            >
                              {spec.replace("-", " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{mechanic.experience} years</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            mechanic.availability === "available"
                              ? "bg-green-100 text-green-800"
                              : mechanic.availability === "busy"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {mechanic.availability?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Active:{" "}
                          {mechanic.assignedTasks?.filter(
                            (t) => t.status === "assigned" || t.status === "in-progress"
                          ).length || 0}
                        </div>
                        <div className="text-sm text-gray-500">
                          Completed: {mechanic.completedTasks || 0}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-yellow-400">⭐</span>
                          <span className="ml-1 text-sm text-gray-900">
                            {mechanic.rating || 0}/5
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {mechanics.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No mechanics found. Create one to get started.
              </div>
            )}
          </div>
        )}

        {/* APPOINTMENTS TAB */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="space-y-4 p-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{appointment.name}</h3>
                        <p className="text-sm text-gray-600">{appointment.phone}</p>
                        <p className="text-sm text-gray-500 truncate">{appointment.email}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          appointment.status === STATUS.PENDING
                            ? "bg-yellow-100 text-yellow-800"
                            : appointment.status === STATUS.CONFIRMED
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === STATUS.IN_PROGRESS
                            ? "bg-purple-100 text-purple-800"
                            : appointment.status === STATUS.COMPLETED
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appointment.status?.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Service</p>
                        <p className="text-sm font-medium">{appointment.serviceType}</p>
                        <p className="text-sm text-gray-600">{appointment.bikeModel}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="text-sm font-medium">{formatDate(appointment.serviceDate)}</p>
                        <p className="text-sm text-gray-600">{appointment.serviceTime}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm text-gray-600 truncate">{appointment.address}</p>
                      </div>
                      
                      {appointment.assignedMechanic && (
                        <div>
                          <p className="text-xs text-gray-500">Assigned Mechanic</p>
                          <p className="text-sm font-medium">
                            {mechanics.find((m) => m._id === appointment.assignedMechanic)?.name || "Unknown"}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <select
                        value={appointment.status}
                        onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value={STATUS.PENDING}>Pending</option>
                        <option value={STATUS.CONFIRMED}>Confirmed</option>
                        <option value={STATUS.IN_PROGRESS}>In Progress</option>
                        <option value={STATUS.COMPLETED}>Completed</option>
                        <option value={STATUS.CANCELLED}>Cancelled</option>
                      </select>
                      {!appointment.assignedMechanic && (
                        <button
                          onClick={() => {
                            setSelectedTask({ ...appointment, taskType: "appointment" });
                            setShowAssignModal(true);
                            setError(null);
                          }}
                          disabled={loading}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                        >
                          Assign Mechanic
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Details
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Mechanic
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900">{appointment.name}</div>
                          <div className="text-sm text-gray-600">{appointment.phone}</div>
                          <div className="text-sm text-gray-500">{appointment.email}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{appointment.serviceType}</div>
                          <div className="text-sm text-gray-600">{appointment.bikeModel}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{appointment.address}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.serviceDate)}
                          </div>
                          <div className="text-sm text-gray-600">{appointment.serviceTime}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === STATUS.PENDING
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === STATUS.CONFIRMED
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status === STATUS.IN_PROGRESS
                              ? "bg-purple-100 text-purple-800"
                              : appointment.status === STATUS.COMPLETED
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {appointment.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {appointment.assignedMechanic ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {mechanics.find((m) => m._id === appointment.assignedMechanic)?.name || "Unknown"}
                            </div>
                            <div className="text-gray-500">Assigned</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <select
                            value={appointment.status}
                            onChange={(e) => updateAppointmentStatus(appointment._id, e.target.value)}
                            disabled={loading}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value={STATUS.PENDING}>Pending</option>
                            <option value={STATUS.CONFIRMED}>Confirmed</option>
                            <option value={STATUS.IN_PROGRESS}>In Progress</option>
                            <option value={STATUS.COMPLETED}>Completed</option>
                            <option value={STATUS.CANCELLED}>Cancelled</option>
                          </select>
                          {!appointment.assignedMechanic && (
                            <button
                              onClick={() => {
                                setSelectedTask({ ...appointment, taskType: "appointment" });
                                setShowAssignModal(true);
                                setError(null);
                              }}
                              disabled={loading}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                            >
                              Assign Mechanic
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">No appointments found</div>
            )}
          </div>
        )}

        {/* EMERGENCIES TAB */}
        {activeTab === "emergencies" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="space-y-4 p-4">
                {emergencies.map((emergency) => (
                  <div key={emergency._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{emergency.name}</h3>
                        <p className="text-sm text-gray-600">{emergency.phone}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        EMERGENCY
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Bike Model</p>
                        <p className="text-sm font-medium">{emergency.bikeModel}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Issue</p>
                        <p className="text-sm text-gray-600">{emergency.issueDescription}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm text-gray-600 truncate">{emergency.location}</p>
                      </div>
                      
                      {emergency.assignedMechanic && (
                        <div>
                          <p className="text-xs text-gray-500">Assigned Mechanic</p>
                          <p className="text-sm font-medium">
                            {mechanics.find((m) => m._id === emergency.assignedMechanic)?.name || "Unknown"}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {!emergency.assignedMechanic && (
                      <div className="pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedTask({ ...emergency, taskType: "emergency" });
                            setShowAssignModal(true);
                            setError(null);
                          }}
                          disabled={loading}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                        >
                          Assign Mechanic
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Details
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Mechanic
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencies.map((emergency) => (
                    <tr key={emergency._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900">{emergency.name}</div>
                          <div className="text-sm text-gray-600">{emergency.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{emergency.bikeModel}</div>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {emergency.issueDescription}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {emergency.location}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {emergency.assignedMechanic ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {mechanics.find((m) => m._id === emergency.assignedMechanic)?.name || "Unknown"}
                            </div>
                            <div className="text-gray-500">Assigned</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        {!emergency.assignedMechanic && (
                          <button
                            onClick={() => {
                              setSelectedTask({ ...emergency, taskType: "emergency" });
                              setShowAssignModal(true);
                              setError(null);
                            }}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
                          >
                            Assign Mechanic
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {emergencies.length === 0 && (
              <div className="text-center py-8 text-gray-500">No emergency requests found</div>
            )}
          </div>
        )}

        {/* INQUIRIES TAB - COMPLETE IMPLEMENTATION */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              <div className="space-y-4 p-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry._id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{inquiry.name}</h3>
                        <p className="text-sm text-gray-600">{inquiry.phone}</p>
                        <p className="text-sm text-gray-500 truncate">{inquiry.email}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          inquiry.status === STATUS.PENDING
                            ? "bg-yellow-100 text-yellow-800"
                            : inquiry.status === STATUS.CONTACTED
                            ? "bg-blue-100 text-blue-800"
                            : inquiry.status === STATUS.QUOTED
                            ? "bg-purple-100 text-purple-800"
                            : inquiry.status === STATUS.COMPLETED
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {inquiry.status?.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Cart Items</p>
                        <p className="text-sm font-medium">{inquiry.itemCount || inquiry.cartItems?.length || 0} items</p>
                        <div className="text-xs text-gray-600 space-y-1 mt-1">
                          {inquiry.cartItems && inquiry.cartItems.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="truncate mr-2">{item.name}</span>
                              <span>x{item.quantity}</span>
                            </div>
                          ))}
                          {inquiry.cartItems && inquiry.cartItems.length > 2 && (
                            <div className="text-gray-500">+{inquiry.cartItems.length - 2} more items...</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-lg font-bold text-green-600">₹{inquiry.totalAmount}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm text-gray-600">{formatDateTime(inquiry.createdAt)}</p>
                      </div>
                      
                      {inquiry.address && (
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="text-sm text-gray-600 truncate">{inquiry.address}</p>
                        </div>
                      )}
                      
                      {inquiry.message && (
                        <div>
                          <p className="text-xs text-gray-500">Message</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <select
                        value={inquiry.status}
                        onChange={(e) => updateInquiryStatus(inquiry._id, e.target.value)}
                        disabled={loading}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value={STATUS.PENDING}>Pending</option>
                        <option value={STATUS.CONTACTED}>Contacted</option>
                        <option value={STATUS.QUOTED}>Quoted</option>
                        <option value={STATUS.COMPLETED}>Completed</option>
                        <option value={STATUS.CANCELLED}>Cancelled</option>
                      </select>
                      <button
                        onClick={() => {
                          const details = `
Customer: ${inquiry.name}
Phone: ${inquiry.phone}
Email: ${inquiry.email}
Address: ${inquiry.address || "Not provided"}
${inquiry.message ? "Message: " + inquiry.message : ""}
Cart Items:
${inquiry.cartItems?.map(item => `- ${item.name} (${item.brand || "N/A"}) x${item.quantity} = ₹${item.price}`).join("\n") || "No items"}
Total: ₹${inquiry.totalAmount}
                          `.trim();
                          alert(details);
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cart Items
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-semibold text-gray-900">{inquiry.name}</div>
                          <div className="text-sm text-gray-600">{inquiry.phone}</div>
                          <div className="text-sm text-gray-500">{inquiry.email}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {inquiry.itemCount || inquiry.cartItems?.length || 0} items
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            {inquiry.cartItems && inquiry.cartItems.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="truncate mr-2">{item.name}</span>
                                <span>x{item.quantity}</span>
                              </div>
                            ))}
                            {inquiry.cartItems && inquiry.cartItems.length > 3 && (
                              <div className="text-gray-500">+{inquiry.cartItems.length - 3} more items...</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-600">₹{inquiry.totalAmount}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            inquiry.status === STATUS.PENDING
                              ? "bg-yellow-100 text-yellow-800"
                              : inquiry.status === STATUS.CONTACTED
                              ? "bg-blue-100 text-blue-800"
                              : inquiry.status === STATUS.QUOTED
                              ? "bg-purple-100 text-purple-800"
                              : inquiry.status === STATUS.COMPLETED
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {inquiry.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(inquiry.createdAt)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <select
                            value={inquiry.status}
                            onChange={(e) => updateInquiryStatus(inquiry._id, e.target.value)}
                            disabled={loading}
                            className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value={STATUS.PENDING}>Pending</option>
                            <option value={STATUS.CONTACTED}>Contacted</option>
                            <option value={STATUS.QUOTED}>Quoted</option>
                            <option value={STATUS.COMPLETED}>Completed</option>
                            <option value={STATUS.CANCELLED}>Cancelled</option>
                          </select>
                          <button
                            onClick={() => {
                              const details = `
Customer: ${inquiry.name}
Phone: ${inquiry.phone}
Email: ${inquiry.email}
Address: ${inquiry.address || "Not provided"}
${inquiry.message ? "Message: " + inquiry.message : ""}
Cart Items:
${inquiry.cartItems?.map(item => `- ${item.name} (${item.brand || "N/A"}) x${item.quantity} = ₹${item.price}`).join("\n") || "No items"}
Total: ₹${inquiry.totalAmount}
                              `.trim();
                              alert(details);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {inquiries.length === 0 && (
              <div className="text-center py-8 text-gray-500">No cart inquiries found</div>
            )}
          </div>
        )}

        {/* Create Mechanic Modal */}
        {showCreateMechanicModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-4 mx-2 sm:mx-4 md:mx-auto p-3 sm:p-4 md:p-5 border w-full sm:w-11/12 md:w-3/4 lg:w-1/2 xl:w-96 shadow-lg rounded-md bg-white">
              <div className="mt-2 sm:mt-3">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                  Create New Mechanic
                </h3>
                <form onSubmit={handleCreateMechanic}>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          required
                          value={newMechanic.name}
                          onChange={(e) => setNewMechanic({ ...newMechanic, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter mechanic name"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={newMechanic.email}
                          onChange={(e) => setNewMechanic({ ...newMechanic, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          maxLength="10"
                          value={newMechanic.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setNewMechanic({ ...newMechanic, phone: value });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter 10-digit phone number"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                        <input
                          type="password"
                          required
                          minLength="6"
                          value={newMechanic.password}
                          onChange={(e) => setNewMechanic({ ...newMechanic, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Enter password (min 6 characters)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization *
                      </label>
                      <select
                        required
                        value={
                          Array.isArray(newMechanic.specialization)
                            ? newMechanic.specialization[0] || ""
                            : newMechanic.specialization || ""
                        }
                        onChange={(e) =>
                          setNewMechanic({
                            ...newMechanic,
                            specialization: e.target.value ? [e.target.value] : [],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">-- Choose an option --</option>
                        <option value="emergency-repair">Emergency Repair</option>
                        <option value="doorstep-service">Doorstep Service</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Experience (years)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={newMechanic.experience}
                          onChange={(e) =>
                            setNewMechanic({
                              ...newMechanic,
                              experience: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Years of experience"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={newMechanic.location.city}
                          onChange={(e) =>
                            setNewMechanic({
                              ...newMechanic,
                              location: { ...newMechanic.location, city: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="City"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateMechanicModal(false)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? "Creating..." : "Create Mechanic"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Assign Modal */}
        <EnhancedAssignModal />
      </div>
    </div>
  );
};

export default AdminDashboard;
