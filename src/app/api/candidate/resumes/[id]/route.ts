import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Resume from "@/lib/models/Resume";
import { requireCandidateUser } from "@/lib/auth";
// GET /api/candidate/resumes/:id
// Returns a specific resume by ID for candidates
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireCandidateUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const resumeId = params.id;
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
// DELETE /api/candidate/resumes/:id
// Deletes a specific resume by ID for candidates
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireCandidateUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();
    const resumeId = params.id;
    const deleted = await Resume.findOneAndDelete({ _id: resumeId, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resume" },
      { status: 500 }
    );
  }
}