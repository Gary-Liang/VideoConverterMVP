import React, { useState, useEffect } from "react";
import axios from "axios";

const ProcessingStatus = ({ jobId }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    const pollProgress = async () => {
      try {
        const response = await axios.get(
          `https://videoconvertermvp-production.up.railway.app/status/${jobId}`
        );
        const { progress: newProgress, status } = response.data;

        if (status === "processing") {
          setProgress(newProgress || 0);
          setTimeout(pollProgress, 1000); // Poll every 1 second
        }
      } catch (err) {
        console.error("Failed to fetch progress:", err);
      }
    };

    pollProgress();
  }, [jobId]);

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
      <p>Processing your video... {Math.round(progress)}%</p>
    </div>
  );
};

export default ProcessingStatus;