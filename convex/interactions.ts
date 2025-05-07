import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// List interactions for the current user
export const listMyInteractions = query({
  args: {
    representativeId: v.optional(v.id("representatives")),
    issueId: v.optional(v.id("issues")),
    dateRange: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to listMyInteractions");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Base query using the by_user_date index for filtering by user and date range
    let interactionsQuery = ctx.db
      .query("interactions")
      .withIndex("by_user_date", (q) => {
        let dateBuilder = q.eq("userId", user._id);
        if (args.dateRange) {
          // Ensure dateRange is defined before accessing its properties
          return dateBuilder
            .gte("date", args.dateRange.start)
            .lte("date", args.dateRange.end);
        }
        return dateBuilder;
      });

    // If representativeId filter is also needed, apply it.
    // This will be a "post-index" filter if representativeId is not part of the by_user_date index.
    if (args.representativeId) {
      interactionsQuery = interactionsQuery.filter((q) =>
        q.eq(q.field("representativeId"), args.representativeId)
      );
    }

    // If issueId filter is needed, apply it.
    if (args.issueId) {
      interactionsQuery = interactionsQuery.filter((q) =>
        q.eq(q.field("issueId"), args.issueId)
      );
    }

    // Order by date descending. The by_user_date index is ordered by userId, then date (ascending).
    // .order("desc") will reverse this scan order.
    const finalQuery = interactionsQuery.order("desc");

    return await finalQuery.collect();
  },
});

// Get details of a specific interaction
export const getInteractionDetails = query({
  args: { id: v.id("interactions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getInteractionDetails");
    }

    const interaction = await ctx.db.get(args.id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    // Get the user's ID from their token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Ensure the interaction belongs to the requesting user
    if (interaction.userId !== user._id) {
      throw new Error("Unauthorized access to interaction");
    }

    return interaction;
  },
});

// Log a new interaction
export const logInteraction = mutation({
  args: {
    representativeId: v.id("representatives"),
    issueId: v.optional(v.id("issues")),
    type: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("letter")
    ),
    date: v.number(),
    notes: v.string(),
    outcome: v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative"),
      v.literal("no_response")
    ),
    follow_up_needed: v.boolean(),
    message_feedback: v.optional(
      v.object({
        original_draft: v.optional(v.string()),
        final_version: v.optional(v.string()),
        what_worked: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to logInteraction");
    }

    // Get the user's ID from their token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Verify the representative exists and belongs to the user
    const representative = await ctx.db.get(args.representativeId);
    if (!representative || representative.userId !== user._id) {
      throw new Error("Invalid representative ID");
    }

    // If issueId is provided, verify it exists and belongs to the user
    if (args.issueId) {
      const issue = await ctx.db.get(args.issueId);
      if (!issue || issue.userId !== user._id) {
        throw new Error("Invalid issue ID");
      }
    }

    // Create the interaction
    const interactionId = await ctx.db.insert("interactions", {
      userId: user._id,
      ...args,
    });

    return interactionId;
  },
});

// Update an existing interaction
export const updateInteraction = mutation({
  args: {
    id: v.id("interactions"),
    issueId: v.optional(v.id("issues")),
    type: v.optional(
      v.union(
        v.literal("call"),
        v.literal("email"),
        v.literal("meeting"),
        v.literal("letter")
      )
    ),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
    outcome: v.optional(
      v.union(
        v.literal("positive"),
        v.literal("neutral"),
        v.literal("negative"),
        v.literal("no_response")
      )
    ),
    follow_up_needed: v.optional(v.boolean()),
    message_feedback: v.optional(
      v.object({
        original_draft: v.optional(v.string()),
        final_version: v.optional(v.string()),
        what_worked: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to updateInteraction");
    }

    // Get the user's ID from their token
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get the existing interaction
    const interaction = await ctx.db.get(args.id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    // Ensure the interaction belongs to the requesting user
    if (interaction.userId !== user._id) {
      throw new Error("Unauthorized access to interaction");
    }

    // If issueId is provided, verify it exists and belongs to the user
    if (args.issueId) {
      const issue = await ctx.db.get(args.issueId);
      if (!issue || issue.userId !== user._id) {
        throw new Error("Invalid issue ID");
      }
    }

    // Remove the id from args since we don't want to update it
    const { id, ...updates } = args;

    // Update the interaction
    await ctx.db.patch(args.id, updates);
  },
});