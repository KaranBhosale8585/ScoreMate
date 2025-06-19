import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";
import { verifyToken } from "@/lib/authMiddleware";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const decoded = await verifyToken();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || user.role !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const exams = await Exam.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, exams });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
