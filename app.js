// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const morgan = require("morgan");
// const config = require("config");

// const indexRoutes = require("./routes/index.routes");

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());
// app.use(morgan("dev"));

// // Routes
// app.use("/api", indexRoutes);

// // MongoDB connection
// const startServer = async () => {
//   try {
//     await mongoose.connect(config.get("dbAtlasUri"), {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Connected to MongoDB");

//     const PORT = config.get("port") || 5000;
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Error connecting to MongoDB", error);
//     process.exit(1);
//   }
// };

// startServer();

// module.exports = app;





const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cookieParser = require("cookie-parser");
const winston = require("winston");
const expressWinston = require("express-winston");
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const logger = require("./services/logger_service");
// console.log(process.env.NODE_ENV);
// console.log(process.env.secret);

// console.log(config.get("secret"));

logger.log("info", "Oddiy Logger");
logger.error("Error Logger");
logger.debug("Debug Logger");
logger.warn("Warn Logger");
logger.info("Info Logger");
// console.trace("Trace Logger");
// console.table([1,2,3]);
// console.table([
//   ["Shokir", 23],
//   ["Nodir", 22],
//   ["Sarvar", 18]
// ]);

const PORT = config.get("port");
const mainRoute = require("./routes/index.routes");
const error_handling_middleware = require("./middleware/error_handling_middleware");

// process.on("uncaughtException", (exception) => {
//   console.log("uncaughtException", exception);

// });

// process.on("unhandledRejection", (reject) => {
//   console.log("UnhandledRejection", reject);
// });

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  })
);

app.use("/api", mainRoute);

app.use(error_handling_middleware); // error handling eng oxirida bolish kere

async function start() {
  try {
    await mongoose.connect(config.get("dbAtlasUri"));
    app.listen(PORT, () => {
      console.log(`Server started at: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
