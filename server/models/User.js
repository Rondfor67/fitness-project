const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  phone: String,
  password: String,
});

module.exports = mongoose.model("User", UserSchema);