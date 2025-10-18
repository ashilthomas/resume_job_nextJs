import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;

async function extractText(filePath: string, mimeType: string) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  // ✅ Check extension instead of mimetype
  if (ext === ".pdf" || mimeType.includes("pdf")) {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (ext === ".docx" || mimeType.includes("word")) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    // fallback for plain text or unknown
    return buffer.toString("utf-8");
  }
}

export async function parseResumeFile(filePath: string, mimeType: string) {
  const text = await extractText(filePath, mimeType);
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];

  const skillsList = ["python", "javascript", "react", "node", "aws", "docker"];
  const foundSkills = skillsList.filter((s) => text.toLowerCase().includes(s));

  return {
    rawText: text,
    emails,
    phones,
    skills: Array.from(new Set(foundSkills)),
    summary: text.split("\n").slice(0, 5).join(" "),
  };
}
