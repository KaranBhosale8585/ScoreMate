import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["mcq", "short", "long"],
    required: true,
  },
  questionText: { type: String, required: true },
  options: {
    type: [String],
    validate: {
      validator: function (v) {
        return this.type === "mcq" ? v.length === 4 : true;
      },
      message: "MCQ must have exactly 4 options.",
    },
  },
  correctOption: {
    type: String,
    required: function () {
      return this.type === "mcq";
    },
  },
});

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);
