import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
  },
  {
    _id: true,
  },
);

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    required: {
      type: Boolean,
      default: true,
    },

    options: {
      type: [optionSchema],

      validate: [
        {
          validator: (arr) => arr.length >= 2,

          message: "Minimum 2 options required",
        },

        {
          validator: (arr) => arr.length <= 4,

          message: "Maximum 4 options allowed",
        },
      ],
    },
  },
  {
    _id: true,
  },
);

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Poll title is required"],
      trim: true,
      maxlength: 200,
    },
    questions: {
      type: [questionSchema],

      required: true,

      validate: {
        validator: (arr) => arr.length >= 1,

        message: "At least one question required",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    responseMode: {
      type: String,
      enum: ["ANONYMOUS", "AUTHENTICATED"],
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    totalResponses: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Poll", pollSchema);
