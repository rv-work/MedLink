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
        }
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
        }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Search Medicines
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter medicine name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  placeholder="Latitude"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  placeholder="Longitude"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radius (km)
                </label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Get Current Location
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Searching..." : "Search Medicines"}
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Found {results.length} nearby pharmacies
            </h3>

            {results.map((result, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {result.shopName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {result.address.street}, {result.address.city},{" "}
                      {result.address.state}
                    </p>
                    <p className="text-sm text-blue-600">
                      📍 {result.distance.toFixed(2)} km away
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {result.contactNumber}
                    </p>
                  </div>
                </div>

                {/* Available Medicines */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">
                    Available Medicines:
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.availableMedicines.map((medicine, medIndex) => (
                      <div
                        key={medIndex}
                        className="border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex items-start space-x-3">
                          {medicine.photo && (
                            <img
                              src={medicine.photo}
                              alt={medicine.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900 text-sm">
                              {medicine.name}
                            </h6>
                            <p className="text-xs text-gray-600">
                              {medicine.brand}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm font-medium text-green-600">
                                ₹{medicine.price}
                              </span>
                              <span className="text-xs text-gray-500">
                                Stock: {medicine.stock}
                              </span>
                            </div>
                            {medicine.requiresPrescription && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-1 inline-block">
                                Prescription Required
                              </span>
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
        )}
      </div>
    </div>
  );
};

export default SearchMedicines;
