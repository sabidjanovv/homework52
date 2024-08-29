const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, colorize, simple } = format; // Import colorize and simple
require("winston-mongodb");
const config = require("config");

const myFormat = printf(({ message, label, timestamp }) => {
  return `${timestamp} [${label}] : ${message}`;
});

const logger = createLogger({
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.Console({
      level: "debug",
      format: combine(colorize(), simple()),
    }),
    new transports.File({
      filename: "./log/error.log",
      level: "error",
      handleExceptions: true,
      handleRejections: true,
    }),
    new transports.File({ filename: "./log/combine.log", level: "debug" }),
    new transports.MongoDB({
      db: config.get("dbAtlasUri"),
      options: { useUnifiedTopology: true },
    }),
  ],
});

logger.exitOnError = false;

// // Handle exceptions and rejections
// logger.exceptions.handle(
//   new transports.File({ filename: "./log/exceptions.log" })
// );
// logger.rejections.handle(
//   new transports.File({ filename: "./log/rejections.log" })
// ); // Correct filename spelling

module.exports = logger;
