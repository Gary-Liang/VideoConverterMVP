import React, { useState, useEffect } from "react";

const ProcessingStatus = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const estimatedTime = 60; // Estimated processing time in seconds (based on your 60s timeout)
    const intervalTime = 1000; // Update every 1 second
    const increment = 100 / (estimatedTime / (intervalTime / 1000)); // Increment per second to reach 100%

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

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