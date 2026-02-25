import React, { useState, useEffect, useRef } from "react";

const DoctorLinkingFields = ({ formData, handleChange, setIsIdAvailable }) => {
  const [doctorCheckStatus, setDoctorCheckStatus] = useState(null); // 'loading', 'found', 'not-found', 'error', null
  const [doctorInfo, setDoctorInfo] = useState(null);
  const debounceTimeoutRef = useRef(null);

  // Auto-check doctor ID with debounce
  const checkDoctorId = async (doctorMedlinkId) => {
    if (!doctorMedlinkId.trim()) {
      setDoctorCheckStatus(null);
      setDoctorInfo(null);
      setIsIdAvailable(false);
      return;
    }

    try {
      setDoctorCheckStatus("loading");

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/doctor/isavailable",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ doctorMedlinkId: doctorMedlinkId.trim() }),
          credentials: "include",
        },
      );

      const result = await response.json();

      if (result.success && result.data) {
        setDoctorCheckStatus("found");
        setDoctorInfo(result.data);
        setIsIdAvailable(true);

        // Update form data with doctor info
        handleChange({
          target: {
            name: "linkedDoctorInfo",
            value: result.data,
          },
        });
      } else {
        setDoctorCheckStatus("not-found");
        setDoctorInfo(null);
        setIsIdAvailable(false);

        // Clear linked doctor info
        handleChange({
          target: {
            name: "linkedDoctorInfo",
            value: null,
          },
        });
      }
    } catch (err) {
      console.error("Error checking doctor:", err);
      setDoctorCheckStatus("error");
      setDoctorInfo(null);
      setIsIdAvailable(false);
    }
  };

  // Debounced effect for doctor ID input
  useEffect(() => {
    if (formData.linkDoctor && formData.doctorMedlinkId) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        checkDoctorId(formData.doctorMedlinkId);
      }, 2000);

      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    } else {
      setDoctorCheckStatus(null);
      setDoctorInfo(null);
      setIsIdAvailable(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctorMedlinkId, formData.linkDoctor]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">
        Doctor Information
      </h3>

      {/* Checkbox */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="linkDoctor"
          name="linkDoctor"
          checked={formData.linkDoctor}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="linkDoctor" className="text-white font-medium">
          Link this report to a doctor
        </label>
      </div>

      {formData.linkDoctor && (
        <div className="space-y-4">
          {/* Input field */}
          <div className="relative">
            <label className="block text-sm font-medium text-white mb-2">
              Doctor Medlink ID
            </label>
            <input
              type="text"
              name="doctorMedlinkId"
              value={formData.doctorMedlinkId}
              onChange={handleChange}
              placeholder="Enter doctor's Medlink ID"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Status messages */}
            {formData.doctorMedlinkId.trim() && (
              <div className="mt-2">
                {doctorCheckStatus === "loading" && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-sm">Checking doctor ID...</span>
                  </div>
                )}

                {doctorCheckStatus === "found" && doctorInfo && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-green-400 font-medium">
                        Doctor Found
                      </span>
                    </div>
                    <div className="text-white space-y-1">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {doctorInfo.doctorName}
                      </p>
                      <p>
                        <span className="font-medium">ID:</span>{" "}
                        {doctorInfo.doctorId}
                      </p>
                      {doctorInfo.specialization && (
                        <p>
                          <span className="font-medium">Specialization:</span>{" "}
                          {doctorInfo.specialization}
                        </p>
                      )}
                      {doctorInfo.hospital && (
                        <p>
                          <span className="font-medium">Hospital:</span>{" "}
                          {doctorInfo.hospital}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {doctorCheckStatus === "not-found" && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-red-400 font-medium">
                        No doctor found with this ID
                      </span>
                    </div>
                  </div>
                )}

                {doctorCheckStatus === "error" && (
                  <p className="text-yellow-400 text-sm">
                    Something went wrong. Try again.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorLinkingFields;
