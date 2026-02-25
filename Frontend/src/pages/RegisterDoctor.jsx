import React, { useState } from "react";
import axios from "axios";

const RegisterDoctor = () => {
  const [doctorMedlinkId, setDoctorMedlinkId] = useState("");
  const [availability, setAvailability] = useState(null);
  const [form, setForm] = useState({
    specialization: "",
    hospital: "",
    experienceYears: "",
    email: "",
    phone: "",
  });

  const checkMedId = async () => {
    try {
      const { data } = await axios.post(
        "https://medlink-bh5c.onrender.com/api/doctor/check-medid",
        {
          doctorMedlinkId,
        },
      );
      setAvailability(data.available ? "available" : "unavailable");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (availability !== "available") {
      alert("Medlink ID not available ❌");
      return;
    }

    try {
      const { data } = await axios.post(
        "https://medlink-bh5c.onrender.com/api/doctor/register",
        {
          ...form,
          doctorMedlinkId,
        },
        {
          withCredentials: true,
        },
      );
      alert(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-6">
        Register as Doctor 🩺
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medlink ID */}
        <div>
          <input
            type="text"
            placeholder="Medlink ID"
            value={doctorMedlinkId}
            onChange={(e) => setDoctorMedlinkId(e.target.value)}
            onBlur={checkMedId}
            required
            className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          {availability === "available" && (
            <p className="text-green-600 text-sm mt-1">✅ Available</p>
          )}
          {availability === "unavailable" && (
            <p className="text-red-600 text-sm mt-1">❌ Not Available</p>
          )}
        </div>

        {/* Specialization */}
        <input
          type="text"
          placeholder="Specialization"
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        {/* Hospital */}
        <input
          type="text"
          placeholder="Hospital"
          value={form.hospital}
          onChange={(e) => setForm({ ...form, hospital: e.target.value })}
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        {/* Experience */}
        <input
          type="number"
          placeholder="Experience (Years)"
          value={form.experienceYears}
          onChange={(e) =>
            setForm({ ...form, experienceYears: e.target.value })
          }
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        {/* Phone */}
        <input
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={availability !== "available"}
          className={`w-full p-3 rounded-lg font-semibold transition ${
            availability === "available"
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          Register Doctor
        </button>
      </form>
    </div>
  );
};

export default RegisterDoctor;
