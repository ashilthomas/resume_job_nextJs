import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { getAuth } from "@clerk/nextjs/server";
// GET /api/jobs
// Returns all jobs available for employers
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get all jobs for the current user, sorted by most recent first
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}