import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import User from "@/models/User";
import Exam from "@/models/Exam";
import { verifyToken } from "@/lib/authMiddleware";

export async function GET() {
  try {
    await connectDB();

    const decoded = await verifyToken();
    const examiner = await User.findById(decoded.userId);
    if (!examiner || examiner.role !== "examiner") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const submissions = await Submission.find()
      .populate("userId", "name email")
      .populate("examId", "title");

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("Error fetching submissions:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
