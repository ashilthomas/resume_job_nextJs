import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";

export async function GET() {
  try {
    await connectDB();
    
    // Get all jobs, sorted by most recent first
    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}