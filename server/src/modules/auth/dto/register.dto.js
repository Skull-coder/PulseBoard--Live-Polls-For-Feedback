import { z } from "zod";
import { BaseDto } from "../../../common/dto/baseDto.js";

export class RegisterDto extends BaseDto {
  static schema = z.object({
    username: z
      .string({ message: "Username must be a string" })
      .lowercase({ message: "Username must be in lowercase" })
      .min(3, { message: "Minimum length must be 3" })
      .max(12, { message: "Maximum length must be 12" }),

    email: z.email({ message: "Enter a valid email" }),

    password: z
      .string({ message: "Password must be a string" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
  });
}
