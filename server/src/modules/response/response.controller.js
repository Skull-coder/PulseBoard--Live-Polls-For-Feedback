import ApiResponse from "../../common/utils/api.response.js";
import * as service from "./response.service.js";
import ApiError from "../../common/utils/api.error.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";
import User from "../auth/auth.model.js";
import Poll from "../poll/poll.model.js";

export const submit = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const { answers, fingerprint } = req.body;

    const authHeader = req.headers.authorization;

    const response = await service.submit({
      pollId,

      answers,

      fingerprint,

      authHeader,
    });

    return ApiResponse.accepted(
      res,
      "Response submitted successfully",
      response,
    );
  } catch (error) {
    next(error);
  }
};
