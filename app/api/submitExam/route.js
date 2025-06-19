import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import { verifyToken } from "@/lib/authMiddleware";
import User from "@/models/User";
import Exam from "@/models/Exam";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await verifyToken();
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || user.role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { examId, answers } = body;

    if (
      !examId ||
      typeof examId !== "string" ||
      !answers ||
      typeof answers !== "object"
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const existing = await Submission.findOne({ userId: user._id, examId });
    if (existing) {
      return NextResponse.json(
        { message: "Already submitted" },
        { status: 409 }
      );
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    let score = 0;
    for (const q of exam.questions) {
      const submitted = answers[q._id];
      if (q.type === "mcq") {
        if (submitted !== undefined && String(submitted) === String(q.correctOption)) {
          score += 1;
        }
      }
      // Subjective questions are not scored yet, left for manual review
    }

    const submission = await Submission.create({
      userId: user._id,
      examId,
      answers,
      score,
      submittedAt: new Date(), 
    });

    return NextResponse.json({ message: "Submitted successfully", submission });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
