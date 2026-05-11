import { Router } from "express";
import { validateSchema } from "../../common/middleware/validate.middleware.js";
import { RegisterDto } from "./dto/register.dto.js";
import * as controller from "./auth.controller.js"
import LoginDto from "./dto/login.dto.js";
import { VerifyEmailDto } from "./dto/verify-email.dto.js";
import { authenticated } from "../../common/middleware/auth.middleware.js";
import { authLimitter } from "../../common/middleware/rateLimitter.middleware.js";

const router = Router()

router.post("/register", authLimitter, validateSchema(RegisterDto), controller.register )


router.post("/verify-email", validateSchema(VerifyEmailDto), controller.verify)

router.post("/login", authLimitter, validateSchema(LoginDto), controller.login)
router.post("/google", controller.googleAuthController);

router.get("/getMe", authenticated, controller.getMe)

router.post("/refresh", controller.refresh)

router.post("/logout", authenticated, controller.logout)

export default router