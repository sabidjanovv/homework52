const express = require("express");
const {
  addAdmin,
  adminLogin,
  logoutAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  refreshToken,
  deleteAdmin,
  adminActivate,
} = require("../controllers/admin.controller");

const router = express.Router();
const adminPolice = require("../middleware/admin_police")
const adminRolesPolice = require("../middleware/admin_roles_police")


router.get("/", adminPolice, getAdmins);
router.get("/:id", adminRolesPolice(["READ"]), getAdminById);
router.get("/activate/:link", adminActivate);
router.post("/", addAdmin);
router.post("/login", adminLogin);
router.post("/logout", logoutAdmin);
router.post("/refresh", refreshToken);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);



module.exports = router;
