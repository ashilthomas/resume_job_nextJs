import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/lib/models/Job";
import { getAuth } from "@clerk/nextjs/server";
// GET /api/jobs/:id
// Returns a specific job by ID for employers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await connectDB();
    
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = id;
    
    const job = await Job.findOne({ _id: jobId, userId }).lean();
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    return NextResponse.json({ job });
  } catch (error: unknown) {
    console.error("Error fetching job:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch job";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await connectDB();

    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = id;
    const deleted = await Job.findOneAndDelete({ _id: jobId, userId });
    if (!deleted) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting job:", error);
    const message = error instanceof Error ? error.message : "Failed to delete job";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}