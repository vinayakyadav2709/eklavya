import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const saveKotakCredentials = internalMutation({
  args: {
    accountId: v.id("accounts"),
    consumerKey: v.string(),
    mobileNumber: v.string(),
    ucc: v.string(),
    mpin: v.string(),
    providerId: v.optional(v.id("providers")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.accountId, {
      providerId: args.providerId,
      apiConfig: {
        status: "pending",
        config: {
          consumerKey: args.consumerKey,
          mobileNumber: args.mobileNumber,
          ucc: args.ucc,
          mpin: args.mpin,
        },
      },
    });
  },
});

export const updateKotakSession = internalMutation({
  args: {
    accountId: v.id("accounts"),
    tradeToken: v.string(),
    sid: v.string(),
    dynamicBaseUrl: v.string(),
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
          tradeToken: args.tradeToken,
          sid: args.sid,
          dynamicBaseUrl: args.dynamicBaseUrl,
        },
      },
    });
  },
});

export const getAccount = internalQuery({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.accountId);
  },
});
