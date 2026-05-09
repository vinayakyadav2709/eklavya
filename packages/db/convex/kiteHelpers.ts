import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getAccountById = internalQuery({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});

export const setApiCredentials = internalMutation({
  args: {
    accountId: v.id("accounts"),
    apiKey: v.string(),
    apiSecret: v.string(),
    redirectUrl: v.optional(v.string()),
    providerId: v.optional(v.id("providers")),
  },
  handler: async (ctx, args) => {
    const config: Record<string, string> = {
      apiKey: args.apiKey,
      apiSecret: args.apiSecret,
    };
    if (args.redirectUrl) {
      config.redirectUrl = args.redirectUrl;
    }
    return await ctx.db.patch(args.accountId, {
      providerId: args.providerId,
      apiConfig: {
        status: "pending",
        config,
      },
    });
  },
});

export const setAccessToken = internalMutation({
  args: {
    accountId: v.id("accounts"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account || !account.apiConfig) {
      throw new Error("Account not found or no apiConfig");
    }
    return await ctx.db.patch(args.accountId, {
      lastSyncedAt: new Date().toISOString(),
      apiConfig: {
        status: "active",
        config: {
          ...account.apiConfig.config,
          accessToken: args.accessToken,
        },
      },
    });
  },
});

export const setRequestToken = internalMutation({
  args: {
    accountId: v.id("accounts"),
    requestToken: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account || !account.apiConfig) {
      throw new Error("Account not found or no apiConfig");
    }
    return await ctx.db.patch(args.accountId, {
      apiConfig: {
        status: "pending",
        config: {
          ...account.apiConfig.config,
          requestToken: args.requestToken,
        },
      },
    });
  },
});

export const getConnectedKiteAccount = internalQuery({
  args: {},
  handler: async (ctx) => {
    const provider = await ctx.db.query("providers")
      .withIndex("by_code", (q) => q.eq("code", "kite"))
      .first();
    if (!provider) return null;

    const accounts = await ctx.db.query("accounts")
      .withIndex("by_provider", (q) => q.eq("providerId", provider._id))
      .collect();

    const activeAccount = accounts.find(
      (a) => a.apiConfig?.status === "active"
    );
    return activeAccount ?? null;
  },
});
