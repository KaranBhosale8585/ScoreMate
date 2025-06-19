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

    const { examId } = params;
    const exam = await Exam.findById(examId);

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    if (String(exam.createdBy) !== String(user._id)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Exam.deleteOne({ _id: examId });

    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error("Error deleting exam:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
