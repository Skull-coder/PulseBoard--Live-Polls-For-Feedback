import { Server } from "socket.io";

import {
  redis,
  publisher,
  subscriber,
} from "../common/utils/redis-connection.js";

import { socketAuthMiddleware } from "./middleware/socket.auth.middleware.js";

import Poll from "../modules/poll/poll.model.js";

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

            const totalResponses = await redis.get(`poll:${pollId}:responses`);

            const analytics = {};

            // fetch analytics question-wise

            for (const question of poll.questions) {
              const counts = await redis.hgetall(
                `poll:${pollId}:question:${question._id}:options`,
              );

              analytics[question._id.toString()] = counts;
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
