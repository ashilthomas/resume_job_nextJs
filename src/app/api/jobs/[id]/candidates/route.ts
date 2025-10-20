import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import Resume from "@/lib/models/Resume";
import { calculateJobMatch } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const jobId = params.id;
    
    // Find the job by ID
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    // Get all resumes
    const resumes = await Resume.find({}).lean();
    
    // Calculate match scores for each resume
    const candidates = resumes.map(resume => {
      const { score, missingSkills } = calculateJobMatch(resume.skills, job.requiredSkills);
      
      return {
        resumeId: resume._id,
        name: resume.parsed?.name || 'Candidate',
        email: resume.parsed?.emails?.[0] || '',
        skills: resume.skills,
        atsScore: resume.atsScore,
        matchScore: score,
        missingSkills
      };
    });
    
    // Sort by match score (highest first)
    const sortedCandidates = candidates.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({ 
      job,
      candidates: sortedCandidates 
    });
  } catch (error: any) {
    console.error("Error finding candidates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to find candidates" },
      { status: 500 }
    );
  }
}