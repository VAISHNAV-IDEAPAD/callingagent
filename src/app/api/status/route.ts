import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get("CallSid");
    const callStatus = formData.get("CallStatus");
    const duration = formData.get("CallDuration");
    const to = formData.get("To");

    console.log(`[Twilio Call Status] SID: ${callSid}, Status: ${callStatus}, Duration: ${duration}s, To: ${to}`);

    return NextResponse.json({ success: true, callSid, callStatus, duration });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Status error";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
