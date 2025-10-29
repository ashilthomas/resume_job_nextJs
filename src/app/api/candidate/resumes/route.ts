import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/lib/models/Resume";
import { requireCandidateUser } from "@/lib/auth";
// GET /api/candidate/resumes
// Returns all resumes available for candidates
export async function GET(req: NextRequest) {
  try {
    const user = await requireCandidateUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;

    await connectDB();
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ resumes });
  } catch (error: unknown) {
    console.error("Error fetching resumes:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch resumes";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}