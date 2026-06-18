import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Load target Spreadsheet ID from env or fallback
const SPREADSHEET_ID = process.env.GOOGLE_LEDGER_SPREADSHEET_ID || "1op1HwZ26KzT9Q6eXp6p7v-G4286hACOS-Ledger";
const SHEET_RANGE = "Ledger!A:F";

/**
 * Generates an OAuth 2.0 access token using a Google Service Account private key
 * without any external dependencies.
 */
async function getGoogleAuthToken(serviceAccount) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // 1 hour expiration

  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: exp,
    iat: iat
  };

  const base64UrlEncode = (obj) => {
    return Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key using RS256
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(serviceAccount.private_key, "base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signingInput}.${signature}`;

  // Request OAuth access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(`Google Auth Token request failed: ${tokenData.error_description || tokenData.error}`);
  }

  return tokenData.access_token;
}

/**
 * Appends a row of values to the configured Google Sheet Ledger.
 */
export async function logPostToLedger(postData) {
  console.log("\n🛰  Appending record to Google Sheets Operator Ledger...");

  const credentialsPath = path.resolve("./private/auth/google-service-account.json");
  let serviceAccount;

  try {
    const rawCreds = await fs.readFile(credentialsPath, "utf8");
    serviceAccount = JSON.parse(rawCreds);
  } catch (err) {
    console.warn("⚠️  Could not locate private/auth/google-service-account.json. Skipping Google Sheets Sync.");
    console.log("👉 Logging locally instead: ", postData);
    return false;
  }

  try {
    const accessToken = await getGoogleAuthToken(serviceAccount);
    
    // Prepare values to append
    const values = [
      [
        new Date().toISOString(),
        postData.postId || "N/A",
        postData.platform || "unknown",
        postData.signature || "unsigned",
        postData.deliveryLink || "none",
        postData.status || "completed"
      ]
    ];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=USER_ENTERED`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values
      })
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(`Google Sheets Append failed: ${JSON.stringify(resData.error)}`);
    }

    console.log("✅ Row successfully appended to Ledger sheet.");
    return true;
  } catch (error) {
    console.error("❌ Google Sheets Ledger Logging failed:", error.message || error);
    return false;
  }
}

// CLI test harness execution
if (process.argv[1] && process.argv[1].endsWith("sheets-logger.mjs")) {
  const dummyPost = {
    postId: "test-cli-id-" + Math.floor(Math.random() * 10000),
    platform: "x-playwright",
    signature: "sip:sig:0x2287F6bcDa112Aae",
    deliveryLink: "https://frankx.ai/blog/faceless-youtube-ai-tools-2026",
    status: "staged"
  };
  logPostToLedger(dummyPost).catch(console.error);
}
