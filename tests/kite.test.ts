import { expect, test, describe } from "bun:test";
import { KiteConnect } from "kiteconnect";
import fs from "fs";

const apiKey = process.env.KITE_API_KEY || "";
const apiSecret = process.env.KITE_API_SECRET || "";
let accessTokenEnv = process.env.KITE_ACCESS_TOKEN || "";

describe("Kite Connect API Data Fetch", () => {
  // Set a 5-minute timeout (300000ms) to give you plenty of time to log in via the browser
  test("Fetch user profile and holdings", async () => {
    if (!apiKey || !apiSecret) {
      throw new Error("KITE_API_KEY and KITE_API_SECRET are required in your .env file!");
    }

    const kc = new KiteConnect({ api_key: apiKey });

    // 1. If no access token exists, start the local server and wait for the login callback
    if (!accessTokenEnv) {
      console.log(`\n[!] Access token missing. Starting local server to catch login callback...`);
      
      accessTokenEnv = await new Promise<string>((resolve, reject) => {
        const PORT = 3000;
        
        const server = Bun.serve({
          port: PORT,
          async fetch(req) {
            const url = new URL(req.url);
            
            if (url.pathname === "/callback") {
              const requestToken = url.searchParams.get("request_token");
              if (!requestToken) {
                return new Response("No request token found.", { status: 400 });
              }

              console.log(`\n[+] Received Request Token. Exchanging for Access Token...`);
              try {
                const session = await kc.generateSession(requestToken, apiSecret);
                const accessToken = session.access_token;
                
                // Automatically save it to the .env file
                let envData = fs.existsSync(".env") ? fs.readFileSync(".env", "utf-8") : "";
                if (envData.includes("KITE_ACCESS_TOKEN=")) {
                  envData = envData.replace(/KITE_ACCESS_TOKEN=.*/g, `KITE_ACCESS_TOKEN=${accessToken}`);
                } else {
                  envData += `\nKITE_ACCESS_TOKEN=${accessToken}\n`;
                }
                fs.writeFileSync(".env", envData);

                // Wait slightly before closing the server to ensure the response gets sent
                setTimeout(() => server.stop(), 500);
                resolve(accessToken);
                
                return new Response("<h1>Authentication Successful!</h1><p>You can close this tab and return to terminal. The test will now resume automatically.</p>", {
                  headers: { "Content-Type": "text/html" }
                });
              } catch (err: any) {
                console.error("[-] Failed to generate session.", err);
                reject(err);
                return new Response("Authentication failed. Check your terminal.", { status: 500 });
              }
            }
            
            // If they hit the root or anything else, guide them.
            return new Response("Server is running. Please use the login link in your terminal.", { status: 404 });
          }
        });

        console.log(`\n======================================================`);
        console.log(`[!] ACTION REQUIRED: You must log in to Zerodha.`);
        console.log(`1. Ensure your Kite Developer Console Redirect URL is set to:`);
        console.log(`   http://127.0.0.1:${PORT}/callback`);
        console.log(`2. Click the link below to login:`);
        console.log(`   ${kc.getLoginURL()}`);
        console.log(`======================================================\n`);
        console.log(`Waiting for login callback... (You have 5 minutes)`);
      });
    }

    // 2. Set the token and authenticate the client
    console.log(`\n[+] Using Access Token to authenticate...`);
    kc.setAccessToken(accessTokenEnv);

    // 3. Fetch User Profile
    console.log("\n[+] Fetching Profile...");
    try {
      const profile = await kc.getProfile();
      console.log("\n[============= USER PROFILE =============]");
      console.log(JSON.stringify(profile, null, 2));
      console.log("[========================================]\n");
      expect(profile).toBeDefined();
    } catch (err: any) {
       console.error("\n[-] Failed to fetch profile. Your token might be expired. Delete KITE_ACCESS_TOKEN from .env to force a re-login.");
       throw err;
    }

    // 4. Fetch Holdings
    console.log("\n[+] Fetching Holdings...");
    const holdings = await kc.getHoldings();
    console.log("\n[=============== HOLDINGS ===============]");
    console.log(JSON.stringify(holdings, null, 2));
    console.log(`\n[+] Summary: Found ${holdings.length} holding(s).`);
    console.log("[========================================]\n");
    expect(Array.isArray(holdings)).toBe(true);

  }, 300000); // 5 minute timeout for user to log in
});
