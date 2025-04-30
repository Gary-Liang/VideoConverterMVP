import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import axios from "axios";

const ResultsPreview = ({ results }) => {
  const [playing, setPlaying] = useState(false); // Track play/pause state
  const [played, setPlayed] = useState(0); // Track progress (0 to 1)
  const playerRef = useRef(null); // Reference to ReactPlayer instance

  const handleDownload = async (url, filename) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "video/mp4" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download the video. Please try again.");
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  const handleProgress = (state) => {
    setPlayed(state.played); // Update progress as video plays
  };

  const handleSeekChange = (e) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    playerRef.current.seekTo(newPlayed); // Seek to new position
  };

  const handleFullscreen = () => {
    const player = playerRef.current.getInternalPlayer();
    if (player.requestFullscreen) {
      player.requestFullscreen();
    }
  };
  

  return (
    <section className="my-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Preview Generated Clips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((clip) => (
          <div key={clip.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="relative">
              <ReactPlayer
                ref={playerRef}
                url={clip.url}
                controls={false} // Disable default browser controls
                playing={playing}
                width="100%"
                height="360px"
                onProgress={handleProgress}
              />
              {/* Custom Controls */}
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  {playing ? "Pause" : "Play"}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played}
                  onChange={handleSeekChange}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleFullscreen}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Fullscreen
            </button>
            </div>
            <button
              onClick={() => handleDownload(clip.url, `clip-${clip.id}.mp4`)}
              className="mt-3 inline-block px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResultsPreview;