const express = require("express");
const router = express.Router();
const User = require("../models/userModel"); // Import the User model
const { protect } = require("../utils/auth"); // Middleware to protect the route

// Change Password API
/**
 * @swagger
 * /user/changePassword:
 *   put:
 *     summary: Change user password
 *     description: Allows the user to change their password by providing the current password and a new password.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password of the user
 *               newPassword:
 *                 type: string
 *                 description: The new password the user wants to set
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or current password is incorrect
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Server error
 */
router.put("/changePassword", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if both currentPassword and newPassword are provided
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords." });
    }

    // Find the user by the authenticated user ID
    const user = await User.findById(req.user.id).select("+password"); // +password is used to include the password field in the query
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the provided current password is correct
    const isCorrectPassword = await user.correctPassword(currentPassword, user.password);
    if (!isCorrectPassword) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Update the password
    user.password = newPassword;
    user.passwordChangedAt = Date.now(); // Set the time when the password was changed

    // Save the updated user
    await user.save();

    // Send response back to the client
    res.status(200).json({
      message: "Password changed successfully.",
      user: { name: user.name, email: user.email }, // You can send back user details if necessary
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
