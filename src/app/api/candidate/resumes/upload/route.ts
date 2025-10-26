// app/api/candidate/resumes/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseResumeBuffer } from "@/lib/parser";
import Resume from "@/lib/models/Resume";
import { connectDB } from "@/lib/db";
import { requireCandidateUser } from "@/lib/auth";
// POST /api/candidate/resumes/upload
// Uploads a resume for candidates
export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const user = await requireCandidateUser(req);
    if (user instanceof NextResponse) return user;
    const { userId } = user;
    
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResumeBuffer(buffer, file.name, file.type);

    const resume = await Resume.create({
      fileName: file.name,
      filePath: null,
      parsed,
      skills: parsed.skills,
      userId,
      atsScore: Math.floor(Math.random() * 40 + 60),
    });

    return NextResponse.json({ success: true, resume });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}