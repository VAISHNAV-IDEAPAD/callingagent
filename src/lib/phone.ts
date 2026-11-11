export interface PhoneValidationResult {
  valid: boolean;
  clean10Digits: string;
  e164: string;
  formatted: string;
  operatorHint?: string;
  error?: string;
}

export function validateIndianMobile(raw: string): PhoneValidationResult {
  if (!raw || typeof raw !== "string") {
    return {
      valid: false,
      clean10Digits: "",
      e164: "",
      formatted: "",
      error: "Phone number is required.",
    };
  }

  // Strip non-digits except initial +
  let cleaned = raw.trim().replace(/[^\d+]/g, "");

  // Strip country prefixes
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  if (cleaned.length !== 10) {
    return {
      valid: false,
      clean10Digits: cleaned,
      e164: "",
      formatted: cleaned,
      error: `Must be exactly 10 digits (currently ${cleaned.length} digits).`,
    };
  }

  const firstDigit = cleaned[0];
  if (!["6", "7", "8", "9"].includes(firstDigit)) {
    return {
      valid: false,
      clean10Digits: cleaned,
      e164: "",
      formatted: cleaned,
      error: "Indian mobile numbers start with 6, 7, 8, or 9.",
    };
  }

  // Quick series indicator
  let operatorHint = "Indian Mobile";
  if (["98", "99", "97", "96"].includes(cleaned.substring(0, 2))) {
    operatorHint = "GSM Mobile Series";
  } else if (["70", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89"].includes(cleaned.substring(0, 2))) {
    operatorHint = "4G/5G Cellular Series";
  } else if (firstDigit === "6") {
    operatorHint = "New 6-Series Cellular";
  }

  const formatted = `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  const e164 = `+91${cleaned}`;

  return {
    valid: true,
    clean10Digits: cleaned,
    e164,
    formatted,
    operatorHint,
  };
}

export function parseBatchNumbers(text: string): string[] {
  if (!text) return [];
  // Split on newlines, commas, semicolons, tabs
  return text
    .split(/[\r\n,;\t]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
