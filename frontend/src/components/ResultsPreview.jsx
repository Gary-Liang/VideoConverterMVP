import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { FaPlay, FaPause, FaExpand, FaDownload } from "react-icons/fa";

const ResultsPreview = ({ results }) => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);

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
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleDuration = (dur) => {
    setDuration(dur);
  };

  const handleSeekChange = (e) => {
    setSeeking(true);
    setPlayed(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = (e) => {
    setSeeking(false);
    if (playerRef.current) {
      playerRef.current.seekTo(parseFloat(e.target.value));
    }
  };

  const handleFullscreen = () => {
    if (playerRef.current) {
      const player = playerRef.current.getInternalPlayer();
      if (player.requestFullscreen) {
        player.requestFullscreen().catch((err) => console.error("Fullscreen failed:", err));
      }
    }
  };

  const handleEnd = () => {
    setPlaying(false);
    setPlayed(0);
  };

  const handleError = (e) => {
    console.error("Video load error:", e);
    setError("Failed to load video. Please try again.");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <section className="my-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Preview Generated Clips</h2>
      <div className="max-w-lg mx-auto">
        {results.map((clip) => (
          <div key={clip.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="w-full">
              {/* Video container */}
              <div className="relative" style={{ paddingTop: "177.78%" }}>
                <div
                  className="absolute top-0 left-0 w-full h-full bg-black"
                  onClick={handlePlayPause}
                >
                  {error ? (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                      <p>{error}</p>
                    </div>
                  ) : (
                    <ReactPlayer
                      ref={playerRef}
                      url={clip.url}
                      controls={false}
                      playing={playing}
                      width="100%"
                      height="100%"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        objectFit: 'cover'
                      }}
                      onProgress={handleProgress}
                      onDuration={handleDuration}
                      onError={handleError}
                      progressInterval={50}
                      onEnded={handleEnd}
                    />
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="p-1 bg-gray-100 flex items-center gap-2 w-full">
                <button
                  onClick={handlePlayPause}
                  className="text-white bg-blue-600 p-2 rounded-full hover:bg-blue-700 shrink-0"
                >
                  {playing ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-gray-800 text-sm">
                      {formatTime(played * duration)}
                    </span>
                    <span className="text-gray-800 text-sm">/</span>
                    <span className="text-gray-800 text-sm">
                      {formatTime(duration)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={played}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                    onTouchEnd={handleSeekMouseUp}
                    className="flex-1 h-2 bg-gray-400 rounded accent-blue-500 transition-all duration-100 ease-in-out min-w-[100px]"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleFullscreen}
                    className="text-white bg-gray-600 p-2 rounded-full hover:bg-gray-700"
                  >
                    <FaExpand size={20} />
                  </button>
                  <button
                    onClick={() => handleDownload(clip.url, `clip-${clip.id}.mp4`)}
                    className="text-white bg-green-600 p-2 rounded-full hover:bg-green-700"
                  >
                    <FaDownload size={20} />
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