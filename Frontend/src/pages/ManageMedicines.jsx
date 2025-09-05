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
        "http://localhost:5000/api/clinic/my-medicines",
        {
          method: "GET",
          credentials: "include", // include cookies if needed
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`, // add if your API needs token
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setMedicines(data.medicines);
      } else {
        toast.error("Failed to fetch medicines");
      }
    } catch (error) {
      toast.error("Error fetching medicines");
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
        `http://localhost:5000/api/clinic/update-medicine/${medicineId}`,
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
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Medicine updated successfully");
        setEditingMedicine(null);
        fetchMedicines(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update medicine");
    }
  };

  const handleCancel = () => {
    setEditingMedicine(null);
    setEditForm({ stock: "", price: "", expiryDate: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading medicines...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Manage Medicines
          </h2>

          {medicines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No medicines found. Add some medicines first.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicines.map((medicine) => (
                    <tr key={medicine._id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {medicine.photo && (
                            <img
                              src={medicine.photo}
                              alt={medicine.name}
                              className="h-10 w-10 rounded-md object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {medicine.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {medicine.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medicine.brand}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
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
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span
                            className={`text-sm ${
                              medicine.stock < 10
                                ? "text-red-600 font-medium"
                                : "text-gray-900"
                            }`}
                          >
                            {medicine.stock}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
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
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">
                            ₹{medicine.price}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
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
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-900">
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            medicine.stock === 0
                              ? "bg-red-100 text-red-800"
                              : medicine.stock < 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {medicine.stock === 0
                            ? "Out of Stock"
                            : medicine.stock < 10
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {editingMedicine === medicine._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(medicine._id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Edit
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
  );
};

export default ManageMedicines;
