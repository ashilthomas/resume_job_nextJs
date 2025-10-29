import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume, { IResume } from "@/lib/models/Resume";
import Job, { IJob } from "@/lib/models/Job";
import { findTopJobMatches } from "@/lib/utils";
import { requireCandidateUser } from "@/lib/auth";
// GET /api/candidate/resumes/:id/matches
// Returns job matches for a specific resume by ID for candidates
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCandidateUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const { id: resumeId } = await context.params;
    
    const resume = await Resume.findOne({ _id: resumeId, userId }).lean<IResume>();
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    
    const jobs = await Job.find({}).lean<IJob[]>();
    const jobMatches = findTopJobMatches(
      resume.skills ?? [],
      jobs.map((j): { requiredSkills: string[]; [key: string]: unknown } => ({
        ...j,
        requiredSkills: j.requiredSkills ?? [],
      }))
    );
    return NextResponse.json({ jobMatches });
  } catch (error: unknown) {
    console.error("Error finding job matches:", error);
    const message = error instanceof Error ? error.message : "Failed to find job matches";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}