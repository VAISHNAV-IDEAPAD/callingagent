import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const persona = searchParams.get("persona") || "grok_girl";
  const name = searchParams.get("name") || (persona === "grok_girl" ? "Grok Girl" : "Heera");
  const customScript = searchParams.get("script");

  const defaultMsg =
    persona === "grok_girl"
      ? "Hey there! This is Grok Girl, your favorite rebellious AI. Stay curious and have an epic day!"
      : `Hello, my name is ${name}. Have a nice day!`;

  const message = customScript || defaultMsg;

  // For Grok Girl: Neural energetic female voice (Joanna-Neural / Salli-Neural / Kajal-Neural)
  // For Heera: Polly.Aditi Indian English
  const voice =
    persona === "grok_girl"
      ? searchParams.get("voice") || "Polly.Joanna-Neural"
      : searchParams.get("voice") || "Polly.Aditi";

  const language = persona === "grok_girl" ? "en-US" : "en-IN";

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Pause length="1"/>
    <Say voice="${escapeXml(voice)}" language="${escapeXml(language)}">${escapeXml(message)}</Say>
    <Pause length="1"/>
    <Hangup/>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
