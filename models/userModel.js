const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    name: { type: String, default: "" },
    image: { type: String, default: "/avatar.jpeg" },
    isVerified: { type: Boolean, default: false },
    type_login: {
      type: String,
      default: "local",
      enum: ["local", "google"],
    },
    google_id: { type: String, default: "" },
    facebook_id: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "User",
  }
);

//Export the model
module.exports = mongoose.model("User", userSchema);
