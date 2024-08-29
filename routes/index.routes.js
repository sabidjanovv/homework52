const express = require("express");

const router = express.Router();

const doctorRoutes = require("./doctor.routes");
const adminRoutes = require("./admin.routes");

router.use("/doctor", doctorRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
