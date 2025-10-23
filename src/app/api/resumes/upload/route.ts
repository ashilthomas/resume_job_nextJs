// app/api/resumes/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseResumeBuffer } from "@/lib/parser";
import Resume from "@/lib/models/Resume";
import { connectDB } from "@/lib/db";
import { auth } from "@clerk/nextjs";

// Ensure this route runs on the Node.js runtime (not Edge)
export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false, // disable built-in body parser for file upload
  },
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the authenticated user ID from Clerk
    const { userId } = auth();
    
    // If no authenticated user, return unauthorized
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert uploaded file to buffer and parse directly (no disk path dependency)
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResumeBuffer(buffer, file.name, file.type);

    // Save to database with user ID
    const resume = await Resume.create({
      fileName: file.name,
      filePath: null,
      parsed,
      skills: parsed.skills,
      userId, // Add the authenticated user ID
      atsScore: Math.floor(Math.random() * 40 + 60), // dummy ATS score 60–100
    });

    return NextResponse.json({ success: true, resume });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
