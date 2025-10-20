import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.company || !body.description) {
      return NextResponse.json(
        { error: "Title, company, and description are required" },
        { status: 400 }
      );
    }
    
    // Create job with required skills
    const job = await Job.create({
      title: body.title,
      company: body.company,
      description: body.description,
      requiredSkills: body.requiredSkills || [],
      location: body.location || "",
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