import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    selectedOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const responseSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },

    answers: {
      type: [answerSchema],
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    fingerprintHash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

responseSchema.pre("validate", function (next) {
  const hasUserId = !!this.userId;

  const hasFingerprint = !!this.fingerprintHash;

  if (!hasUserId && !hasFingerprint) {
    return next(new Error("Either userId or fingerprintHash is required"));
  }

  if (hasUserId && hasFingerprint) {
    return next(
      new Error("Both userId and fingerprintHash cannot exist together"),
    );
  }

  next();
});

responseSchema.index(
  { pollId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $type: "objectId" },
    },
  },
);

responseSchema.index({ pollId: 1, fingerprintHash: 1 }, { unique: true });

export default mongoose.model("Response", responseSchema);
