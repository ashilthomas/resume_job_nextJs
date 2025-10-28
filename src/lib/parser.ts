import fs from "fs";
import path from "path";
import "server-only";

const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
const nameRegex = /\b([A-Z][a-zA-Z'’\-\.]+(?:\s[A-Z][a-zA-Z'’\-\.]+)+)\b/g;

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
      
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default ?? pdfParseModule;
      const result = await pdfParse(fileBuffer);
      return (result && typeof result.text === "string") ? result.text : "";
    } catch (err: unknown) {
      console.error("PDF parsing error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      throw new Error(`Failed to extract PDF text: ${message}`);
    }
  }

  if (
    ext === ".docx" ||
    mimeType.includes("word") ||
    mimeType.includes("officedocument")
  ) {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default ?? mammothModule;
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
  const name = text.match(nameRegex) || [];

  const skillsList = ["python", "javascript", "react", "node", "aws", "docker", "typescript", "java"];
  const foundSkills = skillsList.filter((s) => text.toLowerCase().includes(s));

  return {
    rawText: text,
    emails,
    phones,
    name,
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

    // Heuristic name extraction
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const titleCase = (s: string) => s
      .split(/\s+/)
      .map((w) => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w)
      .join(" ");

    const nameFromEmail = (email: string | undefined) => {
      if (!email) return "";
      const local = email.split("@")[0];
      const parts = local.split(/[._-]+/).filter(Boolean);
      if (!parts.length) return "";
      return titleCase(parts.join(" "));
    };

    // Try explicit "Name:" pattern
    const nameMatch = text.match(/(?:^|\n)\s*Name\s*[:\-]\s*(.+)/i);
    let extractedName = nameMatch ? nameMatch[1].split(/\r?\n/)[0].trim() : "";

    // Fallback: first plausible proper-case line
    if (!extractedName) {
      const isLikelyName = (l: string) => {
        // exclude lines with emails/phones or common section headers
        if (emailRegex.test(l) || phoneRegex.test(l)) return false;
        const headerKeywords = /summary|experience|education|skills|projects|certifications|profile|objective/i;
        if (headerKeywords.test(l)) return false;
        // Typical name pattern: 2-4 words starting uppercase and mostly alphabetic
        const properCasePattern = /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}$/;
        return properCasePattern.test(l);
      };
      const candidate = lines.find(isLikelyName);
      if (candidate) extractedName = candidate;
    }

    // Fallback: derive from email local-part
    if (!extractedName) {
      extractedName = nameFromEmail(emails[0]);
    }

    // Final cleanup
    const name = extractedName ? titleCase(extractedName) : "";

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
      name,
      emails,
      phones,
      skills: [...new Set(foundSkills)],
      summary: text.split("\n").slice(0, 5).join(" "),
    };
  } catch (err: unknown) {
    console.error("Resume parsing error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to parse resume: ${message}`);
  }
}
