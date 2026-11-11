import { NextResponse } from "next/server";

export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  return NextResponse.json({
    configured: Boolean(accountSid && authToken && phoneNumber),
    hasAccountSid: Boolean(accountSid),
    hasPhoneNumber: Boolean(phoneNumber),
    maskedPhoneNumber: phoneNumber ? phoneNumber.slice(0, 4) + "****" + phoneNumber.slice(-3) : null,
  });
}
