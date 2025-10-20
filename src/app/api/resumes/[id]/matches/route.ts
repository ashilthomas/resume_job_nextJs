import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/lib/models/Resume";
import Job from "@/lib/models/Job";
import { findTopJobMatches } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const resumeId = params.id;
    
    // Find the resume by ID
    const resume = await Resume.findById(resumeId).lean();
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    
    // Get all jobs
    const jobs = await Job.find({}).lean();
    
    // Calculate job matches based on resume skills
    const jobMatches = findTopJobMatches(resume.skills, jobs);
    
    return NextResponse.json({ jobMatches });
  } catch (error: any) {
    console.error("Error finding job matches:", error);
    return NextResponse.json(
      { error: error.message || "Failed to find job matches" },
      { status: 500 }
    );
  }
}