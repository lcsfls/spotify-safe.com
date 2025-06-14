from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
import requests
import os
import urllib.parse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIENT_ID="4c774b703ca04dd581468be07d39a724"
CLIENT_SECRET="bb2955836f7f40a9a8a71a88cd7a54a5"
REDIRECT_URI=https://spotify-safe.com/api/callback
FRONTEND_URI=https://spotify-safe.com

@app.get("/login")
def login():
    scope = "playlist-read-private playlist-read-collaborative"
    url = (
        "https://accounts.spotify.com/authorize?"
        f"client_id={CLIENT_ID}&response_type=code&redirect_uri={urllib.parse.quote(REDIRECT_URI)}&scope={scope}"
    )
    return RedirectResponse(url)

@app.get("/callback")
def callback(code: str):
    res = requests.post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if res.status_code != 200:
        raise HTTPException(status_code=400, detail="OAuth failed")
    access_token = res.json().get("access_token")
    return RedirectResponse(f"{FRONTEND_URI}?access_token={access_token}")

@app.get("/playlists")
def get_playlists(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get("https://api.spotify.com/v1/me/playlists", headers=headers)
    return res.json()

@app.get("/tracks")
def get_tracks(token: str, playlist_id: str):
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks", headers=headers)
    return res.json()