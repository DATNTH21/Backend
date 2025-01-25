const nodemailer = require("nodemailer");

class EmailHelper {
  static async sendEmail(emailAddress, otpPasscode) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: false,
    });

    const otpMessage = `
            <p>Thank you for registering an account on Wendiago Movie Application. Your OTP code is:</p>
            <h2>${otpPasscode}</h2>
            <p>Please enter this code to verify your email address.</p>
            <strong>Note: The One-Time Password (OTP) is valid for 5 minutes.</strong>
        `;
    const info = await transporter.sendMail({
      from: "My AI Assistant", // sender address
      to: emailAddress,
      subject: "[Wendiago Movie] Verify Email", // Subject line
      text: `Your OTP code is: ${otpPasscode}`, // plain text body
      html: otpMessage, // html body
    });
    if (info.accepted.length > 0) {
      return info;
    } else {
      console.log("Failed to send OTP email.");
      return null;
    }
  }

  static async sendResetPasswordEmail(emailAddress, otpPasscode) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: false,
    });

    const otpMessage = `
            <p>You have requested to reset your password on Wendiago Movie. Your OTP code is:</p>
            <h2>${otpPasscode}</h2>
            <p>Please enter this code to reset your password.</p>
            <strong>Note: The One-Time Password (OTP) is valid for 5 minutes.</strong>
        `;
    const info = await transporter.sendMail({
      to: emailAddress,
      subject: "[Wendiago Movie] Verify Email", // Subject line
      text: `Your OTP code is: ${otpPasscode}`, // plain text body
      html: otpMessage, // html body
    });
    if (info.accepted.length > 0) {
      return info;
    } else {
      console.log("Failed to send OTP email.");
      return null;
    }
  }
}

module.exports = EmailHelper;
