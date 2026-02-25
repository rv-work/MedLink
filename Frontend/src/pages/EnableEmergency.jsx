import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Shield,
  Camera,
  CheckCircle,
  AlertTriangle,
  Heart,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const EnableEmergency = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!capturedImage) {
      alert("Please capture your face.");
      return;
    }

    setCurrentStep(3);

    try {
      const blob = await (await fetch(capturedImage)).blob();
      const imageFile = new File([blob], "face.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("face", imageFile);

      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/emergency/add-face",
        { method: "POST", body: formData, credentials: "include" },
      );
      const data = await response.json();

      if (response.ok) {
        setCurrentStep(4);
        toast.success("Emergency system activated!");
      } else {
        console.error(data);
        alert("Something went wrong: " + (data?.message || "Unknown error"));
        setCurrentStep(2);
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading emergency data.");
      setCurrentStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 p-4 relative overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4 animate-bounce">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 animate-fade-in">
            Emergency Guardian
          </h1>
          <p className="text-white/80 text-lg animate-fade-in delay-200">
            One tap to activate your safety network
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
                    currentStep >= step
                      ? "bg-white text-red-500 scale-110 shadow-lg"
                      : "bg-white/20 text-white/60"
                  }`}
                >
                  {step === 1 && <Camera className="w-5 h-5" />}
                  {step === 2 && <Shield className="w-5 h-5" />}
                  {step === 3 && <Zap className="w-5 h-5" />}
                  {step === 4 && <CheckCircle className="w-5 h-5" />}
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 w-8 transition-all duration-500 ${
                      currentStep > step ? "bg-white" : "bg-white/20"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up">
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <Camera className="w-12 h-12 text-white mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Capture Your Face
                </h2>
                <p className="text-white/80">
                  We’ll use this to trigger your emergency response
                </p>
              </div>

              <div className="relative mb-6">
                {capturedImage ? (
                  <div className="relative animate-zoom-in">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="rounded-2xl w-full shadow-2xl"
                    />
                    <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      className="rounded-2xl w-full shadow-2xl"
                    />
                    <div className="absolute inset-0 rounded-2xl border-4 border-white/30 animate-pulse"></div>
                  </div>
                )}
              </div>

              <button
                onClick={captureImage}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <Camera className="w-6 h-6" />
                Capture My Face
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in text-center">
              <Shield className="w-12 h-12 text-white mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Activate Emergency System
              </h2>
              <p className="text-white/80 mb-6">
                Confirm to trigger your guardian network
              </p>
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <Shield className="w-6 h-6" />
                Trigger Emergency
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-spin mb-6">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Activating Guardian Network
              </h2>
              <p className="text-white/80 text-lg">
                Notifying your safety contacts...
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-bounce mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Emergency Triggered!
              </h2>
              <p className="text-white/80 text-lg mb-4">
                Your guardians have been alerted.
              </p>
              <div className="bg-green-500/20 rounded-2xl p-6 border border-green-400/30 text-green-300 font-semibold flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Help is on the way
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-zoom-in {
          animation: zoom-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EnableEmergency;
