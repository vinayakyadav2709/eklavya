import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pillars").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pillars", {
      ...args,
      userId: "temp-user",
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("pillars"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
