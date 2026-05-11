import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import authRoutes from "./src/modules/auth/auth.routes.js";
import pollRoutes from "./src/modules/poll/poll.routes.js"
import responseRoutes from "./src/modules/response/response.routes.js"
import { errorHandler } from "./src/common/middleware/errorHandler.middleware.js";
import { notFound } from "./src/common/middleware/notFound.middleware.js";



const app = express()

const corsOptions = {
  origin: 'http://localhost:5173',
}

app.use(express.json())
app.use(cors(corsOptions))

// API Routes
app.use("/auth", authRoutes)
app.use("/poll", pollRoutes)
app.use("/response", responseRoutes)


app.use(errorHandler);
app.use(notFound);

export default app