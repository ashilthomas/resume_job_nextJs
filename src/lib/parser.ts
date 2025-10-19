import fs from "fs";
import path from "path";
import "server-only";

const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;

async function extractTextFromBuffer(
  fileBuffer: Buffer,
  fileName: string | undefined,
  mimeType: string
) {
  const ext = (fileName ? path.extname(fileName) : "").toLowerCase();

  if (ext === ".pdf" || mimeType.includes("pdf")) {
    // Use pdf-parse on the server to avoid worker/module resolution issues
    try {
      // Create the test directory and file if it doesn't exist to prevent pdf-parse from failing
      const testFilePath = path.join(process.cwd(), 'test', 'data', '05-versions-space.pdf');
      const testDirPath = path.dirname(testFilePath);
      
      if (!fs.existsSync(testDirPath)) {
        fs.mkdirSync(testDirPath, { recursive: true });
      }
      
      if (!fs.existsSync(testFilePath)) {
        fs.writeFileSync(testFilePath, 'Dummy PDF content');
      }
      
      const pdfParseModule: any = await import("pdf-parse");
      const pdfParse: any = (pdfParseModule as any).default ?? pdfParseModule;
      const result = await pdfParse(fileBuffer);
      return (result && typeof result.text === "string") ? result.text : "";
    } catch (err: any) {
      console.error("PDF parsing error:", err);
      throw new Error(`Failed to extract PDF text: ${err?.message || "Unknown error"}`);
    }
  }

  if (
    ext === ".docx" ||
    mimeType.includes("word") ||
    mimeType.includes("officedocument")
  ) {
    const mammothModule = await import("mammoth");
    const mammoth: any = (mammothModule as any).default ?? (mammothModule as any);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value as string;
  }

  return fileBuffer.toString("utf8");
}

export async function parseResumeFile(filePath: string, mimeType: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const fileBuffer = fs.readFileSync(filePath);
  const text = await extractTextFromBuffer(fileBuffer, filePath, mimeType);
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];

  const skillsList = ["python", "javascript", "react", "node", "aws", "docker", "typescript", "java"];
  const foundSkills = skillsList.filter((s) => text.toLowerCase().includes(s));

  return {
    rawText: text,
    emails,
    phones,
    skills: [...new Set(foundSkills)],
    summary: text.split("\n").slice(0, 5).join(" "),
  };
}

export async function parseResumeBuffer(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) {
  try {
    const text = await extractTextFromBuffer(fileBuffer, fileName, mimeType);
    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];

    const skillsList = [
      "python",
      "javascript",
      "react",
      "node",
      "aws",
      "docker",
      "typescript",
      "java",
    ];
    const foundSkills = skillsList.filter((s) => text.toLowerCase().includes(s));

    return {
      rawText: text,
      emails,
      phones,
      skills: [...new Set(foundSkills)],
      summary: text.split("\n").slice(0, 5).join(" "),
    };
  } catch (err: any) {
    console.error("Resume parsing error:", err);
    throw new Error(`Failed to parse resume: ${err?.message || "Unknown error"}`);
  }
}
