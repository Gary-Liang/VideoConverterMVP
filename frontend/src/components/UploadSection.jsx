import React from "react";

const UploadSection = ({ videoFile, onFileChange }) => (
  <section className="space-y-6">
    <div className="-webkit -transition-all duration-500 ease-in-out hover:bg-blue-100">
      <label className="block text-gray-700 font-medium mb-2">Upload your video</label>
      <input
        type="file"
        accept="video/*"
        onChange={e => onFileChange(e.target.files[0])}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {videoFile && <p className="mt-2 text-green-600">Selected: {videoFile.name}</p>}
    </div>
  </section>
);

export default UploadSection;