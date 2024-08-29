const { errorHandler } = require("../helpers/error_handler");
const Admin = require("../schemas/Admin");
const { adminValidation } = require("../validations/admin.validation");

const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const myJwt = require("../services/jwt_service");
const { response } = require("express");

const uuid = require("uuid");
const mail_service = require("../services/mail_service");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).send({ message: "Admin topilmadi" });
    }
    const validPassword = bcrypt.compareSync(password, admin.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Email parol noto'g'ri" });
    }
    const payload = {
      _id: admin._id,
      email: admin.email,
      is_expert: admin.is_expert,
      admin_roles: ["READ", "WRITE"], //DELETE
    };
    const tokens = myJwt.generateTokens(payload);
    admin.token = tokens.refreshToken;
    await admin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    // try {
    //   setTimeout(function(){
    //     throw new Error("uncaughtException example")
    //   })
    // } catch (error) {
    //   console.log(error);
    // }

    new Promise((_, reject) => {
      reject(new Error("unhandledRejection example"));
    });

    res.send({
      message: "User logged in",
      id: admin._id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const addAdmin = async (req, res) => {
  try {
    const { error, value } = adminValidation(req.body);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const fullName = `${value.first_name} ${value.last_name}`;

    const {
      first_name,
      last_name,
      nick_name,
      email,
      phone,
      password,
      info,
      position,
      photo,
      is_expert,
      is_active,
    } = value;

    const admin = await Admin.findOne({
      email: { $regex: email, $options: "i" },
    });

    if (admin) {
      return res.status(400).send({ message: "Bunday Admin email mavjud" });
    }

    const hashedPassword = bcrypt.hashSync(password, 7);

    const activation_link = uuid.v4();

    const newAdmin = await Admin.create({
      first_name,
      last_name,
      full_name: fullName,
      nick_name,
      email,
      phone,
      password: hashedPassword,
      info,
      position,
      photo,
      is_expert,
      is_active,
      activation_link,
    });

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/admin/activate/${activation_link}`
    );

    const payload = {
      _id: newAdmin._id,
      email: newAdmin.email,
      is_expert: newAdmin.is_expert,
    };
    const tokens = myJwt.generateTokens(payload);
    newAdmin.token = tokens.refreshToken;
    await newAdmin.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.send({
      message: "Admin added",
      id: newAdmin._id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const logoutAdmin = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(403).send({ message: "Refresh token topilmadi" });
  }
  const admin = await Admin.findOneAndUpdate(
    { token: refreshToken },
    { token: "" },
    { new: true }
  );
  if (!admin) {
    return res.status(400).send({ message: "Invalid refresh token" });
  }
  res.clearCookie("refreshToken");
  res.send({ reshreshToken: admin.token });
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res
        .status(403)
        .send({ message: "Cookieda Refresh token topilmadi" });
    }
    const [error, decodedRefreshToken] = await to(
      myJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res.status(403).send({ error: error.message });
    }
    const adminFromDB = await Admin.findOne({ token: refreshToken });
    if (!adminFromDB) {
      return res
        .status(403)
        .send({
          message: "Ruxsat etilmagan foydalanuvchi(Refresh token mos emas)",
        });
    }
    const payload = {
      _id: adminFromDB._id,
      email: adminFromDB.email,
      is_expert: adminFromDB.is_expert,
    };
    const tokens = myJwt.generateTokens(payload);
    adminFromDB.token = tokens.refreshToken;
    await adminFromDB.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });
    res.send({
      message: "Refresh Token",
      id: adminFromDB._id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    if (!admins) {
      return res.status(400).send({ message: "Birorta admin topilmadi" });
    }
    res.json({ data: admins });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      nick_name,
      email,
      phone,
      password,
      info,
      position,
      photo_url,
      is_expert,
      is_active,
    } = req.body;
    const admin = await Admin.find({
      email: { $regex: email, $options: "i" },
    });
    console.log(admin, typeof admin);

    if (admin.length > 1) {
      return res.status(400).send({ message: "Bunday Admin email mavjud" });
    }
    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      {
        first_name,
        last_name,
        nick_name,
        email,
        phone,
        password,
        info,
        position,
        photo: photo_url,
        is_expert,
        is_active,
      },
      { new: true }
    );
    res
      .status(200)
      .send({ message: "Admin updated succesfuly", updatedAdmin });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    res
      .status(200)
      .send({ message: "Admin deleted succesfuly", deletedAdmin });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    console.log(req.admin._id);

    if (id !== req.admin._id) {
      return res
        .status(403)
        .send({ message: "Ruxsat etilmagan foydalanuvchi" });
    }
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).send({ message: "Admin mavjud emas" });
    }
    res.send(admin);
  } catch (error) {
    errorHandler(res, error);
  }
};

const adminActivate = async (req, res) => {
  try {
    const link = req.params.link;
    const admin = await Admin.findOne({ activation_link: link });

    if (!admin) {
      return res.status(400).send({ message: "Bunday Admin topilmadi" });
    }
    if (admin.is_active) {
      return res
        .status(400)
        .send({ message: "Bu admin avval faollashtirilgan" });
    }
    admin.is_active = true;
    await admin.save();
    res.send({
      is_active: admin.is_active,
      message: "Admin faollashtirildi",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addAdmin,
  adminLogin,
  logoutAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  refreshToken,
  getAdminById,
  adminActivate,
};
