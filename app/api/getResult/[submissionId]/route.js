import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import User from "@/models/User";
import Exam from "@/models/Exam";
import { verifyToken } from "@/lib/authMiddleware";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const decoded = await verifyToken();
    const examiner = await User.findById(decoded.userId);
    if (!examiner || examiner.role !== "examiner") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = params;

    const submission = await Submission.findById(submissionId)
      .populate({
        path: "examId",
        model: Exam,
      })
      .populate("userId", "name email");

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      submission: {
        _id: submission._id,
        score: submission.score,
        isReviewed: submission.isReviewed,
        answers: Object.fromEntries(submission.answers),
        subjectiveScores: Object.fromEntries(submission.subjectiveScores),
        feedback: Object.fromEntries(submission.feedback),
        submittedAt: submission.submittedAt,
        user: submission.userId,
        exam: submission.examId,
      },
    });
  } catch (err) {
    console.error("Error fetching submission:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
