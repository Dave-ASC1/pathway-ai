import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { pdfItemsToText } from "@/lib/pdf-text";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

// We read the positioned text runs rather than unpdf's merged string, because
// the merged form flattens every line break into a space. See lib/pdf-text.ts.
async function parsePdf(bytes: Uint8Array): Promise<string> {
  const { extractTextItems, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(bytes);
  const { items } = await extractTextItems(pdf);
  return pdfItemsToText(items);
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = (await import("mammoth")).default;
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, { name: "parse-resume", limit: 15, windowMs: 60000 });
  if (limited) return limited;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Please upload a file under 5 MB." },
      { status: 413 },
    );
  }

  const name = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  try {
    let text = "";
    if (name.endsWith(".pdf")) {
      text = await parsePdf(new Uint8Array(arrayBuffer));
    } else if (name.endsWith(".docx")) {
      text = await parseDocx(Buffer.from(arrayBuffer));
    } else if (name.endsWith(".txt")) {
      text = new TextDecoder().decode(arrayBuffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 415 },
      );
    }

    text = text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      return NextResponse.json(
        { error: "Could not read any text from that file. It may be scanned or image-based." },
        { status: 422 },
      );
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Could not read that file. Please try a different file or paste your resume." },
      { status: 422 },
    );
  }
}
