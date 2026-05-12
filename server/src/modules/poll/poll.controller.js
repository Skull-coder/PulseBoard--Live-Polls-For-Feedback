import ApiResponse from "../../common/utils/api.response.js";
import * as service from "./poll.service.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";

export const create = async (req, res, next) => {
  try {
    const userId = req.userId;
    const body = req.body;
    const poll = await service.create(userId, body);

    ApiResponse.created(res, "Poll is published SuccessFully", poll);
  } catch (error) {
    next(error);
  }
};

export const publish = async (req, res, next) => {
  try {
    const userId = req.userId;
    const pollId = req.params.pollId;

    const poll = await service.publish(userId, pollId);

    ApiResponse.ok(res, "Published", poll);
  } catch (error) {
    next(error);
  }
};

export const getPoll = async (req, res, next) => {
  try {
    const pollId = req.params.pollId;

    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      try {
        const decoded = verifyAccessToken(accessToken);
        userId = decoded.id;
      } catch (error) {}
    }

    const poll = await service.getPoll(pollId, userId);

    if (!poll.isPublished) {
      return ApiResponse.ok(res, "Not published yet", poll);
    }

    ApiResponse.ok(res, "POLL:", poll);
  } catch (error) {
    next(error);
  }
};

export const myPolls = async (req, res, next) => {
  try {
    const userId = req.userId;

    const polls = await service.myPolls(userId);

    ApiResponse.ok(res, "Your Polls: ", polls);
  } catch (error) {
    next(error);
  }
};

export const deletePoll = async(req, res, next)=>{
  try {
    const userId = req.userId;
    const pollId = req.params.pollId;

    const poll = await service.deletePoll(userId, pollId);

    ApiResponse.ok(res, "Deleted Poll:", poll);
  } catch (error) {
    next(error)
  }
}