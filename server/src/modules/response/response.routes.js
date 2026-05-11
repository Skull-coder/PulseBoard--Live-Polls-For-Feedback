import { Router } from "express";
import ApiResponse from "../../common/utils/api.response.js"
import * as controller from "./response.controller.js"
import ResponseDto from "../response/dto/response.dto.js"
import { validateSchema } from "../../common/middleware/validate.middleware.js";

const router = Router();

router.post("/:pollId/submit", validateSchema(ResponseDto) ,  controller.submit)

export default router