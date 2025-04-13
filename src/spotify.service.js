import fetch from "node-fetch";
import { ForbiddenError, InternalServerError } from "./errors.js";
import logger from "./logger.js";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const getTopTracks = async (token) => {
  try {
    const response = await fetch(`${SPOTIFY_API_URL}/me/top/tracks?limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.status === 200) {
      return data.items;
    } else {
      throw data.error;
    }
  } catch (error) {
    logger.error("Error fetching top tracks:", error);
    throw new InternalServerError("Failed to fetch top tracks");
  }
};

export const getNowPlaying = async (token) => {
  try {
    const response = await fetch(
      `${SPOTIFY_API_URL}/me/player/currently-playing?market=IN`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    if (response.status === 204) {
      return null; // No track is currently playing
    } else if (response.status === 200) {
      return data;
    } else {
      throw data.error;
    }
  } catch (error) {
    logger.error("Error fetching now playing:", error);
    throw new InternalServerError("Failed to fetch now playing");
  }
};

export const pausePlayback = async (token) => {
  const response = await fetch("https://api.spotify.com/v1/me/player/pause", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 204) {
    return { message: "Playback paused" };
  } else {
    const error = await response.json();
    logger.error("Error pausing playback:", error);
    throw new InternalServerError("Failed to pause playback");
  }
};

export const resumePlayback = async (token, trackUri) => {
  const response = await fetch("https://api.spotify.com/v1/me/player/play", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
  if (response.status === 204) {
    return { message: "Playback resumed" };
  } else {
    const error = await response.json();
    logger.error("Error pausing playback:", error);
    throw new InternalServerError("Failed to pause playback");
  }
};
