import { NextRequest, NextResponse } from "next/server";
import { validateIndianMobile } from "@/lib/phone";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, script, mode, persona = "grok_girl", clientCredentials } = body;

    if (!to) {
      return NextResponse.json({ success: false, error: "Phone number is required." }, { status: 400 });
    }

    const validation = validateIndianMobile(to);
    if (!validation.valid || !validation.e164) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const destinationNumber = validation.e164;
    const defaultScript =
      persona === "grok_girl"
        ? "Hey there! This is Grok Girl, your favorite rebellious AI. Stay curious and have an epic day!"
        : "Hello, my name is Heera. Have a nice day!";
    const callScript = script || defaultScript;

    // Simulation mode
    if (mode === "simulate") {
      // Simulate realistic call timing and response
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        success: true,
        mode: "simulation",
        callSid: "SIM_" + Math.random().toString(36).substring(2, 12).toUpperCase(),
        to: destinationNumber,
        status: "completed",
        persona,
        script: callScript,
        durationSeconds: 6,
        cost: "₹0.00 (Simulated)",
        message: `Simulated call completed: "${callScript}" played in ${persona === "grok_girl" ? "Grok Girl voice" : "Heera voice"}, call disconnected automatically.`,
      });
    }

    // Real Outbound Calling Mode via Twilio
    const accountSid = clientCredentials?.accountSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = clientCredentials?.authToken || process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = clientCredentials?.phoneNumber || process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in settings or test using Simulator mode.",
          missingConfig: true,
        },
        { status: 400 }
      );
    }

    // Determine host for the webhook callback
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const twimlUrl = `${protocol}://${host}/api/twiml?persona=${persona}&script=${encodeURIComponent(callScript)}`;
    const statusUrl = `${protocol}://${host}/api/status`;

    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

    const formData = new URLSearchParams();
    formData.append("To", destinationNumber);
    formData.append("From", twilioPhoneNumber);
    formData.append("Url", twimlUrl);
    formData.append("StatusCallback", statusUrl);
    formData.append("StatusCallbackEvent", "completed");
    formData.append("StatusCallbackMethod", "POST");

    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch(twilioEndpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      let friendlyError = data.message || "Failed to initiate call via Twilio.";

      if (data.code === 21608) {
        friendlyError =
          "Twilio Trial Account Notice: Unverified number. In free trial accounts, you can only call phone numbers verified in your Twilio Console (twilio.com/console/phone-numbers/verified). To call any number, upgrade the account or use Simulator Mode.";
      } else if (data.code === 21211) {
        friendlyError = "Invalid phone number format for destination.";
      } else if (data.code === 20003) {
        friendlyError = "Twilio Authentication failed. Please verify your Account SID and Auth Token.";
      }

      return NextResponse.json(
        {
          success: false,
          error: friendlyError,
          twilioCode: data.code,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      mode: "real",
      callSid: data.sid,
      to: destinationNumber,
      from: data.from,
      status: data.status,
      persona,
      script: callScript,
      created: data.date_created,
      message: `Outbound call initiated to ${destinationNumber}. Script: "${callScript}". Call will automatically disconnect after delivery.`,
    });
  } catch (err: unknown) {
    console.error("Calling error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error while processing call.",
      },
      { status: 500 }
    );
  }
}
