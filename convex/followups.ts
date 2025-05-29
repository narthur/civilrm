import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List follow-ups for the current user
export const listMyFollowups = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    interactionId: v.optional(v.id("interactions")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to listMyFollowups");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Base query using the appropriate index based on filters
    let followupsQuery;

    if (args.status) {
      followupsQuery = ctx.db
        .query("followups")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", args.status!),
        );
    } else if (args.interactionId) {
      followupsQuery = ctx.db
        .query("followups")
        .withIndex("by_interaction", (q) =>
          q.eq("interactionId", args.interactionId!),
        );
    } else {
      // Default to ordering by due date
      followupsQuery = ctx.db
        .query("followups")
        .withIndex("by_user_due_date", (q) => q.eq("userId", user._id));
    }

    // Apply additional filters if needed
    if (args.status && !followupsQuery.toString().includes("by_user_status")) {
      followupsQuery = followupsQuery.filter((q) =>
        q.eq(q.field("status"), args.status!),
      );
    }
    if (
      args.interactionId &&
      !followupsQuery.toString().includes("by_interaction")
    ) {
      followupsQuery = followupsQuery.filter((q) =>
        q.eq(q.field("interactionId"), args.interactionId!),
      );
    }

    // Order by due date ascending (soonest first)
    const finalQuery = followupsQuery.order("asc");

    return await finalQuery.collect();
  },
});

// Get details of a specific follow-up
export const getFollowupDetails = query({
  args: { id: v.id("followups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getFollowupDetails");
    }

    const followup = await ctx.db.get(args.id);
    if (!followup) {
      throw new Error("Follow-up not found");
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

    // Ensure the follow-up belongs to the requesting user
    if (followup.userId !== user._id) {
      throw new Error("Unauthorized access to follow-up");
    }

    return followup;
  },
});

// Create a new follow-up
export const createFollowup = mutation({
  args: {
    interactionId: v.id("interactions"),
    due_date: v.number(),
    type: v.union(v.literal("call"), v.literal("email"), v.literal("meeting")),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createFollowup");
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

    // Verify the interaction exists and belongs to the user
    const interaction = await ctx.db.get(args.interactionId);
    if (!interaction || interaction.userId !== user._id) {
      throw new Error("Invalid interaction ID");
    }

    // Create the follow-up
    const followupId = await ctx.db.insert("followups", {
      userId: user._id,
      reminder_sent: false, // Initialize as false
      ...args,
    });

    return followupId;
  },
});

// Update an existing follow-up
export const updateFollowup = mutation({
  args: {
    id: v.id("followups"),
    due_date: v.optional(v.number()),
    type: v.optional(
      v.union(v.literal("call"), v.literal("email"), v.literal("meeting")),
    ),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
    notes: v.optional(v.string()),
    reminder_sent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to updateFollowup");
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

    // Get the existing follow-up
    const followup = await ctx.db.get(args.id);
    if (!followup) {
      throw new Error("Follow-up not found");
    }

    // Ensure the follow-up belongs to the requesting user
    if (followup.userId !== user._id) {
      throw new Error("Unauthorized access to follow-up");
    }

    // Remove the id from args since we don't want to update it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updates } = args;

    // Update the follow-up
    await ctx.db.patch(args.id, updates);
  },
});

// Mark a follow-up as completed (convenience mutation)
export const completeFollowup = mutation({
  args: { id: v.id("followups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to completeFollowup");
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

    // Get the existing follow-up
    const followup = await ctx.db.get(args.id);
    if (!followup) {
      throw new Error("Follow-up not found");
    }

    // Ensure the follow-up belongs to the requesting user
    if (followup.userId !== user._id) {
      throw new Error("Unauthorized access to follow-up");
    }

    // Update the follow-up status to completed
    await ctx.db.patch(args.id, { status: "completed" });
  },
});
