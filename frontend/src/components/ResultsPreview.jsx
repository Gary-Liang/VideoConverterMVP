import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { FaPlay, FaPause, FaExpand, FaDownload } from "react-icons/fa";

const ResultsPreview = ({ results }) => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);

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
    setPlayed(state.played);
  };

  const handleDuration = (dur) => {
    setDuration(dur);
  };

  const handleSeekChange = (e) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    playerRef.current.seekTo(newPlayed);
  };

  const handleFullscreen = () => {
    const player = playerRef.current.getInternalPlayer();
    if (player.requestFullscreen) {
      player.requestFullscreen();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <section className="my-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Preview Generated Clips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((clip) => (
          <div key={clip.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="relative">
              <ReactPlayer
                ref={playerRef}
                url={clip.url}
                controls={false}
                playing={playing}
                width="100%"
                height="360px"
                onProgress={handleProgress}
                onDuration={handleDuration}
              />
              {/* Overlay Controls */}
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-between gap-6">
                  <button
                    onClick={handlePlayPause}
                    aria-label={playing ? "Pause" : "Play"}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-md"
                  >
                    {playing ? <FaPause size={20} /> : <FaPlay size={20} />}
                  </button>
                  <div className="flex-grow flex items-center gap-4">
                    <span className="text-white text-sm">
                      {formatTime(played * duration)} / {formatTime(duration)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={played}
                      onChange={handleSeekChange}
                      aria-label="Video progress"
                      aria-valuenow={played * 100}
                      aria-valuetext={`${formatTime(played * duration)} of ${formatTime(duration)}`}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none accent-blue-500 cursor-pointer transition-all duration-200 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:bg-blue-500 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:shadow-md 
                        [&::-webkit-slider-thumb]:hover:bg-blue-600 
                        [&::-moz-range-thumb]:w-4 
                        [&::-moz-range-thumb]:h-4 
                        [&::-moz-range-thumb]:bg-blue-500 
                        [&::-moz-range-thumb]:rounded-full 
                        [&::-moz-range-thumb]:shadow-md 
                        [&::-moz-range-thumb]:hover:bg-blue-600"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleFullscreen}
                      aria-label="Fullscreen"
                      className="p-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition shadow-md"
                    >
                      <FaExpand size={20} />
                    </button>
                    <button
                      onClick={() => handleDownload(clip.url, `clip-${clip.id}.mp4`)}
                      aria-label="Download"
                      className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-md"
                    >
                      <FaDownload size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResultsPreview;