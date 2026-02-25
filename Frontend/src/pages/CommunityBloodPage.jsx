import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FiDroplet,
  FiUsers,
  FiActivity,
  FiMapPin,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const CommunityBloodPage = () => {
  const [communityData, setCommunityData] = useState(null);
  const [filters, setFilters] = useState({
    city: "",
    state: "",
    country: "India",
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCommunityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        ...(filters.city && { city: filters.city }),
        ...(filters.state && { state: filters.state }),
      });

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/blood/community/stats?${queryParams}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setCommunityData(data.data);
      }
    } catch (error) {
      console.error("Error fetching community data:", error);
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const getBloodGroupStats = (bloodGroup) => {
    return (
      communityData?.bloodGroupAvailability?.find(
        (stat) => stat._id === bloodGroup,
      ) || { totalUnits: 0, totalDonations: 0 }
    );
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchCommunityData();
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Community Blood Network
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with your community to save lives. Track donations, view
            requests, and make a difference in your neighborhood.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Link
            to="/blood/requests/create"
            className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <FiActivity className="text-3xl" />
              <div>
                <h3 className="text-xl font-semibold">Create Request</h3>
                <p className="text-red-100">Request blood for patients</p>
              </div>
            </div>
          </Link>

          <Link
            to="/blood/requests/all"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <FiDroplet className="text-3xl" />
              <div>
                <h3 className="text-xl font-semibold">View Requests</h3>
                <p className="text-blue-100">Browse all blood requests</p>
              </div>
            </div>
          </Link>

          <Link
            to="/blood/requests/my"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <FiUsers className="text-3xl" />
              <div>
                <h3 className="text-xl font-semibold">My Requests</h3>
                <p className="text-green-100">Manage your requests</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Community Overview
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <FiFilter />
                <span>Filter</span>
              </button>
              <button
                onClick={fetchCommunityData}
                className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <FiRefreshCw />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.form
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              onSubmit={handleFilterSubmit}
              className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6"
            >
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, city: e.target.value }))
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="State"
                value={filters.state}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, state: e.target.value }))
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Apply Filters
              </button>
            </motion.form>
          )}

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Total Donations</p>
                  <p className="text-3xl font-bold">
                    {communityData?.communityStats?.totalDonations || 0}
                  </p>
                </div>
                <FiDroplet className="text-4xl text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Donors</p>
                  <p className="text-3xl font-bold">
                    {communityData?.communityStats?.totalDonors || 0}
                  </p>
                </div>
                <FiUsers className="text-4xl text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Requests</p>
                  <p className="text-3xl font-bold">
                    {communityData?.activeRequests || 0}
                  </p>
                </div>
                <FiActivity className="text-4xl text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Location</p>
                  <p className="text-lg font-bold">
                    {filters.city ||
                      communityData?.communityStats?.city ||
                      "All Cities"}
                  </p>
                </div>
                <FiMapPin className="text-4xl text-purple-200" />
              </div>
            </div>
          </div>

          {/* Blood Group Availability */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Blood Group Availability (Last 90 days)
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              {bloodGroups.map((group) => {
                const stats = getBloodGroupStats(group);
                return (
                  <motion.div
                    key={group}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {group}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Available Units
                      </div>
                      <div className="text-3xl font-bold text-gray-800">
                        {stats.totalUnits}
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {stats.totalDonations} donations
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Donations */}
        {communityData?.recentDonations?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Recent Community Donations
            </h3>
            <div className="space-y-4">
              {communityData.recentDonations.map((donation, index) => (
                <motion.div
                  key={donation._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                      {donation.bloodGroup}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {donation.donor?.name || "Anonymous Donor"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Donated {donation.unitsdonated} units at{" "}
                        {donation.hospital.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(donation.donationDate).toLocaleDateString()}
                    </p>
                    {donation.isEmergency && (
                      <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        Emergency
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommunityBloodPage;
