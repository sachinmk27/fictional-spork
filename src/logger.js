import winston from "winston";
import path from "path";

const { combine, timestamp, json, printf, prettyPrint } = winston.format;

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp(),
    json(),
    prettyPrint(
      (info) => `[${info.timestamp}] ${info.level}: ${JSON.stringify(info)}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(import.meta.dirname, "./../logs/access.log"),
    }),
    new winston.transports.File({
      filename: path.join(import.meta.dirname, "./../logs/error.log"),
      level: "error",
    }),
  ],
});

export default logger;
