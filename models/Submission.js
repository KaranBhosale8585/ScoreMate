import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
  answers: {
    type: Map,
    of: String,
    required: true,
  },
  score: { type: Number, default: 0 },
  subjectiveScores: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  feedback: {
    type: Map,
    of: String,
    default: new Map(),
  },
  isReviewed: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Submission ||
  mongoose.model("Submission", submissionSchema);
