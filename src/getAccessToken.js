import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import logger from "./logger.js";
import { InternalServerError } from "./errors.js";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

let cachedAccessToken = null;
let tokenExpirationTime = null;
const TOKEN_EXPIRATION_BUFFER_MS = 60 * 1000; // 1 minute

export default async function getAccessToken() {
  try {
    const now = Date.now();
    if (cachedAccessToken && tokenExpirationTime > now) {
      logger.info("Using cached access token");
      return cachedAccessToken;
    }
    logger.info("Fetching new access token");
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      logger.error("Missing Spotify client ID or secret");
      throw new InternalServerError("Missing Spotify client ID or secret");
    }
    if (!process.env.SPOTIFY_REFRESH_TOKEN) {
      logger.error("Missing Spotify refresh token");
      throw new InternalServerError("Missing Spotify refresh token");
    }
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
      }),
    });

    const data = await response.json();
    cachedAccessToken = data.access_token;
    tokenExpirationTime =
      Date.now() + data.expires_in * 1000 - TOKEN_EXPIRATION_BUFFER_MS; // 1 minute buffer
    return data.access_token;
  } catch (error) {
    logger.error("Error fetching access token:", error);
    throw new InternalServerError();
  }
}
