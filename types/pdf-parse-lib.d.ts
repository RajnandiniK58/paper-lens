declare module "pdf-parse/lib/pdf-parse.js" {
  function pdfParse(
    dataBuffer: Buffer,
    options?: unknown
  ): Promise<{ text: string; numpages: number }>
  export default pdfParse
}
