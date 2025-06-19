import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";
import { verifyToken } from "@/lib/authMiddleware";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = await verifyToken();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || user.role !== "examiner") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    console.log(user)

    const newExam = await Exam.create({
      ...body,
      createdBy: user.id,
    });

    return NextResponse.json({ success: true, exam: newExam });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
