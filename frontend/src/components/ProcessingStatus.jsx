import React, { useState, useEffect } from "react";
import axios from "axios";

const ProcessingStatus = ({ jobId }) => {
  const [progress, setProgress] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!jobId || !isPolling) return;

    const timer = setTimeout(() => {
      const pollProgress = async () => {
        try {
          const response = await axios.get(
            `https://videoconvertermvp-production.up.railway.app/status/${jobId}`
          );
          const { progress: newProgress, status } = response.data;

          if (status === "processing") {
            setProgress(newProgress || 0);
            setTimeout(pollProgress, 1000);
          } else if (status === "completed") {
            setProgress(100);
            setIsPolling(false);
          } else if (status === "failed") {
            setError("Processing failed. Please try again.");
            setIsPolling(false);
          }
        } catch (err) {
          console.error("Failed to fetch progress:", err);
          if (err.response?.status === 404) {
            setError("Job not found. Please try again.");
          } else {
            setError("Failed to fetch progress. Please try again.");
          }
          setIsPolling(false);
        }
      };

      pollProgress();
    }, 2000);

    return () => clearTimeout(timer);
  }, [jobId, isPolling]);

  const calculateETA = () => {
    if (progress === 0 || progress >= 100) return "Calculating...";
    const elapsedMs = Date.now() - startTime;
    const elapsedSeconds = elapsedMs / 1000;
    const progressPercent = progress / 100;
    const estimatedTotalSeconds = elapsedSeconds / progressPercent;
    const remainingSeconds = Math.round(estimatedTotalSeconds - elapsedSeconds);
    return `ETA: ~${remainingSeconds}s`;
  };

  if (error) {
    return <p className="my-8 text-red-600 text-center">{error}</p>;
  }

  return (
    <div className="my-8 flex flex-col items-center">
      <div className="w-full max-w-md mb-2">
        <div className="bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <p>
        Processing your video... {Math.round(progress)}% - {calculateETA()}
      </p>
    </div>
  );
};

export default ProcessingStatus;