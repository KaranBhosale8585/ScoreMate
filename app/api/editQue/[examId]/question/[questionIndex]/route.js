import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";
import { verifyToken } from "@/lib/authMiddleware";

export async function PUT(req, { params }) {
  await connectDB();
  const decoded = await verifyToken();
  const { examId, questionIndex } = params;
  const { questionText, options, correctOption } = await req.json();

  const exam = await Exam.findById(examId);
  if (!exam)
    return NextResponse.json({ message: "Exam not found" }, { status: 404 });

  const question = exam.questions[questionIndex];
  if (!question)
    return NextResponse.json(
      { message: "Question not found" },
      { status: 404 }
    );

  question.questionText = questionText;
  if (question.type === "mcq") {
    question.options = options;
    question.correctOption = correctOption;
  }

  await exam.save();
  return NextResponse.json({ updatedQuestions: exam.questions });
}
