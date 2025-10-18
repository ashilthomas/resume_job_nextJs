// app/api/resumes/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parseResumeFile } from "@/lib/parser";
import Resume from "@/lib/models/Resume";
import { connectDB } from "@/lib/db";

export const config = {
  api: {
    bodyParser: false, // disable built-in body parser for file upload
  },
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert uploaded file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    // Save file with a unique name
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/\s+/g, "_"); // replace spaces
    const filePath = path.join(uploadsDir, `${timestamp}-${sanitizedFileName}`);
    fs.writeFileSync(filePath, buffer);

    // Parse the uploaded file
    const parsed = await parseResumeFile(filePath, file.type);

    // Save to database
    const resume = await Resume.create({
      fileName: file.name,
      filePath,
      parsed,
      skills: parsed.skills,
      atsScore: Math.floor(Math.random() * 40 + 60), // dummy ATS score 60–100
    });

    // Optionally: delete file after parsing to save space
    // fs.unlinkSync(filePath);

    return NextResponse.json({ success: true, resume });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
