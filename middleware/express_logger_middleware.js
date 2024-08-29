const winston = require("winston");
const expressWinston = require("express-winston");

const expressWinstonLogger = expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  })

