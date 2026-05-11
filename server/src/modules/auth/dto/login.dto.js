import { z } from "zod";
import { BaseDto } from "../../../common/dto/baseDto.js";

class LoginDto extends BaseDto {
  static schema = z.object({
    email: z.email({ message: "Email is invalid" }),
    
    password: z
      .string({ message: "Password must be a string" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain uppercase, lowercase, number, and special character",
      )
  });
}

export default LoginDto