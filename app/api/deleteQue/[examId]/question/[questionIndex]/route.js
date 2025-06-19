import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";
import { verifyToken } from "@/lib/authMiddleware";
import User from "@/models/User";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const decoded = await verifyToken();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || user.role !== "examiner") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { examId, questionIndex } = params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    if (String(exam.createdBy) !== String(user._id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const index = parseInt(questionIndex);
    if (isNaN(index) || index < 0 || index >= exam.questions.length) {
      return NextResponse.json(
        { message: "Invalid question index" },
        { status: 400 }
      );
    }

    // Remove the question at the index
    exam.questions.splice(index, 1);
    await exam.save();

    return NextResponse.json({
      message: "Question deleted",
      updatedQuestions: exam.questions,
    });
  } catch (err) {
    console.error("Error deleting question:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
