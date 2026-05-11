import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api.response.js";
import ApiError from "../../common/utils/api.error.js";

export const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    ApiResponse.created(res, "User registered successfully", user);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    ApiResponse.ok(res, "Logged in successfully", user);
  } catch (err) {
    next(err);
  }
};

export const verify = async (req, res, next) => {
  try {
    // Changed: Token now comes from request body, not URL
    const rawToken = req.body.verificationToken;
    if (!rawToken)
      throw ApiError.badRequest(
        "Verification token is required in request body",
      );

    const user = await authService.verifyEmail(rawToken);
    ApiResponse.ok(res, "Email verified successfully", user);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    // Security: Validate refreshToken is provided in body
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      throw ApiError.badRequest("Refresh token is required");
    }

    const user = await authService.refresh(refreshToken);
    ApiResponse.ok(res, "Token refreshed successfully", user);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const id = req.userId;
    const user = await authService.getMe(id);
    ApiResponse.ok(res, "User details retrieved successfully", user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    const authHeader = req.headers.authorization;

    if (!refreshToken) {
      throw ApiError.badRequest("Refresh token is required");
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Access token required for full logout");
    }

    const accessToken = authHeader.split(" ")[1];

    const result = await authService.logout(refreshToken, accessToken);

    ApiResponse.ok(res, "Logged out successfully", result);
  } catch (error) {
    next(error);
  }
};

export const googleAuthController = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const data = await authService.googleLogin(idToken);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
