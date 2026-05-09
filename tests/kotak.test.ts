import { expect, test, describe } from "bun:test";
import { $ } from "bun";

const consumerKey = process.env.KOTAK_NEO_CONSUMER_KEY || "";
const mobileNumber = process.env.KOTAK_NEO_USERNAME || "";
const ucc = process.env.KOTAK_NEO_UCC || "";
const mpin = process.env.KOTAK_NEO_MPIN || "";

const LOGIN_BASE_URL = "https://mis.kotaksecurities.com";
let dynamicBaseUrl = ""; // Populated during MPIN step

// Helper for native API calls
async function neoFetch(baseUrl: string, endpoint: string, method: string, headers: any = {}, body?: any) {
  const url = `${baseUrl}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: headers,
  };

  if (body) {
    if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
      options.body = new URLSearchParams(body).toString();
    } else {
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok || (data && data.status === "error") || (data && data.stat === "Not_Ok")) {
    console.error(`[!] API Error on ${endpoint}`);
    console.error(JSON.stringify(data, null, 2));
    throw new Error(`Kotak Neo API Error: ${response.status}`);
  }
  
  return data;
}

describe("Kotak Neo API Data Fetch", () => {
  test("Fetch holdings via native fetch calls", async () => {
    // 1. Validation
    if (!consumerKey || !mobileNumber || !ucc || !mpin) {
      throw new Error("Missing required Kotak Neo environment variables (.env). Ensure KOTAK_NEO_USERNAME, KOTAK_NEO_UCC, KOTAK_NEO_MPIN, and KOTAK_NEO_CONSUMER_KEY are set.");
    }

    console.log(`\n[+] Initializing Kotak Neo API Flow...`);

    // 2. Ask for TOTP 
    let totp = process.env.KOTAK_NEO_TOTP;
    
    if (!totp) {
        console.log("\n[!] Please enter your 6-digit Kotak Neo TOTP:");
        const { stdout } = await $`bun run scripts/ask-totp.ts`;
        const outputString = stdout.toString().trim();
        const match = outputString.match(/\d{6}/);
        if (match) {
            totp = match[0];
            console.log(`[+] Received TOTP: ${totp}`);
        } else {
             console.error(`[-] Could not extract TOTP from output: ${outputString}`);
        }
    }

    if (!totp || totp.length !== 6) {
      throw new Error("Invalid TOTP. It must be a 6 digit code.");
    }

    let viewToken = "";
    let sid = "";

    // 3. Step 1: TOTP Login
    console.log(`\n[+] Step 1: Validating TOTP & generating View Token...`);
    try {
      const totpResponse = await neoFetch(LOGIN_BASE_URL, "/login/1.0/tradeApiLogin", "POST", {
        "Authorization": consumerKey, // Restored to plain token as per documentation
        "neo-fin-key": "neotradeapi",
        "Content-Type": "application/json"
      }, {
        mobileNumber,
        ucc,
        totp
      });

      if (totpResponse?.data?.token && totpResponse?.data?.sid) {
          viewToken = totpResponse.data.token;
          sid = totpResponse.data.sid;
          console.log(`[+] Success! Received View Token & SID.`);
      } else {
          console.error(JSON.stringify(totpResponse, null, 2));
          throw new Error("Missing token or sid in TOTP response");
      }

    } catch (err) {
      console.error("\n[-] TOTP Validation Failed.");
      throw err;
    }

    // 4. Step 2: MPIN Validate (Generates Trade Token and BaseURL)
    let tradeToken = "";
    console.log(`\n[+] Step 2: Validating MPIN & generating Trade Token...`);
    try {
      const mpinResponse = await neoFetch(LOGIN_BASE_URL, "/login/1.0/tradeApiValidate", "POST", {
        "Authorization": consumerKey,
        "neo-fin-key": "neotradeapi",
        "sid": sid,
        "Auth": viewToken,
        "Content-Type": "application/json"
      }, {
        mpin
      });

      if (mpinResponse?.data?.token && mpinResponse?.data?.baseUrl) {
          tradeToken = mpinResponse.data.token;
          sid = mpinResponse.data.sid; // Might be a new SID, keep it updated
          dynamicBaseUrl = mpinResponse.data.baseUrl;
          console.log(`[+] Success! Received Trade Token & Dynamic Base URL.`);
      } else {
          console.error(JSON.stringify(mpinResponse, null, 2));
          throw new Error("Missing token or baseUrl in MPIN response");
      }

    } catch (err) {
      console.error("\n[-] MPIN Validation Failed.");
      throw err;
    }

    // 5. Fetch Holdings
    console.log(`\n[+] Fetching Holdings using dynamic URL: ${dynamicBaseUrl}...`);
    try {
      const holdingsResponse = await neoFetch(dynamicBaseUrl, "/portfolio/v1/holdings", "GET", {
        "accept": "application/json",
        "Sid": sid,
        "Auth": tradeToken,
        "neo-fin-key": "neotradeapi"
      });

      console.log("\n[=============== KOTAK HOLDINGS ===============]");
      console.log(JSON.stringify(holdingsResponse?.data || holdingsResponse, null, 2));
      console.log("[========================================]\n");
      
      expect(holdingsResponse).toBeDefined();

    } catch (err: any) {
       console.error("\n[-] Failed to fetch holdings.");
       throw err;
    }

  }, 120000); // 2 minute timeout
});