import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job, { IJob } from "@/lib/models/Job";
import Resume, { IResume } from "@/lib/models/Resume";
import { calculateJobMatch } from "@/lib/utils";
import { requireRecruiterUser } from "@/lib/auth";
//recruiter job candidates retrive using jobId and recruiter userId
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const user = await requireRecruiterUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const jobId = id;
    
    // Ensure this job belongs to the recruiter
    const job = await Job.findOne({ _id: jobId, userId }).lean<IJob>();//find job using jobId and recruiter userId
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    // Consider all candidate resumes (global pool)
    const resumes = await Resume.find({}).lean<IResume[]>();//find all resumes
    
    const candidates = resumes.map((resume) => {
      const { score, missingSkills } = calculateJobMatch(resume.skills ?? [], job.requiredSkills ?? []);
      return {
        // _id exists on documents; when using lean<IResume[]>(), TypeScript keeps it as unknown. Cast to string for API payload.
        resumeId: String((resume as { _id?: unknown })._id ?? ""),
        name: resume.parsed?.name || 'Candidate',
        email: resume.parsed?.emails?.[0] || '',
        skills: resume.skills ?? [],
        atsScore: resume.atsScore,
        matchScore: score,
        missingSkills
      };
    });
    
    const sortedCandidates = candidates.sort((a, b) => b.matchScore - a.matchScore);
    return NextResponse.json({ job, candidates: sortedCandidates });
  } catch (error: unknown) {
    console.error("Error finding candidates:", error);
    const message = error instanceof Error ? error.message : "Failed to find candidates";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
