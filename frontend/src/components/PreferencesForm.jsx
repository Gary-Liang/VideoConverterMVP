import React from "react";

const PreferencesForm = ({ preferences, setPreferences }) => (
  <section className="my-4 flex flex-wrap gap-4">
    <div>
      <label className="block">Platform</label>
      <select
        value={preferences.platform}
        onChange={e => setPreferences(p => ({ ...p, platform: e.target.value }))}
        className="mt-4 p-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500"
      >
        <option value="tiktok">TikTok</option>
        <option value="instagram">Instagram Reels</option>
      </select>
    </div>
    <div>
      <label className="block">Duration</label>
      <select
        value={preferences.duration}
        onChange={e => setPreferences(p => ({ ...p, duration: Number(e.target.value) }))}
        className="mt-4 p-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500"
      >
        <option value={15}>15s</option>
        <option value={30}>30s</option>
        <option value={60}>60s</option>
      </select>
    </div>
    <div>
      <label className="block">Resolution</label>
      <select
        value={preferences.resolution}
        onChange={e => setPreferences(p => ({ ...p, resolution: Number(e.target.value) }))}
        className="mt-4 p-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500"
      >
        <option value={720}>720p</option>
        <option value={1080}>1080p</option>
      </select>
    </div>
  </section>
);

export default PreferencesForm;
