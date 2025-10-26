import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/lib/models/Resume";
import Job from "@/lib/models/Job";
import { findTopJobMatches } from "@/lib/utils";
import { requireCandidateUser } from "@/lib/auth";
// GET /api/candidate/resumes/:id/matches
// Returns job matches for a specific resume by ID for candidates
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireCandidateUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const resumeId = params.id;
    
    const resume = await Resume.findOne({ _id: resumeId, userId }).lean();
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    
    const jobs = await Job.find({}).lean();
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