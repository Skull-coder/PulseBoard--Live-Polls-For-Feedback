import { z } from "zod";
import { BaseDto } from "../../../common/dto/baseDto.js";
import mongoose from "mongoose";

class ResponseDto extends BaseDto {
  static schema = z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),

        selectedOptionId: z.string(),
      }),
    ),
    fingerprint: z.string().optional(),
  });
}

export default ResponseDto;
