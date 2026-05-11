import { verifyAccessToken } from "../utils/jwt.utils.js"
import User from "../../modules/auth/auth.model.js"
import ApiError from "../utils/api.error.js";
import { redis } from "../utils/redis-connection.js";


export const authenticated = async (req, _, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ApiError.unauthorized("No token provided");
        }


        const accessToken = authHeader.split(" ")[1];

        const isBlacklisted = await redis.get(`bl:${accessToken}`);
        if (isBlacklisted) {
            throw ApiError.unauthorized("Session expired. Please log in again.");
        }

        let decoded;

        try {
            decoded = verifyAccessToken(accessToken);
        } catch (err) {
            throw ApiError.unauthorized("Invalid access token");
        }


        const user = await User.findById(decoded.id);
        if (!user) throw ApiError.notfound("User not found");

        req.userId = decoded.id;

        next();
    } catch (err) {
        next(err);
    }
}