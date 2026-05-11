import { verifyAccessToken } from "../../common/utils/jwt.utils.js";

export const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = verifyAccessToken(token);

    socket.userId = decoded.id;

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};
