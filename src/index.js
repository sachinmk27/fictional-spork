import express from "express";
import dotenv from "dotenv";
dotenv.config();
import getAccessToken from "./getAccessToken.js";
import {
  getNowPlaying,
  getTopTracks,
  pausePlayback,
  resumePlayback,
} from "./spotify.service.js";
import logger from "./logger.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 3000;

app.use(express.json());

router.get("/", async (req, res, next) => {
  try {
    const token = await getAccessToken();

    const topTracks = await getTopTracks(token);
    const nowPlaying = await getNowPlaying(token);

    res.json({
      topTracks,
      nowPlaying,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/pause", async (req, res, next) => {
  try {
    const token = await getAccessToken();
    const response = await pausePlayback(token);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/play", async (req, res, next) => {
  try {
    const { track_uri } = req.body;
    const token = await getAccessToken();
    const response = await resumePlayback(token, track_uri);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

app.use("/spotify", router);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
