import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/lib/models/Resume";

export async function GET() {
  try {
    await connectDB();
    
    // Get all resumes, sorted by most recent first
    const resumes = await Resume.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}