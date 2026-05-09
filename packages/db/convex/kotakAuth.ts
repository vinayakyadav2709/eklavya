import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

async function neoFetch(
  baseUrl: string,
  endpoint: string,
  method: string,
  headers: Record<string, string> = {},
  body?: Record<string, string>
) {
  const url = `${baseUrl}${endpoint}`;
  const options: RequestInit = { method, headers };

  if (body) {
    if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
      options.body = new URLSearchParams(body).toString();
    } else {
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, options);
  const data = (await res.json()) as Record<string, unknown>;
  return data;
}

export const authenticateKotak = action({
  args: {
    accountId: v.id("accounts"),
    totp: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.kotakHelpers.getAccount, {
      accountId: args.accountId,
    });

    if (!account || !account.apiConfig) {
      throw new Error("Account not found or not configured");
    }

    const config = account.apiConfig.config as Record<string, string>;
    const consumerKey = config.consumerKey;
    const rawMobile = config.mobileNumber;
    const ucc = config.ucc;
    const mpin = config.mpin;

    if (!consumerKey || !rawMobile || !ucc || !mpin) {
      throw new Error("Missing Kotak credentials");
    }

    const mobileNumber = rawMobile.startsWith("+91")
      ? rawMobile
      : rawMobile.startsWith("91")
        ? `+${rawMobile}`
        : `+91${rawMobile}`;

    if (!args.totp || args.totp.length !== 6) {
      throw new Error("TOTP must be a 6-digit code");
    }

    const totpData = await neoFetch(
      "https://mis.kotaksecurities.com",
      "/login/1.0/tradeApiLogin",
      "POST",
      {
        Authorization: consumerKey,
        "neo-fin-key": "neotradeapi",
        "Content-Type": "application/json",
      },
      { mobileNumber, ucc, totp: args.totp }
    );

    const viewToken =
      (totpData as Record<string, Record<string, string>>)?.data?.token;
    const sid =
      (totpData as Record<string, Record<string, string>>)?.data?.sid;

    if (!viewToken || !sid) {
      throw new Error(
        `TOTP login failed: ${JSON.stringify(totpData)}`
      );
    }

    const mpinData = await neoFetch(
      "https://mis.kotaksecurities.com",
      "/login/1.0/tradeApiValidate",
      "POST",
      {
        Authorization: consumerKey,
        "neo-fin-key": "neotradeapi",
        sid,
        Auth: viewToken,
        "Content-Type": "application/json",
      },
      { mpin }
    );

    const tradeToken =
      (mpinData as Record<string, Record<string, string>>)?.data?.token;
    const newSid =
      (mpinData as Record<string, Record<string, string>>)?.data?.sid || sid;
    const dynamicBaseUrl =
      (mpinData as Record<string, Record<string, string>>)?.data?.baseUrl;

    if (!tradeToken || !dynamicBaseUrl) {
      throw new Error(
        `MPIN validation failed: ${JSON.stringify(mpinData)}`
      );
    }

    await ctx.runMutation(internal.kotakHelpers.updateKotakSession, {
      accountId: args.accountId,
      tradeToken,
      sid: newSid,
      dynamicBaseUrl,
    });

    return { success: true };
  },
});
