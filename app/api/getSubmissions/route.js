import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
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

    const submissions = await Submission.find({ userId: user._id });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error("getSubmissions error", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
