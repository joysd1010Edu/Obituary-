const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const FuneralHome = require("../models/FuneralHome");
const PendingRegistration = require("../models/PendingRegistration");
const PasswordResetToken = require("../models/PasswordResetToken");
const {
  createAccessToken,
  createRefreshToken,
  verifyToken,
  createOtpCode,
} = require("../utils/jwtUtils");
const { sendMail } = require("../config/mailer");
const { uploadBuffer } = require("../config/cloudinary");

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const LOCAL_FRONTEND_URL = "http://localhost:3000";
const PRODUCTION_FRONTEND_URL = "https://orbelofy.com";
const TRUSTED_FRONTEND_ORIGINS = new Set([
  "https://orbelofy.com",
  "https://www.orbelofy.com",
  "http://orbelofy.com",
  "http://www.orbelofy.com",
  "http://localhost:3000",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ========= Email normalizer==========
function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || "").trim());
}

function normalizeBaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/\/$/, "");
}

function getFrontendBaseUrl(req) {
  const requestOrigin = normalizeBaseUrl(req.get("origin"));
  if (TRUSTED_FRONTEND_ORIGINS.has(requestOrigin)) {
    return requestOrigin.replace(/^http:\/\/(www\.)?orbelofy\.com$/i, "https://$1orbelofy.com");
  }

  const requestHost = normalizeBaseUrl(
    req.get("x-forwarded-host") || req.get("host"),
  ).toLowerCase();
  if (requestHost.includes("orbelofy.com")) {
    return PRODUCTION_FRONTEND_URL;
  }

  return normalizeBaseUrl(process.env.FRONTEND_URL) || LOCAL_FRONTEND_URL;
}

// ============= Access & Refresh Token builder =============
function buildTokenPair(user) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload),
  };
}

// ================= Common function to respond user with tokens =================
async function respondWithAuthTokens(res, user) {
  const tokens = buildTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  let funeralHome = null;
  try {
    funeralHome = await FuneralHome.findOne({ userId: user._id });
  } catch (error) {
    console.error("Failed to fetch funeral home in auth:", error);
  }

  return res.status(200).json({
    message: "Authentication successful",
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePhotoUrl: user.profilePhotoUrl,
      tokenApplied: user.tokenApplied,
      tokenApproveStatus: user.tokenApproveStatus,
      token: user.token,
      funeralHome: funeralHome || null,
    },
  });
}

// ================= Registration =================
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, profilePhotoUrl, address } =
      req.body;
    const normalizedEmail = normalizeEmail(email);
    let uploadedProfilePhotoUrl = profilePhotoUrl || undefined;

    if (!firstName || !lastName || !normalizedEmail || !password || !address) {
      return res
        .status(400)
        .json({ message: "All registration fields are required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (!/[A-Za-z]/.test(String(password)) || !/[0-9]/.test(String(password)) || String(password).length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include letters and numbers",
      });
    }

    let parsedAddress;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        parsedAddress = {};
      }
    } else {
      parsedAddress = address || undefined;
    }

    if (req.file) {
      const profileUpload = await uploadBuffer(req.file.buffer, {
        folder: "obituary/profile-photos",
      });
      uploadedProfilePhotoUrl = profileUpload.secure_url;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const createdUser = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      passwordHash,
      profilePhotoUrl: uploadedProfilePhotoUrl,
      address: parsedAddress,
      role: "user",
    });

    return respondWithAuthTokens(res, createdUser);
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

// ================= Login =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(
      String(password),
      user.passwordHash,
    );
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return respondWithAuthTokens(res, user);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ================= Password Reset phase-1 =================
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({
      userId: user._id,
      email: normalizedEmail,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000),
    });

    const frontendBaseUrl = getFrontendBaseUrl(req);
    const resetUrl = `${frontendBaseUrl}/forgot-password/${user._id}/${rawToken}`;

    await sendMail({
      to: normalizedEmail,
      subject: "Reset your password",
      title: "password reset link",
      bodyIntro:
        "We received a request to reset your Funeral Home password. Use the secure link below to continue.",
      ctaUrl: resetUrl,
      ctaLabel: "Reset Password",
      bodyOutro:
        "If you did not request a password reset, you can safely ignore this email and no changes will be made.",
      notice:
        "If this request was not made by you, no further action is needed.",
    });

    return res
      .status(200)
      .json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error("Request password reset error:", error);
    return res
      .status(500)
      .json({ message: "Failed to request password reset" });
  }
};

// ================= Password Reset phase-2 =================
exports.resetPassword = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ message: "Reset params are required" });
    }

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(String(token))
      .digest("hex");
    const resetRecord = await PasswordResetToken.findOne({ userId, tokenHash });

    if (!resetRecord) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    if (resetRecord.expiresAt.getTime() < Date.now()) {
      await PasswordResetToken.deleteMany({ userId });
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.passwordHash = await bcrypt.hash(String(password), 12);
    user.refreshToken = undefined;
    user.passwordChangedAt = new Date();
    await user.save();
    await PasswordResetToken.deleteMany({ userId });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

// ================= Refresh Expired Token =================
exports.refreshToken = async (req, res) => {
  try {
    const incomingToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!incomingToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = verifyToken(
      incomingToken,
      process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
    );
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== incomingToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const tokens = buildTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePhotoUrl: user.profilePhotoUrl,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res
      .status(401)
      .json({ message: "Refresh token expired or invalid" });
  }
};

exports.test = async (req, res) => {
  return res.status(200).json({ message: "Auth route is working" });
};
