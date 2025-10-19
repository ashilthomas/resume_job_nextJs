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
    // Prefer pdf-parse (fast/simple). Fallback to pdfjs-dist if it fails (e.g., ENOENT quirks)
    try {
      // Dynamically import to avoid bundler evaluating at module load
      const pdfModule: any = await import("pdf-parse");
      const pdfParseFn: (buf: Buffer) => Promise<{ text: string }> =
        (pdfModule && (pdfModule.default as any)) || (pdfModule as any);
      const data = await pdfParseFn(fileBuffer);
      return data.text;
    } catch (primaryErr: any) {
      // Robust fallback using pdfjs-dist to read from in-memory buffer only
      try {
        const pdfjsLib: any = await import("pdfjs-dist");
        const pdfjs: any = (pdfjsLib as any).default ?? pdfjsLib;
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer) });
        const pdf = await loadingTask.promise;

        const pageTexts: string[] = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const strings = (content.items || []).map((item: any) =>
            (item && typeof item === "object" && "str" in item) ? (item as any).str : String(item)
          );
          pageTexts.push(strings.join(" "));
        }
        return pageTexts.join("\n");
      } catch (fallbackErr: any) {
        throw new Error(
          `Failed to extract PDF text: ${fallbackErr?.message || primaryErr?.message || "Unknown error"}`
        );
      }
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
}
