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

// =====================================
// custom validation
// =====================================

responseSchema.path("userId").validate(function () {
  const hasUserId = this.userId != null;

  const hasFingerprint =
    typeof this.fingerprintHash === "string" && this.fingerprintHash.length > 0;

  // exactly one must exist

  return hasUserId !== hasFingerprint;
}, "Either userId or fingerprintHash must exist, but not both");

// =====================================
// indexes
// =====================================

// authenticated users

responseSchema.index(
  { pollId: 1, userId: 1 },
  {
    unique: true,

    partialFilterExpression: {
      userId: {
        $type: "objectId",
      },
    },
  },
);

// anonymous users

responseSchema.index(
  { pollId: 1, fingerprintHash: 1 },
  {
    unique: true,

    partialFilterExpression: {
      fingerprintHash: {
        $type: "string",
      },
    },
  },
);

export default mongoose.model("Response", responseSchema);
