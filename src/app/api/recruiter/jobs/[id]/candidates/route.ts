import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import Resume from "@/lib/models/Resume";
import { calculateJobMatch } from "@/lib/utils";
import { requireRecruiterUser } from "@/lib/auth";
//recruiter job candidates retrive using jobId and recruiter userId
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRecruiterUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const jobId = params.id;
    
    // Ensure this job belongs to the recruiter
    const job = await Job.findOne({ _id: jobId, userId }).lean();//find job using jobId and recruiter userId
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    // Consider all candidate resumes (global pool)
    const resumes = await Resume.find({}).lean();//find all resumes
    
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
}//explane logic 
//1. first find job using jobId and recruiter userId
//2. if job not found return error
//3. if job found then find all resumes
//4. for each resume calculate match score using calculateJobMatch function
//5. sort candidates by match score in descending order
//6. return job and candidates
// what si this api need?
// this api need jobId and recruiter userId to find candidates for that job
 // this api return job and candidates with match score  
 // job contain job details and candidates contain resume details with match score
 // candidates contain resumeId, name, email, skills, atsScore, matchScore, missingSkills
 // missingSkills contain skills that job required but resume not have
 /// this api help recruiter to find candidates for their job
