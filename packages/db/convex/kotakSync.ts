import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";

export const syncHoldings = action({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.kotakHelpers.getAccount, {
      accountId: args.accountId,
    });

    if (!account || !account.apiConfig) {
      throw new Error("Account not found or not configured");
    }

    const config = account.apiConfig.config as Record<string, string>;
    const dynamicBaseUrl = config.dynamicBaseUrl;
    const sid = config.sid;
    const tradeToken = config.tradeToken;

    if (!dynamicBaseUrl || !sid || !tradeToken) {
      throw new Error(
        "Kotak session expired. Please re-authenticate from Settings."
      );
    }

    const res = await fetch(`${dynamicBaseUrl}/portfolio/v1/holdings`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Sid: sid,
        Auth: tradeToken,
        "neo-fin-key": "neotradeapi",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 403 || res.status === 401) {
        await ctx.runMutation(api.accounts.markExpired, {
          accountId: args.accountId,
        });
        throw new Error(`Kotak session expired. Please reconnect your Kotak account.`);
      }
      throw new Error(`Kotak holdings fetch failed: ${res.status} ${text}`);
    }

    const body = (await res.json()) as {
      data: Array<{
        symbol: string;
        displaySymbol: string;
        instrumentName: string;
        quantity: number;
        averagePrice: number;
        closingPrice: number;
        mktValue: number;
        unrealisedGainLoss: number;
      }>;
    };

    const holdings = body.data || [];

    for (const h of holdings) {
      await ctx.runMutation(api.investmentHoldings.upsert, {
        accountId: args.accountId,
        symbol: h.symbol,
        name: h.instrumentName || h.displaySymbol || h.symbol,
        quantity: h.quantity,
        avgBuyPrice: h.averagePrice,
        lastPrice: h.closingPrice,
        currentValue: h.mktValue,
        pnl: h.unrealisedGainLoss,
      });
    }

    await ctx.runMutation(api.accounts.updateSync, {
      id: args.accountId,
      lastSyncedAt: new Date().toISOString(),
      balance: holdings.reduce((sum, h) => sum + h.mktValue, 0),
    });

    return { count: holdings.length };
  },
});
