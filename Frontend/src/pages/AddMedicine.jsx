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

  // Sample ZIP download function - ye add karo existing functions ke saath
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
        // Convert base64 to blob
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

      // Clean up
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
        }
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
        (row) => row.name && row.name.trim() !== ""
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
        } photos`
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
            { type: medicine.photo.file.type }
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
        }
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
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("manual")}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "manual"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === "bulk"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              CSV + ZIP Upload
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === "manual" ? (
            // Manual Entry Form
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Add New Medicine
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Crocin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Pain Relief"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., GlaxoSmithKline"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 25.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CR001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the medicine..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPG, PNG (Max 5MB)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Requires Prescription
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "Adding Medicine..." : "Add Medicine"}
              </button>
            </form>
          ) : (
            // CSV + ZIP Upload Tab
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Bulk Upload Medicines
              </h2>

              {!showPreview ? (
                // File Upload Section
                <>
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium text-blue-800 mb-2">
                      Instructions:
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Upload a CSV file with medicine details</li>
                      <li>• Upload a ZIP file containing medicine photos</li>
                      <li>
                        • Photo files should be named to match medicine names
                        (e.g., "paracetamol.jpg", "aspirin.png")
                      </li>
                      <li>
                        • CSV headers: name, brand, category, description,
                        price, stock, expiryDate, batchNumber, manufacturer,
                        requiresPrescription
                      </li>
                      <li className="font-medium text-blue-800">
                        • Use sample files below to test the feature
                      </li>
                    </ul>
                  </div>

                  {/* Sample Downloads */}
                  {/* Sample Downloads - ye replace kro existing sample section me */}
                  <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="font-medium text-green-800 mb-3">
                      Sample Files for Testing:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={downloadSampleCSV}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <span>📄</span>
                        <span>Download CSV</span>
                      </button>
                      <button
                        onClick={downloadSampleZIP}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <span>🗜️</span>
                        <span>Download ZIP</span>
                      </button>
                      <button
                        onClick={showSampleData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <span>👁️</span>
                        <span>Preview Data</span>
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      💡 Download both files, then upload them to test the bulk
                      upload feature
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSV File *
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {csvFile && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {csvFile.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP File (Photos) *
                      </label>
                      <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => setZipFile(e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {zipFile && (
                        <p className="text-sm text-green-600 mt-1">
                          ✓ {zipFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleFileExtraction}
                    disabled={processingFiles || !csvFile || !zipFile}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {processingFiles
                      ? "Processing Files..."
                      : "Extract & Preview Data"}
                  </button>
                </>
              ) : (
                // Data Preview Section
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">
                        Extracted Data Preview
                      </h3>
                      <p className="text-sm text-gray-600">
                        Found {extractedData.length} medicines,{" "}
                        {Object.keys(extractedPhotos).length} photos matched
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={resetExtraction}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleBulkUpload}
                        disabled={loading || extractedData.length === 0}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                      >
                        {loading
                          ? "Adding Medicines..."
                          : `Add ${extractedData.length} Medicines`}
                      </button>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Photo
                          </th>
                          <th className="w-32 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Brand
                          </th>
                          <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Category
                          </th>
                          <th className="w-20 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Stock
                          </th>
                          <th className="w-24 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Expiry
                          </th>
                          <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {extractedData.map((medicine, index) => (
                          <tr
                            key={medicine.id}
                            className={!medicine.valid ? "bg-red-50" : ""}
                          >
                            <td className="px-2 py-2">
                              {medicine.photo ? (
                                <img
                                  src={medicine.photo.url}
                                  alt={medicine.name}
                                  className="h-10 w-10 object-cover rounded"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    💊
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={medicine.name}
                                onChange={(e) =>
                                  editMedicine(
                                    medicine.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={medicine.brand}
                                onChange={(e) =>
                                  editMedicine(
                                    medicine.id,
                                    "brand",
                                    e.target.value
                                  )
                                }
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={medicine.category}
                                onChange={(e) =>
                                  editMedicine(
                                    medicine.id,
                                    "category",
                                    e.target.value
                                  )
                                }
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="0.01"
                                value={medicine.price}
                                onChange={(e) =>
                                  editMedicine(
                                    medicine.id,
                                    "price",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={medicine.stock}
                                onChange={(e) =>
                                  editMedicine(
                                    medicine.id,
                                    "stock",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="date"
                                value={medicine.expiryDate}
                                onChange={(e) =>
                                  editMedicine(
                                    medicine.id,
                                    "expiryDate",
                                    e.target.value
                                  )
                                }
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <button
                                onClick={() => removeMedicine(medicine.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                ❌
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {extractedData.length}
                      </div>
                      <div className="text-sm text-blue-800">
                        Total Medicines
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {extractedData.filter((m) => m.valid).length}
                      </div>
                      <div className="text-sm text-green-800">
                        Valid Entries
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {extractedData.filter((m) => m.photo).length}
                      </div>
                      <div className="text-sm text-yellow-800">With Photos</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-md text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {extractedData.filter((m) => !m.valid).length}
                      </div>
                      <div className="text-sm text-red-800">
                        Needs Attention
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
  );
};

export default AddMedicine;
