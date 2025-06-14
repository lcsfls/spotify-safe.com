import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://spotify-safe.com/api";

function App() {
  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [filter, setFilter] = useState("");
  const [cookieAccepted, setCookieAccepted] = useState(() => localStorage.getItem("cookieAccepted") === "true");

  const loginWithSpotify = () => {
    window.location.href = `${API_BASE_URL}/login`;
  };

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/playlists?token=${token}`);
      setPlaylists(res.data.items || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const handleExportAll = async () => {
    let allTracks = [];
    try {
      for (const playlist of playlists) {
        const res = await axios.get(`${API_BASE_URL}/tracks?token=${token}&playlist_id=${playlist.id}`);
        const tracks = res.data.items.map(item => ({
          playlist: playlist.name,
          title: item.track.name,
          artist: item.track.artists[0].name,
          album: item.track.album.name,
          added_at: item.added_at
        }));
        allTracks = allTracks.concat(tracks);
      }

      const csvContent = [
        ["playlist", "title", "artist", "album", "added_at"].join(","),
        ...allTracks.map(t => `${t.playlist},${t.title},${t.artist},${t.album},${t.added_at}`)
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spotify_playlists_backup.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting playlists:", error);
    }
  };

  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access_token");
    if (access) setToken(access);
  }, []);

  return (
    <div className="app-container">
      <h1 className="title">Spotify Backup</h1>
      <p className="subtitle">Easily export your Spotify playlists to CSV.</p>

      {!token ? (
        <button
          onClick={loginWithSpotify}
          className="spotify-button"
        >
          Login with Spotify
        </button>
      ) : (
        <>
          <input
            className="input"
            placeholder="Search playlists"
            onChange={(e) => setFilter(e.target.value)}
          />
          <button
            onClick={fetchPlaylists}
            className="action-button"
          >
            Load Playlists
          </button>
          <button
            onClick={handleExportAll}
            className="action-button export"
          >
            Export All to CSV
          </button>

          <div className="playlist-list">
            {filteredPlaylists.map((playlist) => (
              <div key={playlist.id} className="playlist-item">
                {playlist.name}
              </div>
            ))}
          </div>
        </>
      )}

      {!cookieAccepted && (
        <div className="cookie-banner">
          <span>This website uses cookies for authentication.</span>
          <button
            onClick={() => {
              localStorage.setItem("cookieAccepted", "true");
              setCookieAccepted(true);
            }}
            className="accept-button"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
