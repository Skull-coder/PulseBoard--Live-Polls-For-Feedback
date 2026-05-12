import { z } from "zod";

import { BaseDto } from "../../../common/dto/baseDto.js";

class PollDto extends BaseDto {
  static schema = z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(200, "Title too long"),
    questions: z
      .array(
        z.object({
          question: z.string().trim().min(1, "Question is required"),

          required: z.boolean(),

          options: z
            .array(z.string().trim().min(1, "Option cannot be empty"))
            .min(2, "Minimum 2 options required")
            .max(4, "Maximum 4 options allowed"),
        }),
      )
      .min(1, "At least one question required"),

    responseMode: z.enum(["ANONYMOUS", "AUTHENTICATED"]),

    expiryDuration: z.enum(["5_MIN", "10_MIN", "15_MIN"]),
  });
}

export default PollDto;
