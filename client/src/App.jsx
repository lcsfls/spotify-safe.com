import React, { useState, useEffect } from "react";
import axios from "axios";
import { CSVLink } from "react-csv";

function App() {
  const [token, setToken] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [filter, setFilter] = useState("");
  const [cookieAccepted, setCookieAccepted] = useState(() => localStorage.getItem("cookieAccepted") === "true");

  const loginWithSpotify = () => {
    window.location.href = "http://localhost:8000/login";
  };

  const fetchPlaylists = async () => {
    const res = await axios.get(`http://localhost:8000/playlists?token=${token}`);
    setPlaylists(res.data.items);
  };

  const handleExportAll = async () => {
    let allTracks = [];
    for (const playlist of playlists) {
      const res = await axios.get(`http://localhost:8000/tracks?token=${token}&playlist_id=${playlist.id}`);
      const tracks = res.data.items.map(item => ({
        playlist: playlist.name,
        title: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        added_at: item.added_at
      }));
      allTracks = allTracks.concat(tracks);
    }
    const blob = new Blob([
      ["playlist,title,artist,album,added_at\n"].concat(
        allTracks.map(t => `${t.playlist},${t.title},${t.artist},${t.album},${t.added_at}`).join("\n")
      )
    ], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spotify_playlists_backup.csv';
    a.click();
  };

  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access_token");
    if (access) setToken(access);
  }, []);

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4">Spotify Backup</h1>
      <p className="text-gray-600 mb-2">Easily export your Spotify playlists to CSV.</p>

      {!token ? (
        <button
          onClick={loginWithSpotify}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Login with Spotify
        </button>
      ) : (
        <>
          <input
            className="border p-2 mr-2"
            placeholder="Search playlists"
            onChange={(e) => setFilter(e.target.value)}
          />
          <button
            onClick={fetchPlaylists}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            Load Playlists
          </button>
          <button
            onClick={handleExportAll}
            className="bg-purple-600 text-white px-4 py-2 ml-2 rounded"
          >
            Export All to CSV
          </button>

          <div className="mt-4">
            {filteredPlaylists.map((playlist) => (
              <div key={playlist.id} className="text-blue-700">
                {playlist.name}
              </div>
            ))}
          </div>
        </>
      )}

      {!cookieAccepted && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center">
          <span>This website uses cookies for authentication.</span>
          <button
            onClick={() => {
              localStorage.setItem("cookieAccepted", "true");
              setCookieAccepted(true);
            }}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

export default App;