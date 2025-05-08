import React, { useState } from "react";

const PreferencesForm = ({ preferences, setPreferences }) => {
  const [format, setFormat] = useState(preferences.platform || "tiktok");
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1920);
  const [customDuration, setCustomDuration] = useState(15);
  const [isCustomValid, setIsCustomValid] = useState(true);

  const formatOptions = [
    { value: "tiktok", label: "TikTok (1080x1920, 15s)", outputWidth: 1080, outputHeight: 1920, duration: 15 },
    { value: "instagram", label: "Instagram Reels (1080x1920, 30s)", outputWidth: 1080, outputHeight: 1920, duration: 30 },
    { value: "youtube-shorts", label: "YouTube Shorts (1080x1920, 60s)", outputWidth: 1080, outputHeight: 1920, duration: 60 },
    { value: "youtube-standard", label: "YouTube Standard (1920x1080, 15min)", outputWidth: 1920, outputHeight: 1080, duration: 900 },
    { value: "square", label: "Square (1080x1080, 30s)", outputWidth: 1080, outputHeight: 1080, duration: 30 },
    { value: "custom", label: "Custom", outputWidth: null, outputHeight: null, duration: null },
  ];

  const validateCustomInputs = (width, height, duration) => {
    const isValid = width > 0 && height > 0 && duration > 0 && Number.isInteger(width) && Number.isInteger(height) && Number.isInteger(duration);
    setIsCustomValid(isValid);
    return isValid;
  };

  const handleFormatChange = (e) => {
    const selectedFormat = e.target.value;
    setFormat(selectedFormat);

    const formatData = formatOptions.find((opt) => opt.value === selectedFormat);
    if (selectedFormat !== "custom") {
      setPreferences({
        platform: selectedFormat,
        outputWidth: formatData.outputWidth,
        outputHeight: formatData.outputHeight,
        duration: formatData.duration,
        isValid: true,
      });
    } else {
      const isValid = validateCustomInputs(customWidth, customHeight, customDuration);
      setPreferences({
        platform: "custom",
        outputWidth: customWidth,
        outputHeight: customHeight,
        duration: customDuration,
        isValid: isValid,
      });
    }
  };

  const handleCustomChange = (field, value) => {
    const newValue = parseInt(value) || 0;
    let newWidth = customWidth;
    let newHeight = customHeight;
    let newDuration = customDuration;

    if (field === "width") {
      newWidth = newValue;
      setCustomWidth(newValue);
    } else if (field === "height") {
      newHeight = newValue;
      setCustomHeight(newValue);
    } else if (field === "duration") {
      newDuration = newValue;
      setCustomDuration(newValue);
    }

    const isValid = validateCustomInputs(newWidth, newHeight, newDuration);
    setPreferences({
      platform: "custom",
      outputWidth: newWidth,
      outputHeight: newHeight,
      duration: newDuration,
      isValid: isValid,
    });
  };

  return (
    <section className="grid grid-cols-3 gap-4">
      <div className="col-span-3">
        <label className="block text-gray-700 font-medium mb-2">Format</label>
        <select
          value={format}
          onChange={handleFormatChange}
          className="p-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500"
        >
          {formatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {format === "custom" && (
        <>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Output Width</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => handleCustomChange("width", e.target.value)}
              placeholder="Width (e.g., 1920)"
              className={`p-2 border rounded-md w-full ${!isCustomValid ? "border-red-500" : "border-gray-300"}`}
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Output Height</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => handleCustomChange("height", e.target.value)}
              placeholder="Height (e.g., 1080)"
              className={`p-2 border rounded-md w-full ${!isCustomValid ? "border-red-500" : "border-gray-300"}`}
              min="1"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Duration (seconds)</label>
            <input
              type="number"
              value={customDuration}
              onChange={(e) => handleCustomChange("duration", e.target.value)}
              placeholder="Duration in seconds"
              className={`p-2 border rounded-md w-full ${!isCustomValid ? "border-red-500" : "border-gray-300"}`}
              min="1"
            />
            <p className="text-sm text-gray-500 mt-1">Example: For 16:9, use Width: 1920, Height: 1080</p>
            {!isCustomValid && (
              <p className="text-red-500 text-sm mt-1">Please enter positive integers.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default PreferencesForm;