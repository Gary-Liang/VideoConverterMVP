import React from "react";

const UploadSection = ({ videoFile, setVideoFile }) => (
  <section className="my-4">
    <label className="block mb-2 font-semibold">Upload your video</label>
    <input
      type="file"
      accept="video/*"
      onChange={e => setVideoFile(e.target.files[0])}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />
    {videoFile && <p className="mt-2 text-green-600">Selected: {videoFile.name}</p>}
  </section>
);

export default UploadSection;
