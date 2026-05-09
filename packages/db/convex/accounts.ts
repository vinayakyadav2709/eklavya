import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    // For now, return all accounts since we removed auth.
    // We can filter by user later.
    return await ctx.db.query("accounts").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("liquid"),
      v.literal("investment"),
      v.literal("credit"),
      v.literal("entity")
    ),
    balance: v.number(),
    institution: v.optional(v.string()),
    isLiability: v.boolean(),
    providerId: v.optional(v.id("providers")),
    lastSyncedAt: v.optional(v.string()),
    apiConfig: v.optional(
      v.object({
        status: v.string(),
        config: v.any(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("accounts", {
      ...args,
      userId: "temp-user", // Temporary placeholder until auth is added back
    });
  },
});

export const updateSync = mutation({
  args: {
    id: v.id("accounts"),
    providerId: v.optional(v.id("providers")),
    lastSyncedAt: v.string(),
    apiConfig: v.optional(
      v.object({
        status: v.string(),
        config: v.any(),
      })
    ),
    balance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return await ctx.db.patch(id, fields);
  },
});

export const saveKiteCredentials = mutation({
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

export const saveRequestToken = mutation({
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

export const saveKotakCredentials = mutation({
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
