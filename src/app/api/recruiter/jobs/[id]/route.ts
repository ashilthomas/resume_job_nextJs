import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { requireRecruiterUser } from "@/lib/auth";
//data single retirive using jobId and recruiter userId
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRecruiterUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const jobId = params.id;
    const job = await Job.findOne({ _id: jobId, userId }).lean();
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch (error: any) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch job" },
      { status: 500 }
    );
  }
}
//recruiter job update using jobId and recruiter userIdre
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRecruiterUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const jobId = params.id;
    const body = await req.json();
    
    if (!body.title || !body.company || !body.description) {
      return NextResponse.json(
        { error: "Title, company, and description are required" },
        { status: 400 }
      );
    }
    
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, userId },
      {
        title: body.title,
        company: body.company,
        description: body.description,
        requiredSkills: body.requiredSkills || [],
        location: body.location || "",
      },
      { new: true }
    );
    
    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error: any) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update job" },
      { status: 500 }
    );
  }
}
//delete job reacurter using jobId and recruiter userId
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireRecruiterUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;

    await connectDB();
    const jobId = params.id;
    const deleted = await Job.findOneAndDelete({ _id: jobId, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete job" },
      { status: 500 }
    );
  }
}