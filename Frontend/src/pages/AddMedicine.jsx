import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Papa from "papaparse";
import JSZip from "jszip";

const AddMedicine = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [loading, setLoading] = useState(false);

  // Manual form data with some dummy data
  const [formData, setFormData] = useState({
    name: "Paracetamol",
    brand: "Crocin",
    category: "Pain Relief",
    description: "Effective pain relief and fever reducer",
    price: "25.50",
    stock: "100",
    expiryDate: "2025-12-31",
    batchNumber: "CR001",
    manufacturer: "GlaxoSmithKline",
    requiresPrescription: false,
  });

  // CSV + ZIP upload
  const [csvFile, setCsvFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [photo, setPhoto] = useState(null);

  // Extracted data states
  const [extractedData, setExtractedData] = useState([]);
  const [extractedPhotos, setExtractedPhotos] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);

  // Sample dummy data for preview
  const dummyExtractedData = [
    {
      id: 1,
      name: "Aspirin",
      brand: "Bayer",
      category: "Pain Relief",
      description: "Pain relief and anti-inflammatory",
      price: 45.0,
      stock: 150,
      expiryDate: "2026-01-15",
      batchNumber: "ASP001",
      manufacturer: "Bayer Pharmaceuticals",
      requiresPrescription: false,
      photo: null,
      valid: true,
    },
    {
      id: 2,
      name: "Amoxicillin",
      brand: "Augmentin",
      category: "Antibiotic",
      description: "Broad spectrum antibiotic",
      price: 120.5,
      stock: 75,
      expiryDate: "2025-08-20",
      batchNumber: "AMX002",
      manufacturer: "GlaxoSmithKline",
      requiresPrescription: true,
      photo: null,
      valid: true,
    },
    {
      id: 3,
      name: "Cetirizine",
      brand: "Zyrtec",
      category: "Antihistamine",
      description: "Allergy relief medication",
      price: 35.75,
      stock: 200,
      expiryDate: "2025-11-30",
      batchNumber: "CET003",
      manufacturer: "Johnson & Johnson",
      requiresPrescription: false,
      photo: null,
      valid: true,
    },
  ];

  // Sample ZIP download function
  const downloadSampleZIP = async () => {
    try {
      const zip = new JSZip();

      // Create dummy image data (1x1 pixel images in base64)
      const dummyImages = {
        "paracetamol.jpg":
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        "aspirin.png":
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "amoxicillin.jpg":
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        "cetirizine.jpeg":
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        "ibuprofen.jpg":
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        "metformin.png":
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
        "loratadine.jpg":
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      };

      // Add images to ZIP
      for (const [filename, dataUrl] of Object.entries(dummyImages)) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        zip.file(filename, blob);
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download ZIP file
      const link = document.createElement("a");
      const url = URL.createObjectURL(zipBlob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sample_medicine_photos.zip");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Sample ZIP with photos downloaded!");
    } catch (error) {
      console.error("Error creating sample ZIP:", error);
      toast.error("Failed to create sample ZIP");
    }
  };

  // Function to download sample CSV
  const downloadSampleCSV = () => {
    const csvData = [
      [
        "name",
        "brand",
        "category",
        "description",
        "price",
        "stock",
        "expiryDate",
        "batchNumber",
        "manufacturer",
        "requiresPrescription",
      ],
      [
        "Paracetamol",
        "Crocin",
        "Pain Relief",
        "Effective pain relief and fever reducer",
        "25.50",
        "100",
        "2025-12-31",
        "CR001",
        "GlaxoSmithKline",
        "false",
      ],
      [
        "Aspirin",
        "Bayer",
        "Pain Relief",
        "Pain relief and anti-inflammatory",
        "45.00",
        "150",
        "2026-01-15",
        "ASP001",
        "Bayer Pharmaceuticals",
        "false",
      ],
      [
        "Amoxicillin",
        "Augmentin",
        "Antibiotic",
        "Broad spectrum antibiotic",
        "120.50",
        "75",
        "2025-08-20",
        "AMX002",
        "GlaxoSmithKline",
        "true",
      ],
      [
        "Cetirizine",
        "Zyrtec",
        "Antihistamine",
        "Allergy relief medication",
        "35.75",
        "200",
        "2025-11-30",
        "CET003",
        "Johnson & Johnson",
        "false",
      ],
      [
        "Ibuprofen",
        "Advil",
        "Pain Relief",
        "Anti-inflammatory pain reliever",
        "55.00",
        "125",
        "2025-09-15",
        "IBU004",
        "Pfizer",
        "false",
      ],
      [
        "Metformin",
        "Glucophage",
        "Diabetes",
        "Type 2 diabetes medication",
        "85.25",
        "90",
        "2025-10-10",
        "MET005",
        "Bristol Myers Squibb",
        "true",
      ],
      [
        "Loratadine",
        "Claritin",
        "Antihistamine",
        "24-hour allergy relief",
        "40.00",
        "175",
        "2025-12-01",
        "LOR006",
        "Schering-Plough",
        "false",
      ],
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_medicines.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Sample CSV downloaded!");
  };

  // Function to show sample data preview
  const showSampleData = () => {
    setExtractedData(dummyExtractedData);
    setExtractedPhotos({});
    setShowPreview(true);
    toast.success("Sample data loaded for preview!");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Add photo if selected
      if (photo) {
        formDataToSend.append("photo", photo);
      }

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/clinic/add-medicine",
        {
          method: "POST",
          body: formDataToSend,
          credentials: "include",
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Medicine added successfully!");
        // Reset form to new dummy data
        setFormData({
          name: "Ibuprofen",
          brand: "Advil",
          category: "Pain Relief",
          description: "Anti-inflammatory pain reliever",
          price: "55.00",
          stock: "125",
          expiryDate: "2025-09-15",
          batchNumber: "IBU004",
          manufacturer: "Pfizer",
          requiresPrescription: false,
        });
        setPhoto(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

  const handleFileExtraction = async () => {
    if (!csvFile || !zipFile) {
      toast.error("Please select both CSV and ZIP files");
      return;
    }

    setProcessingFiles(true);

    try {
      // Parse CSV
      const csvText = await csvFile.text();
      const parsedData = Papa.parse(csvText, { header: true });

      if (parsedData.errors.length > 0) {
        toast.error("Error parsing CSV file");
        console.error("CSV parsing errors:", parsedData.errors);
        return;
      }

      // Filter out empty rows
      const validData = parsedData.data.filter(
        (row) => row.name && row.name.trim() !== "",
      );

      if (validData.length === 0) {
        toast.error("No valid data found in CSV file");
        return;
      }

      // Extract ZIP
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipFile);
      const photoMap = {};

      // Process each file in the ZIP
      for (const [filename, file] of Object.entries(zipContent.files)) {
        if (
          !file.dir &&
          (filename.toLowerCase().endsWith(".jpg") ||
            filename.toLowerCase().endsWith(".jpeg") ||
            filename.toLowerCase().endsWith(".png"))
        ) {
          try {
            const blob = await file.async("blob");
            const url = URL.createObjectURL(blob);

            // Extract medicine name from filename (remove extension)
            const medicineName = filename
              .replace(/\.[^/.]+$/, "")
              .toLowerCase();
            photoMap[medicineName] = {
              url: url,
              file: blob,
              filename: filename,
            };
          } catch (error) {
            console.error(`Error processing ${filename}:`, error);
          }
        }
      }

      // Process medicines data and match with photos
      const medicines = validData.map((medicine, index) => {
        const medicineName = medicine.name?.toLowerCase() || "";
        const matchedPhoto = photoMap[medicineName] || null;

        return {
          id: index,
          name: medicine.name || "",
          brand: medicine.brand || "",
          category: medicine.category || "",
          description: medicine.description || "",
          price: medicine.price ? parseFloat(medicine.price) : 0,
          stock: medicine.stock ? parseInt(medicine.stock) : 0,
          expiryDate: medicine.expiryDate || "",
          batchNumber: medicine.batchNumber || "",
          manufacturer: medicine.manufacturer || "",
          requiresPrescription: medicine.requiresPrescription === "true",
          photo: matchedPhoto,
          valid:
            medicine.name && medicine.brand && medicine.price && medicine.stock,
        };
      });

      setExtractedData(medicines);
      setExtractedPhotos(photoMap);
      setShowPreview(true);

      toast.success(
        `Extracted ${medicines.length} medicines and ${
          Object.keys(photoMap).length
        } photos`,
      );
    } catch (error) {
      console.error("File processing error:", error);
      toast.error("Failed to process files");
    } finally {
      setProcessingFiles(false);
    }
  };

  // Updated bulk upload function
  const handleBulkUpload = async () => {
    if (extractedData.length === 0) {
      toast.error("No data to upload");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Add medicines data as JSON string
      const medicinesForBackend = extractedData.map((medicine) => ({
        name: medicine.name,
        brand: medicine.brand,
        category: medicine.category,
        description: medicine.description,
        price: medicine.price,
        stock: medicine.stock,
        expiryDate: medicine.expiryDate,
        batchNumber: medicine.batchNumber,
        manufacturer: medicine.manufacturer,
        requiresPrescription: medicine.requiresPrescription,
      }));

      formData.append("medicines", JSON.stringify(medicinesForBackend));

      // Add photos with proper naming
      extractedData.forEach((medicine, index) => {
        if (medicine.photo && medicine.photo.file) {
          // Create a new file with the medicine name
          const photoFile = new File(
            [medicine.photo.file],
            `${medicine.name.toLowerCase()}.${medicine.photo.filename
              .split(".")
              .pop()}`,
            { type: medicine.photo.file.type },
          );
          formData.append("photos", photoFile);
        }
      });

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/clinic/bulk-add-medicines",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);

        // Show additional info
        if (data.data.errors && data.data.errors.length > 0) {
          toast.warning(`${data.data.errors.length} medicines had issues`);
        }

        // Reset everything
        setCsvFile(null);
        setZipFile(null);
        setExtractedData([]);
        setExtractedPhotos({});
        setShowPreview(false);

        // Clean up URLs to prevent memory leaks
        Object.values(extractedPhotos).forEach((photo) => {
          if (photo.url) {
            URL.revokeObjectURL(photo.url);
          }
        });
      } else {
        toast.error(data.message || "Failed to upload medicines");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload medicines");
    } finally {
      setLoading(false);
    }
  };

  const removeMedicine = (id) => {
    setExtractedData((prev) => prev.filter((med) => med.id !== id));
  };

  const editMedicine = (id, field, value) => {
    setExtractedData((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med)),
    );
  };

  const resetExtraction = () => {
    // Clean up URLs
    Object.values(extractedPhotos).forEach((photo) => {
      if (photo.url) {
        URL.revokeObjectURL(photo.url);
      }
    });

    setExtractedData([]);
    setExtractedPhotos({});
    setShowPreview(false);
    setCsvFile(null);
    setZipFile(null);
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Add Medicines to Inventory
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Add medicines manually or upload in bulk with CSV and photos
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Enhanced Tab Navigation */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("manual")}
                className={`flex-1 py-6 px-8 font-bold text-lg transition-all duration-300 relative ${
                  activeTab === "manual"
                    ? "text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Manual Entry</span>
                </div>
                {activeTab === "manual" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`flex-1 py-6 px-8 font-bold text-lg transition-all duration-300 relative ${
                  activeTab === "bulk"
                    ? "text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span>Bulk Upload</span>
                </div>
                {activeTab === "bulk" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "manual" ? (
              // Enhanced Manual Entry Form
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-green-600"
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
                  <h2 className="text-3xl font-bold text-gray-800">
                    Add New Medicine
                  </h2>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 text-blue-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Basic Information
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Medicine Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="e.g., Paracetamol"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Brand *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="e.g., Crocin"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Category *
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="e.g., Pain Relief"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Manufacturer *
                        </label>
                        <input
                          type="text"
                          name="manufacturer"
                          value={formData.manufacturer}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="e.g., GlaxoSmithKline"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Stock Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 text-green-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Pricing & Stock
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="e.g., 25.50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="e.g., 100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Expiry Date *
                        </label>
                        <input
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-800 shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Batch Number *
                        </label>
                        <input
                          type="text"
                          name="batchNumber"
                          value={formData.batchNumber}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="e.g., CR001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 text-purple-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Additional Details
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 resize-none text-gray-800 placeholder-gray-400 shadow-sm"
                          placeholder="Brief description of the medicine and its uses..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Medicine Photo
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files[0])}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center">
                          <svg
                            className="w-4 h-4 text-blue-500 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Accepted formats: JPG, PNG (Max 5MB)
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-200">
                        <input
                          type="checkbox"
                          name="requiresPrescription"
                          checked={formData.requiresPrescription}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label className="text-sm font-bold text-gray-700 flex items-center">
                          <svg
                            className="w-5 h-5 text-red-500 mr-2"
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
                          Requires Prescription
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold py-5 px-8 rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:hover:scale-100 flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding Medicine...</span>
                      </>
                    ) : (
                      <>
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>Add Medicine</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // Enhanced Bulk Upload Tab
              <div className="space-y-8">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Bulk Upload Medicines
                  </h2>
                </div>

                {!showPreview ? (
                  <>
                    {/* Enhanced Instructions */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                      <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                        <svg
                          className="w-8 h-8 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        How to Use Bulk Upload
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              1
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-800 mb-1">
                                Prepare CSV File
                              </h4>
                              <p className="text-blue-700 text-sm">
                                Upload a CSV file with medicine details using
                                the required headers
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              2
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-800 mb-1">
                                Prepare ZIP File
                              </h4>
                              <p className="text-blue-700 text-sm">
                                Create a ZIP file containing medicine photos
                                with matching names
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              3
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-800 mb-1">
                                Upload & Preview
                              </h4>
                              <p className="text-blue-700 text-sm">
                                Upload both files and preview the extracted data
                                before adding
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              4
                            </div>
                            <div>
                              <h4 className="font-bold text-blue-800 mb-1">
                                Confirm & Add
                              </h4>
                              <p className="text-blue-700 text-sm">
                                Review and confirm to add all medicines to your
                                inventory
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Sample Files Section */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                      <h3 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
                        <svg
                          className="w-8 h-8 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Sample Files for Testing
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <button
                          onClick={downloadSampleCSV}
                          className="group bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                        >
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download CSV</span>
                        </button>

                        <button
                          onClick={downloadSampleZIP}
                          className="group bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                        >
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
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                            />
                          </svg>
                          <span>Download ZIP</span>
                        </button>

                        <button
                          onClick={showSampleData}
                          className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                        >
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>Preview Sample</span>
                        </button>
                      </div>
                      <p className="text-green-700 mt-4 text-center font-medium">
                        💡 Download both sample files, then upload them to test
                        the bulk upload feature
                      </p>
                    </div>

                    {/* Enhanced File Upload Section */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
                      <h3 className="text-2xl font-bold text-orange-800 mb-6 flex items-center">
                        <svg
                          className="w-8 h-8 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                        Upload Your Files
                      </h3>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="block text-lg font-bold text-gray-700">
                            CSV File *
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".csv"
                              onChange={(e) => setCsvFile(e.target.files[0])}
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                            {csvFile && (
                              <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                <p className="text-green-600 font-medium flex items-center">
                                  <svg
                                    className="w-5 h-5 mr-2"
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
                                  {csvFile.name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-lg font-bold text-gray-700">
                            ZIP File (Photos) *
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".zip"
                              onChange={(e) => setZipFile(e.target.files[0])}
                              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                            {zipFile && (
                              <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                <p className="text-green-600 font-medium flex items-center">
                                  <svg
                                    className="w-5 h-5 mr-2"
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
                                  {zipFile.name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleFileExtraction}
                        disabled={processingFiles || !csvFile || !zipFile}
                        className="w-full mt-8 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:hover:scale-100 flex items-center justify-center space-x-3"
                      >
                        {processingFiles ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing Files...</span>
                          </>
                        ) : (
                          <>
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
                            <span>Extract & Preview Data</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  // Enhanced Data Preview Section
                  <>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          Extracted Data Preview
                        </h3>
                        <p className="text-gray-600">
                          Found {extractedData.length} medicines,{" "}
                          {Object.keys(extractedPhotos).length} photos matched
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={resetExtraction}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={handleBulkUpload}
                          disabled={loading || extractedData.length === 0}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg hover:shadow-xl disabled:hover:scale-100 flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Adding Medicines...</span>
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
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              <span>Add {extractedData.length} Medicines</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Enhanced Data Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0 border-b border-gray-200">
                            <tr>
                              <th className="w-20 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Photo
                              </th>
                              <th className="w-32 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="w-24 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Brand
                              </th>
                              <th className="w-24 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="w-20 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="w-16 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Stock
                              </th>
                              <th className="w-24 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Expiry
                              </th>
                              <th className="w-16 px-4 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {extractedData.map((medicine, index) => (
                              <tr
                                key={medicine.id}
                                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                                  !medicine.valid
                                    ? "bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400"
                                    : index % 2 === 0
                                      ? "bg-white"
                                      : "bg-gray-50/50"
                                }`}
                              >
                                <td className="px-4 py-4">
                                  {medicine.photo ? (
                                    <img
                                      src={medicine.photo.url}
                                      alt={medicine.name}
                                      className="h-14 w-14 object-cover rounded-2xl border-2 border-gray-200 shadow-sm"
                                    />
                                  ) : (
                                    <div className="h-14 w-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                                      <span className="text-2xl">💊</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="text"
                                    value={medicine.name}
                                    onChange={(e) =>
                                      editMedicine(
                                        medicine.id,
                                        "name",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="text"
                                    value={medicine.brand}
                                    onChange={(e) =>
                                      editMedicine(
                                        medicine.id,
                                        "brand",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="text"
                                    value={medicine.category}
                                    onChange={(e) =>
                                      editMedicine(
                                        medicine.id,
                                        "category",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={medicine.price}
                                    onChange={(e) =>
                                      editMedicine(
                                        medicine.id,
                                        "price",
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="number"
                                    value={medicine.stock}
                                    onChange={(e) =>
                                      editMedicine(
                                        medicine.id,
                                        "stock",
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <input
                                    type="date"
                                    value={medicine.expiryDate}
                                    onChange={(e) =>
                                      editMedicine(
                                        medicine.id,
                                        "expiryDate",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                                  />
                                </td>
                                <td className="px-4 py-4">
                                  <button
                                    onClick={() => removeMedicine(medicine.id)}
                                    className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center shadow-lg"
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
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Enhanced Summary Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl text-center border border-blue-200 shadow-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {extractedData.length}
                        </div>
                        <div className="text-sm font-semibold text-blue-800">
                          Total Medicines
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl text-center border border-green-200 shadow-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {extractedData.filter((m) => m.valid).length}
                        </div>
                        <div className="text-sm font-semibold text-green-800">
                          Valid Entries
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center border border-yellow-200 shadow-lg">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                          {extractedData.filter((m) => m.photo).length}
                        </div>
                        <div className="text-sm font-semibold text-yellow-800">
                          With Photos
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl text-center border border-red-200 shadow-lg">
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          {extractedData.filter((m) => !m.valid).length}
                        </div>
                        <div className="text-sm font-semibold text-red-800">
                          Need Attention
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicine;
