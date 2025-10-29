import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { requireCandidateUser } from "@/lib/auth";
// GET /api/candidate/jobs
// Returns all jobs available for candidates
export async function GET(req: NextRequest) {
  try {
    const user = await requireCandidateUser(req);
    if (user instanceof NextResponse) return user;

    await connectDB();
    const jobs = await Job.find({}).lean();
    return NextResponse.json({ jobs });
  } catch (error: unknown) {
    console.error("Error fetching jobs for candidate:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}