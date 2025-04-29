import React from "react";
import ReactPlayer from "react-player";

const ResultsPreview = ({ results }) => (
  <section className="my-8">
    <h2 className="text-xl font-semibold mb-4">Preview Generated Clips</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {results.map(clip => (
        <div key={clip.id} className="border rounded p-2">
          <ReactPlayer url={clip.url} controls width="100%" height="360px" />
          <a
            href={clip.url}
            download={`clip-${clip.id}.mp4`}
            className="mt-2 inline-block px-3 py-1 bg-green-600 text-white rounded"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  </section>
);

export default ResultsPreview;
