import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { FaPlay, FaPause, FaExpand, FaDownload } from "react-icons/fa";

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
          <div key={clip.id} className="border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="relative rounded-md overflow-hidden shadow-sm">
              <ReactPlayer
                ref={playerRef}
                url={clip.url}
                controls={false} // Disable default browser controls
                playing={playing}
                width="100%"
                height="360px"
                onProgress={handleProgress}
              />
            </div>
            {/* Unified Controls Bar */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                aria-label={playing ? "Pause" : "Play"}
                className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition shadow-sm"
              >
                {playing ? <FaPause size={18} /> : <FaPlay size={18} />}
              </button>
              <div className="flex-grow max-w-[70%]">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step="any"
                  value={played}
                  onChange={handleSeekChange}
                  aria-label="Video progress"
                  aria-valuenow={played * 100}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-blue-500 cursor-pointer transition-all duration-200 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-4 
                    [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:bg-blue-500 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:shadow-sm 
                    [&::-webkit-slider-thumb]:hover:bg-blue-600 
                    [&::-moz-range-thumb]:w-4 
                    [&::-moz-range-thumb]:h-4 
                    [&::-moz-range-thumb]:bg-blue-500 
                    [&::-moz-range-thumb]:rounded-full 
                    [&::-moz-range-thumb]:shadow-sm 
                    [&::-moz-range-thumb]:hover:bg-blue-600"
                />
              </div>
              <button
                onClick={handleFullscreen}
                aria-label="Fullscreen"
                className="p-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition shadow-sm"
              >
                <FaExpand size={18} />
              </button>
              <button
                onClick={() => handleDownload(clip.url, `clip-${clip.id}.mp4`)}
                aria-label="Download"
                className="p-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition shadow-sm"
              >
                <FaDownload size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResultsPreview;