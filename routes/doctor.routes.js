const express = require("express");
const {
  addDoctor,
  doctorLogin,
  logoutDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  refreshToken,
  deleteDoctor,
  doctorActivate,
} = require("../controllers/doctor.controller");

const router = express.Router();
const doctorPolice = require("../middleware/doctor_police");
const doctorRolesPolice = require("../middleware/doctor_roles_police");

router.get("/", doctorPolice, getDoctors);
router.get("/:id", doctorRolesPolice(["READ"]), getDoctorById);
router.get("/activate/:link", doctorActivate);
router.post("/", addDoctor);
router.post("/login", doctorLogin);
router.post("/logout", logoutDoctor);
router.post("/refresh", refreshToken);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

module.exports = router;
