import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// List issues for the current user
export const listMyIssues = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("monitoring"),
        v.literal("archived"),
        v.literal("resolved"),
        v.literal("blocked")
      )
    ),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to listMyIssues");
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

    // Base query using the appropriate index based on filters
    let issuesQuery;

    if (args.status && args.priority) {
      issuesQuery = ctx.db
        .query("issues")
        .withIndex("by_user_status_priority", (q) =>
          q.eq("userId", user._id)
           .eq("status", args.status!) // status is defined here
           .eq("priority", args.priority!) // priority is defined here
        );
    } else if (args.status) {
      issuesQuery = ctx.db
        .query("issues")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id)
           .eq("status", args.status!) // status is defined here
        );
    } else if (args.priority) {
      issuesQuery = ctx.db
        .query("issues")
        .withIndex("by_user_priority", (q) =>
          q.eq("userId", user._id)
           .eq("priority", args.priority!) // priority is defined here
        );
    } else {
      issuesQuery = ctx.db
        .query("issues")
        .withIndex("by_user", (q) => q.eq("userId", user._id));
    }

    return await issuesQuery.collect();
  },
});

// Get details of a specific issue
export const getIssueDetails = query({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getIssueDetails");
    }

    const issue = await ctx.db.get(args.id);
    if (!issue) {
      throw new Error("Issue not found");
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

    // Ensure the issue belongs to the requesting user
    if (issue.userId !== user._id) {
      throw new Error("Unauthorized access to issue");
    }

    return issue;
  },
});

// Create a new issue
export const createIssue = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("monitoring"),
      v.literal("archived"),
      v.literal("resolved"),
      v.literal("blocked")
    ),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    tags: v.array(v.string()),
    target_date: v.optional(v.number()),
    notes: v.string(),
    key_points: v.optional(v.array(v.string())),
    success_criteria: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createIssue");
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

    // Create the issue
    const issueId = await ctx.db.insert("issues", {
      userId: user._id,
      ...args,
    });

    return issueId;
  },
});

// Update an existing issue
export const updateIssue = mutation({
  args: {
    id: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("monitoring"),
        v.literal("archived"),
        v.literal("resolved"),
        v.literal("blocked")
      )
    ),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
    ),
    tags: v.optional(v.array(v.string())),
    target_date: v.optional(v.number()),
    notes: v.optional(v.string()),
    key_points: v.optional(v.array(v.string())),
    success_criteria: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to updateIssue");
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

    // Get the existing issue
    const issue = await ctx.db.get(args.id);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Ensure the issue belongs to the requesting user
    if (issue.userId !== user._id) {
      throw new Error("Unauthorized access to issue");
    }

    // Remove the id from args since we don't want to update it
    const { id, ...updates } = args;

    // Update the issue
    await ctx.db.patch(args.id, updates);
  },
});

// Archive an issue (convenience mutation)
export const archiveIssue = mutation({
  args: { id: v.id("issues") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to archiveIssue");
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

    // Get the existing issue
    const issue = await ctx.db.get(args.id);
    if (!issue) {
      throw new Error("Issue not found");
    }

    // Ensure the issue belongs to the requesting user
    if (issue.userId !== user._id) {
      throw new Error("Unauthorized access to issue");
    }

    // Update the issue status to archived
    await ctx.db.patch(args.id, { status: "archived" });
  },
});