const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const verifyRefreshToken = require("../utils/verifyRefreshToken");
const {
  generateAccessToken,
  generateAllTokens,
} = require("../utils/generateTokens");
const Email = require("../utils/email");
const setTokenCookies = require("../utils/setTokenCookies");

const handleTokenExpiredError = async (req, res, next) => {
  try {
    const { tokenDetails } = await verifyRefreshToken(req.cookies.refreshToken);
    const accessToken = generateAccessToken(tokenDetails._id); // renew access token
    console.log(accessToken);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 1000),
      // secure: true,
    });

    res.status(200).json({
      status: "success",
      message: "Authenticated",
    });
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};

const grantUserAccessToApp = async (res, user) => {
  const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
    await generateAllTokens(user);
  setTokenCookies(res, accessToken, refreshToken, refreshTokenExp);
};

exports.registerUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
  });

  const confirmationToken = newUser.createConfirmationToken();
  await newUser.save({ validateBeforeSave: false });

  try {
    const url = `${req.protocol}://${req.get(
      "host"
    )}/confirmation/${confirmationToken}`;
    console.log(url);

    // <a href="${url}">${url}</a>
    const htmlContent = `
    <h1>Hello ${newUser.email.split("@")[0]},</h1>
    <p>You are just one step away from your WiseTest registration before you can start testing.</p>
    <p>Click on the button below to verify your email & activate your WiseTest account..</p>
    <a href="${url}">Activate Account</a>
    `;
    await new Email(newUser).send(htmlContent, "WiseTest Account Activation");

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.error(err);
    newUser.confirmationToken = undefined;
    await newUser.save({ validateBeforeSave: false });
    res.status(500).json({
      status: "error",
      message: "Error sending email!",
    });
  }
});

exports.confirmSignup = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    confirmationToken: hashedToken,
  });

  if (!user) {
    throw new Error("Token is invalid");
  }

  // user.confirmationToken = undefined;
  user.isVerified = true;
  await user.save();

  await grantUserAccessToApp(res, user);
  res.redirect("http://localhost:3000/all-project");
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body; // Get the email and password from the request body

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  await grantUserAccessToApp(res, user);
  res.status(200).json({
    status: "success",
    message: "Login successfully",
  });
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (!req.cookies.accessToken || !req.cookies.refreshToken) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 1) Verify token
    const accessTokenPayload = jwt.verify(
      req.cookies.accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );

    // 2) Check if user still exists
    const currentUser = await User.findById(accessTokenPayload._id);
    if (!currentUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // 3) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(accessTokenPayload.iat)) {
      throw new Error("User recently changed password! Please log in again.");
    }

    return res.status(200).json({
      message: "Authenticated",
    });
  } catch (error) {
    console.log(error.name, "💥");
    if (error.name === "TokenExpiredError") {
      return handleTokenExpiredError(req, res, next);
    }
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};

// expired token
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzJjM2FhNzQ1ZjRkYTA3ZDA4NTM2MGIiLCJleHAiOjE3MzA5Njg3NjIsImlhdCI6MTczMDk2ODc0N30.neo_8xJvAYVf5DeUYqsetpmjnUEqqfr6pST78kcRIGM
