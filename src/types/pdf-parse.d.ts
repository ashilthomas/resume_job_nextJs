declare module "pdf-parse" {
  interface PDFParseData {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
    text: string;
  }

  function pdf(dataBuffer: Buffer): Promise<PDFParseData>;

  export = pdf;
}
