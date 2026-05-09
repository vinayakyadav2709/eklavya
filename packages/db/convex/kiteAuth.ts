import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const generateSession = action({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.kiteHelpers.getAccountById, {
      accountId: args.accountId,
    });

    if (!account || !account.apiConfig) {
      throw new Error("Account not found or not configured with API credentials");
    }

    const config = account.apiConfig.config as Record<string, string>;
    const apiKey = config.apiKey;
    const apiSecret = config.apiSecret;
    const requestToken = config.requestToken;

    if (!apiKey || !apiSecret || !requestToken) {
      throw new Error("Missing API credentials or request token");
    }

    const checksum = await sha256(apiKey + requestToken + apiSecret);

    const body = new URLSearchParams({
      api_key: apiKey,
      request_token: requestToken,
      checksum,
    });

    const res = await fetch("https://api.kite.trade/session/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Kite-Version": "3",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Kite session generation failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as { data: { access_token: string; public_token: string; user_id: string; user_name: string } };

    await ctx.runMutation(internal.kiteHelpers.setAccessToken, {
      accountId: args.accountId,
      accessToken: data.data.access_token,
    });

    return {
      userId: data.data.user_id,
      userName: data.data.user_name,
    };
  },
});
