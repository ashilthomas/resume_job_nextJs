declare module "pdf-parse" {
  interface PDFParseData {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: any;
    version: string;
    text: string;
  }

  function pdf(dataBuffer: Buffer): Promise<PDFParseData>;

  export = pdf;
}
