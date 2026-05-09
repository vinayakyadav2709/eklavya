import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";

export const syncHoldings = action({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.kiteHelpers.getAccountById, {
      accountId: args.accountId,
    });

    if (!account || !account.apiConfig) {
      throw new Error("Account not found or not configured");
    }

    const config = account.apiConfig.config as Record<string, string>;
    const apiKey = config.apiKey;
    const accessToken = config.accessToken;

    if (!apiKey || !accessToken) {
      throw new Error("Missing API key or access token");
    }

    const res = await fetch("https://api.kite.trade/portfolio/holdings", {
      method: "GET",
      headers: {
        Authorization: `token ${apiKey}:${accessToken}`,
        "X-Kite-Version": "3",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Kite holdings fetch failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as {
      data: Array<{
        tradingsymbol: string;
        exchange: string;
        isin: string;
        quantity: number;
        t1_quantity: number;
        average_price: number;
        last_price: number;
        pnl: number;
      }>;
    };

    const holdings = data.data;

    for (const h of holdings) {
      const totalQuantity = h.quantity + h.t1_quantity;
      const currentValue = totalQuantity * h.last_price;

      await ctx.runMutation(api.investmentHoldings.upsert, {
        accountId: args.accountId,
        symbol: h.tradingsymbol,
        name: h.tradingsymbol,
        isin: h.isin || undefined,
        quantity: totalQuantity,
        avgBuyPrice: h.average_price || 0,
        lastPrice: h.last_price,
        currentValue,
        pnl: h.pnl || undefined,
      });
    }

    await ctx.runMutation(api.accounts.updateSync, {
      id: args.accountId,
      lastSyncedAt: new Date().toISOString(),
      balance: holdings.reduce(
        (sum, h) => sum + (h.quantity + h.t1_quantity) * h.last_price,
        0
      ),
    });

    return { count: holdings.length };
  },
});
