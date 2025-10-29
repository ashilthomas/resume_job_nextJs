import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { getAuth } from "@clerk/nextjs/server";
// POST /api/jobs/create
// Creates a new job for employers
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.company || !body.description) {
      return NextResponse.json(
        { error: "Title, company, and description are required" },
        { status: 400 }
      );
    }
    
    // Create job owned by the current user
    const job = await Job.create({
      title: body.title,
      company: body.company,
      description: body.description,
      requiredSkills: body.requiredSkills || [],
      location: body.location || "",
      userId,
    });
    
    return NextResponse.json({ success: true, job });
  } catch (error: unknown) {
    console.error("Error creating job:", error);
    const message = error instanceof Error ? error.message : "Failed to create job";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}