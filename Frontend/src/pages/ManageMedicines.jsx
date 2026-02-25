import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const ManageMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [editForm, setEditForm] = useState({
    stock: "",
    price: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/clinic/my-medicines",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      if (data.success) {
        setMedicines(data.medicines);
      } else {
        toast.error("Failed to fetch medicines");
      }
    } catch (error) {
      toast.error("Error fetching medicines");
      console.log("error : ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine._id);
    setEditForm({
      stock: medicine.stock.toString(),
      price: medicine.price.toString(),
      expiryDate: new Date(medicine.expiryDate).toISOString().split("T")[0],
    });
  };

  const handleUpdate = async (medicineId) => {
    try {
      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/clinic/update-medicine/${medicineId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stock: parseInt(editForm.stock),
            price: parseFloat(editForm.price),
            expiryDate: editForm.expiryDate,
          }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Medicine updated successfully");
        setEditingMedicine(null);
        fetchMedicines();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("error : ", error);
      toast.error("Failed to update medicine");
    }
  };

  const handleCancel = () => {
    setEditingMedicine(null);
    setEditForm({ stock: "", price: "", expiryDate: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-3xl shadow-2xl border border-blue-100">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 border-2 border-blue-300 mx-auto opacity-20"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Loading</h3>
            <p className="text-gray-600">Fetching your medicines...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
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
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Medicine Inventory
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your medicine stock, prices, and availability
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6"
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
                <div>
                  <h2 className="text-2xl font-bold">Your Medicines</h2>
                  <p className="text-blue-100">
                    Total: {medicines.length} items
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{medicines.length}</div>
                <div className="text-blue-100 text-sm">Products</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {medicines.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No Medicines Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by adding some medicines to your inventory
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
                  Add First Medicine
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Medicine
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {medicines.map((medicine, index) => (
                      <tr
                        key={medicine._id}
                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-4">
                              {medicine.photo ? (
                                <img
                                  src={medicine.photo}
                                  alt={medicine.name}
                                  className="h-14 w-14 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                                  <svg
                                    className="w-7 h-7 text-blue-600"
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
                            <div>
                              <div className="text-lg font-bold text-gray-900 mb-1">
                                {medicine.name}
                              </div>
                              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                                {medicine.category}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className="text-gray-900 font-medium">
                            {medicine.brand}
                          </span>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap">
                          {editingMedicine === medicine._id ? (
                            <input
                              type="number"
                              value={editForm.stock}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  stock: e.target.value,
                                }))
                              }
                              className="w-24 px-3 py-2 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                          ) : (
                            <span
                              className={`text-lg font-bold ${
                                medicine.stock < 10
                                  ? "text-red-600"
                                  : medicine.stock < 50
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              {medicine.stock}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap">
                          {editingMedicine === medicine._id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.price}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  price: e.target.value,
                                }))
                              }
                              className="w-28 px-3 py-2 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ₹{medicine.price}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap">
                          {editingMedicine === medicine._id ? (
                            <input
                              type="date"
                              value={editForm.expiryDate}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  expiryDate: e.target.value,
                                }))
                              }
                              className="px-3 py-2 border-2 border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-gray-900 font-medium">
                              {new Date(
                                medicine.expiryDate,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full border-2 ${
                              medicine.stock === 0
                                ? "bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200"
                                : medicine.stock < 10
                                  ? "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-200"
                                  : "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-2 ${
                                medicine.stock === 0
                                  ? "bg-red-500"
                                  : medicine.stock < 10
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            ></div>
                            {medicine.stock === 0
                              ? "Out of Stock"
                              : medicine.stock < 10
                                ? "Low Stock"
                                : "In Stock"}
                          </span>
                        </td>

                        <td className="px-6 py-6 whitespace-nowrap">
                          {editingMedicine === medicine._id ? (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleUpdate(medicine._id)}
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl text-sm hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg flex items-center space-x-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancel}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl text-sm hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg flex items-center space-x-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                <span>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEdit(medicine)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg flex items-center space-x-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <span>Edit</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMedicines;
