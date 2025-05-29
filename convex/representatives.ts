import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List representatives for the current user
export const listMyRepresentatives = query({
  args: {
    level: v.optional(
      v.union(v.literal("federal"), v.literal("state"), v.literal("local")),
    ),
    district: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to listMyRepresentatives");
    }

    // Get the user's ID from their token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Start building the query
    let representativesQuery = ctx.db
      .query("representatives")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    // Apply filters if provided
    if (args.level) {
      representativesQuery = representativesQuery.filter((q) =>
        q.eq(q.field("level"), args.level!),
      );
    }
    if (args.district) {
      representativesQuery = representativesQuery.filter((q) =>
        q.eq(q.field("district"), args.district!),
      );
    }

    return await representativesQuery.collect();
  },
});

// Get details of a specific representative
export const getRepresentativeDetails = query({
  args: { id: v.id("representatives") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getRepresentativeDetails");
    }

    const representative = await ctx.db.get(args.id);
    if (!representative) {
      throw new Error("Representative not found");
    }

    // Get the user's ID from their token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Ensure the representative belongs to the requesting user
    if (representative.userId !== user._id) {
      throw new Error("Unauthorized access to representative");
    }

    return representative;
  },
});

// Add a new representative
export const addRepresentative = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    office: v.string(),
    level: v.union(
      v.literal("federal"),
      v.literal("state"),
      v.literal("local"),
    ),
    district: v.optional(v.string()),
    contactInfo: v.object({
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      office_address: v.optional(v.string()),
    }),
    notes: v.optional(v.string()),
    communication_preferences: v.optional(
      v.object({
        preferred_style: v.optional(
          v.union(v.literal("formal"), v.literal("casual")),
        ),
        key_interests: v.optional(v.array(v.string())),
        best_practices: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to addRepresentative");
    }

    // Get the user's ID from their token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Create the representative
    const representativeId = await ctx.db.insert("representatives", {
      userId: user._id,
      ...args,
    });

    return representativeId;
  },
});

// Update an existing representative
export const updateRepresentative = mutation({
  args: {
    id: v.id("representatives"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    office: v.optional(v.string()),
    level: v.optional(
      v.union(v.literal("federal"), v.literal("state"), v.literal("local")),
    ),
    district: v.optional(v.string()),
    contactInfo: v.optional(
      v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        office_address: v.optional(v.string()),
      }),
    ),
    notes: v.optional(v.string()),
    communication_preferences: v.optional(
      v.object({
        preferred_style: v.optional(
          v.union(v.literal("formal"), v.literal("casual")),
        ),
        key_interests: v.optional(v.array(v.string())),
        best_practices: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to updateRepresentative");
    }

    // Get the user's ID from their token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the existing representative
    const representative = await ctx.db.get(args.id);
    if (!representative) {
      throw new Error("Representative not found");
    }

    // Ensure the representative belongs to the requesting user
    if (representative.userId !== user._id) {
      throw new Error("Unauthorized access to representative");
    }

    // Remove the id from args since we don't want to update it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updates } = args;

    // Update the representative
    await ctx.db.patch(args.id, updates);
  },
});
