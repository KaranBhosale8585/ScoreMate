import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import User from "@/models/User";
import Exam from "@/models/Exam";
import { verifyToken } from "@/lib/authMiddleware";

export async function GET(req, context) {
  try {
    await connectDB();

    const { examId } = await context.params; // ✅ Await params

    const decoded = await verifyToken(req);
    const student = await User.findById(decoded.userId);

    if (!student || student.role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const submission = await Submission.findOne({
      userId: student._id,
      examId,
    }).populate({
      path: "examId",
      model: Exam,
    });

    if (!submission) {
      return NextResponse.json(
        { message: "Result not found" },
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
        exam: submission.examId,
      },
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
