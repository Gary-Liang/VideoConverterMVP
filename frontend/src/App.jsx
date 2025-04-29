import React, { useState } from "react";
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
  const [results, setResults] = useState([]);

  // Simulate backend processing
  const handleStartConversion = async () => {
    setIsProcessing(true);
    // TODO: Send videoFile and preferences to backend
    setTimeout(() => {
      setResults([
        { url: URL.createObjectURL(videoFile), id: 1 },
      ]);
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="card max-w-md mx-auto mt-20 mb-10 p-6 bg-white rounded-lg shadow-lg">
        <Header />
        <main className="flex-1 container mx-auto p-4">
          <UploadSection videoFile={videoFile} setVideoFile={setVideoFile} />
          <PreferencesForm preferences={preferences} setPreferences={setPreferences} />
          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={!videoFile || isProcessing}
            onClick={handleStartConversion}
          >
            Start Conversion
          </button>
          {isProcessing && <ProcessingStatus />}
          {results.length > 0 && <ResultsPreview results={results} />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
