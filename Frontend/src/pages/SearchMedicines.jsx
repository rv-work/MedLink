import React, { useState } from "react";
import { toast } from "react-hot-toast";

const SearchMedicines = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [radius, setRadius] = useState("10");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
          toast.success("Location captured successfully!");
        },
        (error) => {
          toast.error("Error getting location");
          console.log("err : ", error);
        },
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery || !location.latitude || !location.longitude) {
      toast.error("Please enter medicine name and location");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        medicineName: searchQuery,
        latitude: location.latitude,
        longitude: location.longitude,
        radius: radius,
      });

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/clinic/search-medicine?${params}`,
        {
          credentials: "include",
        },
      );
      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        if (data.results.length === 0) {
          toast.info("No medicines found in your area");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Search failed");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Find Medicines Near You
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search for medicines at nearby pharmacies and get real-time
            availability with prices
          </p>
        </div>

        {/* Enhanced Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Search Parameters
            </h2>
          </div>

          <form onSubmit={handleSearch} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Medicine Name Input */}
              <div className="xl:col-span-2">
                <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 text-blue-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"
                    />
                  </svg>
                  Medicine Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Paracetamol, Crocin, Dolo..."
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Latitude Input */}
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={location.latitude}
                  onChange={(e) =>
                    setLocation((prev) => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                  placeholder="28.6139"
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                />
              </div>

              {/* Longitude Input */}
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={location.longitude}
                  onChange={(e) =>
                    setLocation((prev) => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                  placeholder="77.2090"
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>

            {/* Radius Selection */}
            <div className="max-w-xs">
              <label className=" text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg
                  className="w-4 h-4 text-purple-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                Search Radius
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-gray-800 bg-white shadow-sm"
              >
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="15">Within 15 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Get Current Location</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-3 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span>Search Medicines</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Enhanced Search Results */}
        {results.length > 0 && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Found {results.length} Nearby Pharmacies
              </h3>
              <p className="text-gray-600">
                Great! We found several options for you
              </p>
            </div>

            {/* Results List */}
            <div className="grid gap-8">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Pharmacy Header */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 pb-6 border-b border-gray-100">
                    <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-800 mb-2">
                          {result.shopName}
                        </h4>
                        <div className="space-y-2">
                          <p className="text-gray-600 flex items-center">
                            <svg
                              className="w-4 h-4 text-gray-400 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                            {result.address.street}, {result.address.city},{" "}
                            {result.address.state}
                          </p>
                          <p className="text-blue-600 font-semibold flex items-center">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                              />
                            </svg>
                            {result.distance.toFixed(2)} km away
                          </p>
                          <p className="text-green-600 font-medium flex items-center">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {result.contactNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">
                        Available Now
                      </span>
                    </div>
                  </div>

                  {/* Available Medicines */}
                  <div>
                    <div className="flex items-center mb-6">
                      <svg
                        className="w-6 h-6 text-indigo-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"
                        />
                      </svg>
                      <h5 className="text-xl font-bold text-gray-800">
                        Available Medicines ({result.availableMedicines.length})
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {result.availableMedicines.map((medicine, medIndex) => (
                        <div
                          key={medIndex}
                          className="border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-white to-gray-50"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {medicine.photo ? (
                                <img
                                  src={medicine.photo}
                                  alt={medicine.name}
                                  className="h-16 w-16 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h6 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                {medicine.name}
                              </h6>
                              <p className="text-sm text-gray-600 mb-3">
                                by {medicine.brand}
                              </p>
                              <div className="flex justify-between items-center mb-3">
                                <div className="text-right">
                                  <span className="text-2xl font-bold text-green-600">
                                    ₹{medicine.price}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm text-gray-500">
                                    Stock
                                  </span>
                                  <div className="font-semibold text-gray-800">
                                    {medicine.stock}
                                  </div>
                                </div>
                              </div>
                              {medicine.requiresPrescription && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200">
                                  <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                  </svg>
                                  Prescription Required
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMedicines;
