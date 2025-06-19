import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/authMiddleware";
import Submission from "@/models/Submission";
import User from "@/models/User";

export async function PUT(req) {
  try {
    await connectDB();

    const decoded = await verifyToken();
    const examiner = await User.findById(decoded.userId);
    if (!examiner || examiner.role !== "examiner") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, scores, feedback } = await req.json();

    if (!submissionId || typeof scores !== "object") {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    let subjectiveScore = 0;

    // Add or update subjective scores
    for (const [questionId, score] of Object.entries(scores)) {
      const numericScore = Number(score);
      if (!isNaN(numericScore)) {
        submission.subjectiveScores.set(questionId, numericScore);
        subjectiveScore += numericScore;
      }
    }

    // Add or update feedback
    for (const [questionId, comment] of Object.entries(feedback || {})) {
      submission.feedback.set(questionId, comment);
    }

    // Update final score and mark as reviewed
    submission.score += subjectiveScore;
    submission.isReviewed = true;

    await submission.save();

    return NextResponse.json({ message: "Scored successfully", submission });
  } catch (error) {
    console.error("Manual Scoring Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
