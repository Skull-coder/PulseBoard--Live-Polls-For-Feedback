import { Server } from "socket.io";

import {
  redis,
  publisher,
  subscriber,
} from "../common/utils/redis-connection.js";

import { socketAuthMiddleware } from "./middleware/socket.auth.middleware.js";

import Poll from "../modules/poll/poll.model.js";
import Response from "../modules/response/response.model.js";

let io;

const POLL_CHANNEL = "POLL_UPDATES";

export const initSocket = async (server) => {
  // =========================
  // SOCKET SERVER
  // =========================

  io = new Server(server, {
    cors: {
      origin: "*",

      methods: ["GET", "POST"],
    },
  });

  // =========================
  // SOCKET AUTH
  // =========================

  io.use(socketAuthMiddleware);

  // =========================
  // REDIS SUBSCRIBE
  // =========================

  await subscriber.subscribe(POLL_CHANNEL);

  // =========================
  // RECEIVE PUB/SUB EVENTS
  // =========================

  subscriber.on(
    "message",

    (channel, message) => {
      if (channel !== POLL_CHANNEL) return;

      const data = JSON.parse(message);

      const {
        pollId,

        creatorId,

        totalResponses,

        analytics,
      } = data;

      // emit only to creator dashboard

      io.to(`creator:${creatorId}:poll:${pollId}`).emit(
        "poll-updated",

        {
          totalResponses,

          analytics,
        },
      );
    },
  );

  // =========================
  // SOCKET CONNECTIONS
  // =========================

  io.on(
    "connection",

    (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // creator dashboard

      socket.on(
        "join-dashboard",

        async ({ pollId }) => {
          try {
            const poll = await Poll.findById(pollId, "createdBy questions");

            if (!poll) return;

            // ownership validation

            if (!poll.createdBy.equals(socket.userId)) {
              return;
            }

            // join room

            socket.join(`creator:${socket.userId}:poll:${pollId}`);

            // =========================
            // INITIAL ANALYTICS
            // =========================

            let totalResponses;
            const redisTotal = await redis.get(`poll:${pollId}:responses`);
            if (redisTotal === null || redisTotal === undefined) {
              totalResponses = poll.totalResponses || 0;
              await redis.set(`poll:${pollId}:responses`, totalResponses);
            } else {
              totalResponses = Number(redisTotal);
            }

            const analytics = {};

            // fetch analytics question-wise

            for (const question of poll.questions) {
              const redisKey = `poll:${pollId}:question:${question._id}:options`;
              const counts = await redis.hgetall(redisKey);

              if (!counts || Object.keys(counts).length === 0) {
                const voteCounts = await Response.aggregate([
                  { $match: { pollId: poll._id } },
                  { $unwind: "$answers" },
                  {
                    $group: {
                      _id: "$answers.selectedOptionId",
                      votes: { $sum: 1 },
                    },
                  },
                ]);
                counts = {};
                for (const option of question.options) {
                  const vote = voteCounts.find(
                    (v) => v._id.toString() === option._id.toString(),
                  );
                  const voteCount = vote ? vote.votes : 0;
                  counts[option._id.toString()] = String(voteCount);
                }
              }

              analytics[question._id.toString()] = counts;

              if (Object.keys(counts).length > 0) {
                await redis.hset(redisKey, counts);
              }
            }

            // send initial state

            socket.emit(
              "analytics-init",

              {
                totalResponses: Number(totalResponses || 0),

                analytics,
              },
            );

            console.log(
              `Socket ${socket.id} joined creator:${socket.userId}:poll:${pollId}`,
            );
          } catch (err) {
            console.error(err);
          }
        },
      );

      socket.on(
        "disconnect",

        () => {
          console.log(`Socket disconnected: ${socket.id}`);
        },
      );
    },
  );
};

// =========================
// PUBLISH HELPER
// =========================

export const publishPollUpdate = async ({
  pollId,

  creatorId,

  totalResponses,

  analytics,
}) => {
  await publisher.publish(
    POLL_CHANNEL,

    JSON.stringify({
      pollId,

      creatorId,

      totalResponses,

      analytics,
    }),
  );
};
