import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import Resume from "@/lib/models/Resume";
import { connectDB } from "@/lib/db";
import { parseResumeFile } from "@/lib/parser";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());// convert to buffer
    const uploadsDir = path.join(process.cwd(), "uploads");// ensure uploads dir exists
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);// save file to disk

    const filePath = path.join(uploadsDir, file.name);// write file
    fs.writeFileSync(filePath, buffer);// parse resume

    const parsed = await parseResumeFile(filePath, file.type);//

    const resume = await Resume.create({
      fileName: file.name,
      filePath,
      parsed,
      skills: parsed.skills,
      atsScore: Math.floor(Math.random() * 40 + 60), // dummy ATS (60–100)
    });

    return NextResponse.json({ success: true, resume });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
