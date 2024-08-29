const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    full_name: { type: String }, // Avtomatik hosil qilinadi
    nick_name: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    info: { type: String },
    position: { type: String },
    photo: { type: String },
    is_expert: { type: Boolean, default: false },
    is_active: { type: Boolean, default: false },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
    token: { type: String },
    activation_link: String,
  },
  {
    versionKey: false,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
