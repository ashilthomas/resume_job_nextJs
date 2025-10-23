import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/lib/models/Resume";
import { auth } from "@clerk/nextjs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    // Get the authenticated user ID from Clerk
    const { userId } = auth();
    
    // If no authenticated user, return unauthorized
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const resumeId = params.id;
    
    // Find the resume by ID and ensure it belongs to the current user
    const resume = await Resume.findOne({ _id: resumeId, userId }).lean();
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    
    return NextResponse.json({ resume });
  } catch (error: any) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resume" },
      { status: 500 }
    );
  }
}