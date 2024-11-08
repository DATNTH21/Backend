const mongoose = require("mongoose");

// Defining Schema
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  blacklisted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: "5d" },
});

// Model
const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
