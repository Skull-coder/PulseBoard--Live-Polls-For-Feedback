import ApiError from "../../common/utils/api.error.js";
import Poll from "./poll.model.js";
import Response from "../response/response.model.js";
import mongoose from "mongoose";

// =========================
// CREATE POLL
// =========================

export const create = async (
  userId,

  { questions, responseMode, expiryDuration },
) => {
  const expiryMap = {
    "5_MIN": 5,
    "10_MIN": 10,
    "15_MIN": 15,
  };

  const minutes = expiryMap[expiryDuration];

  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

  // format questions/options

  const formattedQuestions = questions.map((question) => ({
    question: question.question,

    required: question.required,

    options: question.options.map((option) => ({
      text: option,
    })),
  }));

  const poll = await Poll.create({
    questions: formattedQuestions,
    createdBy: userId,
    responseMode,
    expiresAt,
  });

  return poll;
};

// =========================
// Publish POLL
// =========================

export const publish = async (userId, pollId) => {
  if (!mongoose.Types.ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll id");
  }

  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw ApiError.notfound("Poll not found");
  }

  if (!poll.createdBy.equals(userId)) {
    throw ApiError.badRequest("Invalid User");
  }

  poll.isPublished = true;
  await poll.save();

  return poll;
};

// =========================
// GET POLL
// =========================

export const getPoll = async (pollId, userId = null) => {
  if (!mongoose.Types.ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll id");
  }

  const poll = await Poll.findById(pollId);

  if (!poll) {
    throw ApiError.notfound("Poll not found");
  }

  const isExpired = poll.expiresAt < new Date();

  const isCreator = userId && poll.createdBy.toString() === userId.toString();

  // =========================
  // ACTIVE POLL
  // =========================

  if (!isExpired) {
    return {
      isExpired: false,
      isPublished: poll.isPublished,
      _id: poll._id,

      questions: poll.questions,

      expiresAt: poll.expiresAt,
      responseMode: poll.responseMode
    };
  }

  // =========================
  // WAITING TO PUBLISH RESULTS
  // =========================

  if (isExpired && !poll.isPublished && !isCreator) {
    return {
      isExpired: true,
      isPublished: false,
      message: "Results are not published yet",
      expiresAt: poll.expiresAt, // <--- ADDED so the frontend knows it's expired
    };
  }

  // =========================
  // FINAL RESULTS
  // =========================

  // 1. Get total responses
  const totalResponses = await Response.countDocuments({ pollId });

  // 2. Let MongoDB aggregate the votes natively
  const voteCounts = await Response.aggregate([
    { $match: { pollId: poll._id } },
    { $unwind: "$answers" },
    { $group: { _id: "$answers.selectedOptionId", votes: { $sum: 1 } } },
  ]);

  // 3. Convert array to a fast lookup map: { "optionId": voteCount }
  const voteMap = {};
  for (const v of voteCounts) {
    voteMap[v._id.toString()] = v.votes;
  }

  // 4. Map the results back to the original poll questions
  const results = poll.questions.map((question) => ({
    questionId: question._id,
    question: question.question,
    required: question.required,
    options: question.options.map((option) => ({
      optionId: option._id,
      text: option.text,
      votes: voteMap[option._id.toString()] || 0,
    })),
  }));

  return {
    isExpired: true,
    isPublished: poll.isPublished,
    _id: poll._id,
    totalResponses,
    questions: poll.questions,       
    expiresAt: poll.expiresAt,       
    responseMode: poll.responseMode,
    results,
  };
};

// =========================
// MY POLLS
// =========================

export const myPolls = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw ApiError.badRequest("Invalid user id");
  }

  const polls = await Poll.find({
    createdBy: userId,
  });

  return polls;
};
