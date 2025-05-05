import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { FaPlay, FaPause, FaExpand, FaDownload } from "react-icons/fa";

const ResultsPreview = ({ results }) => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);

  useEffect(() => {
    console.log("ResultsPreview mounted with results:", results);
  }, [results]);

  const handleDownload = async (url, filename) => {
    try {
      const response = await axios.get(url, { responseType: "blob" });
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
    if (playerRef.current) playerRef.current.seekTo(newPlayed);
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      if (player.requestFullscreen) {
        player.requestFullscreen().catch((err) => console.error("Fullscreen failed:", err));
      }
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
            <div className="relative w-full" style={{ paddingTop: "56.25%" /* 16:9 aspect ratio */ }}>
              <ReactPlayer
                ref={playerRef}
                url={clip.url}
                controls={false}
                playing={playing}
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
                onProgress={handleProgress}
                onDuration={handleDuration}
                onError={(e) => console.error("ReactPlayer error:", e)}
              />
              {/* Always Visible Overlay for Controls */}
              <div className="absolute bottom-0 left-0 w-full bg-gray-800 p-6">
                <div className="flex items-center justify-between space-x-6">
                  <button
                    onClick={handlePlayPause}
                    className="text-white bg-blue-600 p-3 rounded-full hover:bg-blue-700"
                  >
                    {playing ? <FaPause size={24} /> : <FaPlay size={24} />}
                  </button>
                  <div className="flex-1 flex items-center space-x-3 text-white">
                    <span>{formatTime(played * duration)} / {formatTime(duration)}</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={played}
                      onChange={handleSeekChange}
                      className="w-full h-3 bg-gray-400 rounded accent-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleFullscreen}
                    className="text-white bg-gray-600 p-3 rounded-full hover:bg-gray-700"
                  >
                    <FaExpand size={24} />
                  </button>
                  <button
                    onClick={() => handleDownload(clip.url, `clip-${clip.id}.mp4`)}
                    className="text-white bg-green-600 p-3 rounded-full hover:bg-green-700"
                  >
                    <FaDownload size={24} />
                  </button>
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