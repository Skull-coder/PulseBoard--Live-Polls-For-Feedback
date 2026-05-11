import ApiError from "../../common/utils/api.error.js";

import Response from "./response.model.js";

import Poll from "../poll/poll.model.js";

import mongoose from "mongoose";

import crypto from "crypto";

import { verifyAccessToken } from "../../common/utils/jwt.utils.js";

import { redis } from "../../common/utils/redis-connection.js";
import { publishPollUpdate } from "../../sockets/socket.js";

export const submit = async ({
  pollId,

  answers,

  fingerprint,

  authHeader,
}) => {
  // -------------------------
  // validate poll id
  // -------------------------

  if (!mongoose.Types.ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll id");
  }

  // -------------------------
  // fetch poll
  // -------------------------

  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw ApiError.notfound("Poll not found");
  }

  // -------------------------
  // check expiry
  // -------------------------

  if (poll.expiresAt < new Date()) {
    throw ApiError.badRequest("Poll has expired");
  }

  // -------------------------
  // validate each answer
  // -------------------------

  for (const answer of answers) {
    const { questionId, selectedOptionId } = answer;

    // validate ids

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      throw ApiError.badRequest("Invalid question id");
    }

    if (!mongoose.Types.ObjectId.isValid(selectedOptionId)) {
      throw ApiError.badRequest("Invalid option id");
    }

    // find question

    const question = poll.questions.find(
      (q) => q._id.toString() === questionId,
    );

    if (!question) {
      throw ApiError.badRequest("Question not found");
    }

    // validate option belongs to question

    const optionExists = question.options.some(
      (option) => option._id.toString() === selectedOptionId,
    );

    if (!optionExists) {
      throw ApiError.badRequest("Invalid option selected");
    }
  }

  // -------------------------
  // validate required question
  // -------------------------

  const requiredQuestions = poll.questions.filter(
    (question) => question.required,
  );

  for (const question of requiredQuestions) {
    const answered = answers.some(
      (answer) => answer.questionId === question._id.toString(),
    );

    if (!answered) {
      throw ApiError.badRequest(`${question.question} is required`);
    }
  }

  // -------------------------
  // common expiry
  // -------------------------

  const expirySeconds = Math.max(
    1,
    Math.floor((poll.expiresAt.getTime() - Date.now()) / 1000),
  );

  let responsePayload;

  let redisKey;

  // =========================
  // AUTHENTICATED FLOW
  // =========================

  if (poll.responseMode === "AUTHENTICATED") {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication required");
    }

    const accessToken = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = verifyAccessToken(accessToken);
    } catch {
      throw ApiError.unauthorized("Invalid access token");
    }

    const userId = decoded.id;

    redisKey = `poll:${pollId}:user:${userId}`;

    // atomic redis duplicate prevention

    const redisResult = await redis.set(
      redisKey,
      "1",
      "EX",
      expirySeconds,
      "NX",
    );

    if (redisResult === null) {
      throw ApiError.conflict("You already voted");
    }

    // mongodb fallback check

    const existingResponse = await Response.findOne({
      pollId,

      userId,
    });

    if (existingResponse) {
      await redis.del(redisKey);
      throw ApiError.conflict("You already voted");
    }

    responsePayload = {
      pollId,

      userId,

      answers,
    };
  }

  // =========================
  // ANONYMOUS FLOW
  // =========================
  else {
    if (!fingerprint) {
      throw ApiError.badRequest("Fingerprint required");
    }

    const fingerprintHash = crypto
      .createHash("sha256")
      .update(fingerprint)
      .digest("hex");

    redisKey = `poll:${pollId}:fp:${fingerprintHash}`;

    // atomic redis duplicate prevention

    const redisResult = await redis.set(
      redisKey,
      "1",
      "EX",
      expirySeconds,
      "NX",
    );

    if (redisResult === null) {
      throw ApiError.conflict("You already voted");
    }

    // mongodb fallback check

    const existingResponse = await Response.findOne({
      pollId,

      fingerprintHash,
    });

    if (existingResponse) {
      await redis.del(redisKey);
      throw ApiError.conflict("You already voted");
    }

    responsePayload = {
      pollId,

      answers,

      fingerprintHash,
    };
  }

  // -------------------------
  // create response
  // -------------------------

  const response = await Response.create(responsePayload);

  // -------------------------
  // increment redis analytics
  // -------------------------

  const totalResponses = await redis.incr(`poll:${pollId}:responses`);

  // -------------------------
  // increment mongodb analytics
  // -------------------------

  await Poll.findByIdAndUpdate(pollId, {
    $inc: {
      totalResponses: 1,
    },
  });

  // -------------------------
  // Update Via Redis
  // -------------------------

  for (const answer of answers) {
    await redis.hincrby(
      `poll:${pollId}:question:${answer.questionId}:options`,

      answer.selectedOptionId,

      1,
    );
  }

  const analytics = {};

  for (const question of poll.questions) {
    const counts = await redis.hgetall(
      `poll:${pollId}:question:${question._id}:options`,
    );

    analytics[question._id.toString()] = counts;
  }

  await publishPollUpdate({
    pollId,

    creatorId: poll.createdBy.toString(),

    totalResponses,

    analytics,
  });

  return response;
};
