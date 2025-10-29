import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/lib/models/Resume";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connectDB();
    
    // Get the authenticated user ID from Clerk
    const { userId } = auth();
   
    
    
    // If no authenticated user, return unauthorized
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get all resumes for the current user, sorted by most recent first
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}