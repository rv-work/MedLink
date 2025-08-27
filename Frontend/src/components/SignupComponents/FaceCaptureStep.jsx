import { Camera, UploadCloud, ImagePlus } from "lucide-react";

const FaceCaptureStep = ({
  videoRef,
  capturedImage,
  setCapturedImage,
  isCameraActive,
  startCamera,
  capturePhoto,
}) => {
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result); // base64
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Camera className="text-blue-600" size={28} />
        Capture or Upload Your Face
      </h3>

      <div className="text-center">
        <div className="bg-gray-100 rounded-xl p-6 max-w-md mx-auto relative space-y-4">
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Face"
              className="w-full rounded-xl mb-4 shadow-md"
            />
          )}

          {!capturedImage && (
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full rounded-lg mb-4"
              style={{ display: isCameraActive ? "block" : "none" }}
            />
          )}

          {/* Initial Instructions */}
          {!capturedImage && !isCameraActive && (
            <div className="text-gray-500 mb-4">
              <ImagePlus size={64} className="mx-auto mb-2" />
              <p>Select a method to add your face</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col items-center space-y-3">
            {!isCameraActive && !capturedImage && (
              <>
                <button
                  onClick={startCamera}
                  className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
                >
                  <Camera size={18} />
                  Start Camera
                </button>

                <label className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer shadow">
                  <UploadCloud size={18} />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
              </>
            )}

            {isCameraActive && (
              <button
                onClick={capturePhoto}
                className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
              >
                📸 Capture Photo
              </button>
            )}

            {capturedImage && (
              <button
                onClick={() => setCapturedImage(null)}
                className="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded hover:bg-gray-600"
              >
                Retake / Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceCaptureStep;
