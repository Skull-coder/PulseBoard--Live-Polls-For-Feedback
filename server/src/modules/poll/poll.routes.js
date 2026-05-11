import { Router } from "express";
import { validateSchema } from "../../common/middleware/validate.middleware.js";
import PollDto from "./dto/poll.dto.js";
import * as controller from "./poll.controller.js"
import { authenticated } from "../../common/middleware/auth.middleware.js";

const router = Router();

router.post("/create", authenticated, validateSchema(PollDto), controller.create);

router.get("/myPolls", authenticated, controller.myPolls);
router.get("/:pollId", controller.getPoll);
router.patch("/:pollId/publish", authenticated, controller.publish)

router.delete("/:pollId", authenticated, controller.deletePoll)

export default router;