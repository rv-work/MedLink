import React, { useEffect, useState } from "react";
import {
  Camera,
  Shield,
  AlertTriangle,
  CheckCircle,
  User,
  Loader2,
} from "lucide-react";
import * as faceapi from "face-api.js";
import axios from "axios";

const Emergency = () => {
  const [videoElement, setVideoElement] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceCaptureLoading, setFaceCaptureLoading] = useState(false);
  const [userName, setUserName] = useState(null);
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (isCameraActive && videoElement && videoElement.srcObject === null) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive, videoElement]);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    try {
      setModelLoadingProgress(25);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setTimeout(() => setModelLoadingProgress(50), 500);
      setTimeout(() => setModelLoadingProgress(75), 1000);
      setTimeout(() => {
        setModelLoadingProgress(100);
        setIsModelLoaded(true);
      }, 1500);
    } catch (error) {
      console.error("Model loading error:", error);
      setError("Failed to load face recognition models");
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      setError(
        "Camera access denied. Please allow camera permissions and try again."
      );
    }
  };

  const captureAndProcessFace = async () => {
    setFaceCaptureLoading(true);
    setError(null);

    if (!videoElement || !isModelLoaded) {
      setError("Models not loaded or camera not ready");
      setFaceCaptureLoading(false);
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockDetection = true;
      const descriptorArray = Array.from(detection.descriptor);

      if (mockDetection) {
        const response = await axios.post(
          "http://localhost:5000/api/emergency/face",
          {
            faceDescriptor: descriptorArray,
          }
        );

        const data = response.data;

        if (data && data.name) {
          setUserName(data.name);
          setSuccessMessage(`Welcome ${data.name}! Access granted.`);
          const stream = videoElement.srcObject;
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          setIsCameraActive(false);
        } else {
          setError("No matching user found in the system.");
        }
      } else {
        setError(
          "No face detected. Please position yourself clearly in front of the camera."
        );
      }
    } catch (err) {
      setError(
        "Error processing face recognition. Please try again.",
        err.message
      );
      console.error(err);
    }

    setFaceCaptureLoading(false);
  };

  const resetSystem = () => {
    setUserName(null);
    setSuccessMessage(null);
    setError(null);
    if (isCameraActive && videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-black text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Emergency Access
          </h1>
          <p className="text-gray-300">Face recognition security system</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {!isModelLoaded && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Loading AI Models</span>
                <span className="text-sm text-gray-300">
                  {modelLoadingProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${modelLoadingProgress}%` }}
                />
              </div>
            </div>
          )}

          {isModelLoaded && !userName && (
            <>
              {!isCameraActive ? (
                <div className="text-center">
                  <div className="mb-6">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-6">
                      Click to activate camera for face recognition
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCameraActive(true)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Camera className="w-5 h-5 inline mr-2" />
                    Activate Camera
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-red-400/30 mb-6 bg-black/50">
                    <video
                      ref={(el) => setVideoElement(el)}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-red-500/50 rounded-2xl pointer-events-none">
                      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-red-500"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-red-500"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-red-500"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-red-500"></div>
                    </div>
                    {faceCaptureLoading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-red-400 mx-auto mb-2" />
                          <p className="text-white text-sm">Processing...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={captureAndProcessFace}
                    disabled={faceCaptureLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:cursor-not-allowed"
                  >
                    {faceCaptureLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                        Scanning Face...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 inline mr-2" />
                        Capture & Verify
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {userName && (
            <div className="text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">
                  Access Granted
                </h2>
                <div className="bg-green-500/10 border border-green-400/30 rounded-2xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <User className="w-5 h-5 text-green-400 mr-2" />
                    <span className="text-green-300 font-semibold">
                      {userName}
                    </span>
                  </div>
                  <p className="text-green-200 text-sm">
                    Emergency access authorized
                  </p>
                </div>
              </div>
              <button
                onClick={resetSystem}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
              >
                Reset System
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">Error</p>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 bg-green-500/10 border border-green-400/30 rounded-2xl p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium">Success</p>
                <p className="text-green-200 text-sm">{successMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            🔒 Secure emergency access system
          </p>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
