import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import PreferencesForm from "./components/PreferencesForm";
import ProcessingStatus from "./components/ProcessingStatus";
import ResultsPreview from "./components/ResultsPreview";
import Footer from "./components/Footer";

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [preferences, setPreferences] = useState({
    platform: "tiktok",
    duration: 15,
    resolution: 720,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  const handleStartConversion = async () => {
    if (!videoFile) {
      setError("Please upload a video file.");
      return;
    }
    if (videoFile.size > 500 * 1024 * 1024) {
      setError("File too large. Please upload a video under 500MB.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPolling(true);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("platform", preferences.platform);
    formData.append("duration", preferences.duration);
    formData.append("resolution", preferences.resolution);

    try {
      const response = await axios.post(
        "https://videoconvertermvp-production.up.railway.app/convert",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
        }
      );

      const { jobId } = response.data;
      if (!jobId) {
        throw new Error("No jobId returned from server");
      }
      setJobId(jobId);
      console.log("Job started with ID:", jobId); // Debug log

      const pollStatus = async () => {
        if (!polling) return;

        try {
          const statusResponse = await axios.get(
            `https://videoconvertermvp-production.up.railway.app/status/${jobId}`
          );
          const { status, url, error } = statusResponse.data;

          if (status === "completed") {
            setResults([{ url, id: 1 }]);
            setIsProcessing(false);
            setJobId(null);
            setPolling(false);
          } else if (status === "failed") {
            setError(error || "Video processing failed.");
            setIsProcessing(false);
            setJobId(null);
            setPolling(false);
          } else {
            setTimeout(pollStatus, 3000);
          }
        } catch (err) {
          console.error("Poll status error:", err);
          setError("Failed to check status. Please try again.");
          setIsProcessing(false);
          setJobId(null);
          setPolling(false);
        }
      };

      pollStatus();
    } catch (err) {
      console.error("Conversion start error:", err);
      setError("Failed to start processing. Please try again.");
      setIsProcessing(false);
      setJobId(null);
      setPolling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="card max-w-lg mx-auto mt-24 mb-10 p-8 bg-white rounded-lg shadow-lg">
        <main className="flex-1 container mx-auto p-4">
          <UploadSection videoFile={videoFile} setVideoFile={setVideoFile} />
          <PreferencesForm preferences={preferences} setPreferences={setPreferences} />
          {error && <p className="mt-2 text-red-600">{error}</p>}
          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
            disabled={!videoFile || isProcessing}
            onClick={handleStartConversion}
          >
            {isProcessing ? (
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : null}
            {isProcessing ? "Processing..." : "Start Conversion"}
          </button>
          {isProcessing && <ProcessingStatus jobId={jobId} />}
          {results.length > 0 && <ResultsPreview results={results} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;