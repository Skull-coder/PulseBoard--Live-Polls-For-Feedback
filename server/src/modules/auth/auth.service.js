import ApiError from "../../common/utils/api.error.js";
import User from "./auth.model.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  verifyAccessToken,
  generateTokenPair,
} from "../../common/utils/jwt.utils.js";
import { sendVerificationEmail } from "../../common/config/mail.js";
import { redis } from "../../common/utils/redis-connection.js";
import mongoose from "mongoose";
import { verifyGoogleToken } from "../../common/utils/google.utility.js";

const hashed = async (string) => await bcrypt.hash(string, 10);

export const register = async ({ username, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("User already exists");

  const {
    rawToken: rawVerificationToken,
    hashedToken: hashedVerificationToken,
  } = generateTokenPair();

  const user = await User.create({
    username,
    email,
    password,
    isVerified: false,
  });

  await redis.set(
    `verify:${hashedVerificationToken}`,
    user._id.toString(),
    "EX",
    60 * 5,
  );

  await sendVerificationEmail(email, rawVerificationToken);

  return {
    username: user.username,
    email: user.email,
    message: "Verification mail send",
  };
};

export const verifyEmail = async (rawToken) => {
  if (!rawToken || typeof rawToken !== "string") {
    throw ApiError.badRequest("Invalid token");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const userId = await redis.get(`verify:${hashedToken}`);

  if (!userId) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw ApiError.badRequest("Invalid userId");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  if (user.isVerified) {
    return {
      username: user.username,
      email: user.email,
      message: "Already verified",
    };
  }

  user.isVerified = true;

  await redis.del(`verify:${hashedToken}`);

  await user.save();

  return {
    username: user.username,
    email: user.email,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.unauthorized("Invalid details");

  if (user.authProvider === "google") {
    throw ApiError.unauthorized("Use Google login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw ApiError.unauthorized("Invalid details");
  }

  if (!user.isVerified) throw ApiError.unauthorized("Email is not verified");

  const accessToken = generateAccessToken(user);
  const { rawToken: refreshToken, hashedToken: hashedRefreshToken } =
    generateTokenPair();

  await redis.set(
    `rt:${hashedRefreshToken}`,
    user._id.toString(),
    "EX",
    60 * 60 * 24 * 7,
  );

  return {
    username: user.username,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

export const googleLogin = async (idToken) => {
  if (!idToken) {
    throw ApiError.badRequest("Google token missing");
  }

  const payload = await verifyGoogleToken(idToken);

  const { sub: googleId, email, name, email_verified } = payload;

  if (!email_verified) {
    throw ApiError.unauthorized("Google email not verified");
  }

  // 🔍 Find existing user
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (!user) {
    // ✅ CREATE USER
    user = await User.create({
      username: name || email.split("@")[0],
      email,
      googleId,
      authProvider: "google",
      isVerified: true,
    });
  } else {
    // 🔗 LINK ACCOUNT (if previously local)
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
      user.isVerified = true;
      await user.save();
    }
  }

  // 🎫 Issue tokens (same as your login)
  const accessToken = generateAccessToken(user);
  const { rawToken: refreshToken, hashedToken } = generateTokenPair();

  await redis.set(
    `rt:${hashedToken}`,
    user._id.toString(),
    "EX",
    60 * 60 * 24 * 7,
  );

  return {
    username: user.username,
    email: user.email,
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken || typeof refreshToken !== "string") {
    throw ApiError.badRequest("Invalid refresh token");
  }

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const userId = await redis.get(`rt:${hashedRefreshToken}`);
  if (!userId) throw ApiError.unauthorized("Invalid or expired refresh token");

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw ApiError.badRequest("Invalid userId");
  }

  const user = await User.findById(userId);
  if (!user) throw ApiError.notfound("User not found");

  await redis.del(`rt:${hashedRefreshToken}`);
  const newAccessToken = generateAccessToken(user);

  const { rawToken: newRefreshToken, hashedToken: newHashedToken } =
    generateTokenPair();

  await redis.set(
    `rt:${newHashedToken}`,
    user._id.toString(),
    "EX",
    60 * 60 * 24 * 7,
  );

  return {
    username: user.username,
    email: user.email,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw ApiError.notfound("User not found");

  return {
    username: user.username,
    email: user.email,
  };
};

export const logout = async (refreshToken, accessToken) => {
  // 1. Delete the Refresh Token (Your existing code)
  const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await redis.del(`rt:${hashed}`);

  // 2. Blacklist the Access Token
  if (accessToken) {
    // Decode the token to read its expiration ('exp') claim\
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (err) {
      throw ApiError.unauthorized("Invalid access token");
    }

    if (decoded && decoded.exp) {
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const timeRemaining = decoded.exp - currentTimeInSeconds;

      // If the token hasn't expired naturally yet, add it to the Redis blacklist
      if (timeRemaining > 0) {
        // We set the Redis TTL to match the exact moment the token naturally expires
        await redis.set(`bl:${accessToken}`, "revoked", "EX", timeRemaining);
      }
    }
  }

  return { message: "Logged out successfully" };
};
