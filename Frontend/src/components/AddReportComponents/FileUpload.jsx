import React from "react";
import { Upload, X, File, Image, FileText, Pill, Activity } from "lucide-react";

const FileUpload = ({
  formData,
  handleChange,
  dragActive,
  handleDrag,
  handleDrop,
  handleRemoveReportFile,
  handleRemoveMedicineFile,
}) => {
  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (file.type === "application/pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Upload Report Files
          <span className="text-sm text-gray-300 font-normal">
            (Up to 5 files)
          </span>
        </h3>

        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
            dragActive
              ? "border-blue-400 bg-blue-50/10"
              : "border-white/30 hover:border-white/50"
          }`}
          data-upload-type="reports"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            name="reportFiles"
            onChange={handleChange}
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto h-12 w-12 text-white/70 mb-4" />
          <p className="text-white/90 mb-2">
            Drop report files here or click to upload
          </p>
          <p className="text-white/60 text-sm">
            Main medical reports, test results, imaging files, etc.
          </p>
          <p className="text-white/50 text-xs mt-1">
            Supports: JPEG, PNG, PDF, DOC, DOCX (Max: 10MB per file)
          </p>
        </div>

        {/* Selected Report Files Display */}
        {formData.reportFiles && formData.reportFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-white">
              Report Files ({formData.reportFiles.length}/5):
            </h4>
            <div className="space-y-2">
              {formData.reportFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-white font-medium text-sm truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-white/60 text-xs">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReportFile(index)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Medicine List File Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5" />
          Medicine List File
          <span className="text-sm text-gray-300 font-normal">
            (Optional - for auto-extraction)
          </span>
        </h3>

        {/* Medicine File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 border-green-500/30 hover:border-green-400/50 bg-green-500/5`}
          data-upload-type="medicine"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            name="medicineFile"
            onChange={handleChange}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Pill className="mx-auto h-10 w-10 text-green-400 mb-3" />
          <p className="text-white/90 mb-2">
            Drop medicine list file here or click to upload
          </p>
          <p className="text-green-200 text-sm mb-1">
            Prescription or medicine list for automatic extraction
          </p>
          <p className="text-white/50 text-xs">
            This file will be used specifically for medicine extraction
          </p>
        </div>

        {/* Selected Medicine File Display */}
        {formData.medicineFile && (
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-green-200">
              Medicine File:
            </h4>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(formData.medicineFile)}
                  <div>
                    <p className="text-white font-medium text-sm truncate max-w-xs">
                      {formData.medicineFile.name}
                    </p>
                    <p className="text-green-200 text-xs">
                      {formatFileSize(formData.medicineFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveMedicineFile}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <p className="text-green-200 text-sm">
                ✨ <strong>Ready for extraction!</strong> Use the "Get Medicines
                from Report" button in the medicine section below to extract
                medicines from this file.
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-200 text-sm">
            💡 <strong>Tip:</strong> Upload a clear image or PDF of your
            prescription/medicine list here. This will be used specifically for
            automatic medicine extraction, separate from your main report files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
