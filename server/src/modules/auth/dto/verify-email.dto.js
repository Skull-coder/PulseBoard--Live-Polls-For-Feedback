import { z } from "zod";
import { BaseDto } from "../../../common/dto/baseDto.js";

export class VerifyEmailDto extends BaseDto {
  static schema = z.object({
    verificationToken: z.string({
      message: "Verification token is required"
    }).min(10, "Invalid token format")
  });
}
