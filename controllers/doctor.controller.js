const { errorHandler } = require("../helpers/error_handler");
const Doctor = require("../schemas/Doctor");
const { doctorValidation } = require("../validations/doctor.validation");

const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const myJwt = require("../services/jwt_service");
const { response } = require("express");

const uuid = require("uuid");
const mail_service = require("../services/mail_service");

const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).send({ message: "Doctor topilmadi" });
    }
    const validPassword = bcrypt.compareSync(password, doctor.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Email parol noto'g'ri" });
    }
    const payload = {
      _id: doctor._id,
      email: doctor.email,
      is_expert: doctor.is_expert,
      doctor_roles: ["READ", "WRITE"], //DELETE
    };
    const tokens = myJwt.generateTokens(payload);
    doctor.token = tokens.refreshToken;
    await doctor.save();

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
      id: doctor._id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const addDoctor = async (req, res) => {
  try {
    const { error, value } = doctorValidation(req.body);
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
      specialization,
      photo,
      is_expert,
      is_active,
    } = value;

    const doctor = await Doctor.findOne({
      email: { $regex: email, $options: "i" },
    });

    if (doctor) {
      return res.status(400).send({ message: "Bunday Doctor email mavjud" });
    }

    const hashedPassword = bcrypt.hashSync(password, 7);

    const activation_link = uuid.v4();

    const newDoctor = await Doctor.create({
      first_name,
      last_name,
      full_name: fullName,
      nick_name,
      email,
      phone,
      password: hashedPassword,
      info,
      specialization,
      photo,
      is_expert,
      is_active,
      activation_link,
    });

    await mail_service.sendActivationMail(
      email,
      `${config.get("api_url")}:${config.get(
        "port"
      )}/api/doctor/activate/${activation_link}`
    );

    const payload = {
      _id: newDoctor._id,
      email: newDoctor.email,
      is_expert: newDoctor.is_expert,
    };
    const tokens = myJwt.generateTokens(payload);
    newDoctor.token = tokens.refreshToken;
    await newDoctor.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });

    res.send({
      message: "Doctor added",
      id: newDoctor._id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const logoutDoctor = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(403).send({ message: "Refresh token topilmadi" });
  }
  const doctor = await Doctor.findOneAndUpdate(
    { token: refreshToken },
    { token: "" },
    { new: true }
  );
  if (!doctor) {
    return res.status(400).send({ message: "Invalid refresh token" });
  }
  res.clearCookie("refreshToken");
  res.send({ reshreshToken: doctor.token });
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
    const doctorFromDB = await Doctor.findOne({ token: refreshToken });
    if (!doctorFromDB) {
      return res
        .status(403)
        .send({
          message: "Ruxsat etilmagan foydalanuvchi(Refresh token mos emas)",
        });
    }
    const payload = {
      _id: doctorFromDB._id,
      email: doctorFromDB.email,
      is_expert: doctorFromDB.is_expert,
    };
    const tokens = myJwt.generateTokens(payload);
    doctorFromDB.token = tokens.refreshToken;
    await doctorFromDB.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_time_ms"),
    });
    res.send({
      message: "Refresh Token",
      id: doctorFromDB._id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    if (!doctors) {
      return res.status(400).send({ message: "Birorta doctor topilmadi" });
    }
    res.json({ data: doctors });
  } catch (error) {
    errorHandler(res, error);
  }
};

const updateDoctor = async (req, res) => {
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
      specialization,
      photo_url,
      is_expert,
      is_active,
    } = req.body;
    const doctor = await Doctor.find({
      email: { $regex: email, $options: "i" },
    });
    console.log(doctor, typeof doctor);

    if (doctor.length > 1) {
      return res.status(400).send({ message: "Bunday Doctor email mavjud" });
    }
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      {
        first_name,
        last_name,
        nick_name,
        email,
        phone,
        password,
        info,
        specialization,
        photo: photo_url,
        is_expert,
        is_active,
      },
      { new: true }
    );
    res
      .status(200)
      .send({ message: "Doctor updated succesfuly", updatedDoctor });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    res
      .status(200)
      .send({ message: "Doctor deleted succesfuly", deletedDoctor });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getDoctorById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    console.log(req.doctor._id);

    if (id !== req.doctor._id) {
      return res
        .status(403)
        .send({ message: "Ruxsat etilmagan foydalanuvchi" });
    }
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).send({ message: "Doctor mavjud emas" });
    }
    res.send(doctor);
  } catch (error) {
    errorHandler(res, error);
  }
};

const doctorActivate = async (req, res) => {
  try {
    const link = req.params.link;
    const doctor = await Doctor.findOne({ activation_link: link });

    if (!doctor) {
      return res.status(400).send({ message: "Bunday Doctor topilmadi" });
    }
    if (doctor.is_active) {
      return res
        .status(400)
        .send({ message: "Bu doctor avval faollashtirilgan" });
    }
    doctor.is_active = true;
    await doctor.save();    
    res.send({
      is_active: doctor.is_active,
      message: "Doctor faollashtirildi",
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  addDoctor,
  doctorLogin,
  logoutDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  refreshToken,
  getDoctorById,
  doctorActivate,
};
