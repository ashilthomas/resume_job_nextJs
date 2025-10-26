import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { requireRecruiterUser } from "@/lib/auth";
//recurter job retrive using thir userid
export async function GET(req: NextRequest) {
  try {
    const user = await requireRecruiterUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Error fetching recruiter jobs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
// recruter job post using their userId
export async function POST(req: NextRequest) {
  try {
    const user = await requireRecruiterUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;

    await connectDB();
    const body = await req.json();
    
    if (!body.title || !body.company || !body.description) {
      return NextResponse.json(
        { error: "Title, company, and description are required" },
        { status: 400 }
      );
    }
    
    const job = await Job.create({
      title: body.title,
      company: body.company,
      description: body.description,
      requiredSkills: body.requiredSkills || [],
      location: body.location || "",
      userId,
    });
    
    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create job" },
      { status: 500 }
    );
  }
}