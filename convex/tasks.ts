import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List tasks for the current user
export const listMyTasks = query({
  args: {
    status: v.optional(
      v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    ),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
    issueId: v.optional(v.id("issues")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to listMyTasks");
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
    let tasksQuery;

    if (args.status) {
      tasksQuery = ctx.db
        .query("tasks")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", args.status!),
        );
    } else if (args.priority) {
      tasksQuery = ctx.db
        .query("tasks")
        .withIndex("by_user_priority", (q) =>
          q.eq("userId", user._id).eq("priority", args.priority!),
        );
    } else if (args.issueId) {
      tasksQuery = ctx.db
        .query("tasks")
        .withIndex("by_issue", (q) => q.eq("issueId", args.issueId!));
    } else {
      // Default to ordering by due date
      tasksQuery = ctx.db
        .query("tasks")
        .withIndex("by_user_due_date", (q) => q.eq("userId", user._id));
    }

    // Apply additional filters if needed
    if (args.status && !tasksQuery.toString().includes("by_user_status")) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("status"), args.status!),
      );
    }
    if (args.priority && !tasksQuery.toString().includes("by_user_priority")) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("priority"), args.priority!),
      );
    }
    if (args.issueId && !tasksQuery.toString().includes("by_issue")) {
      tasksQuery = tasksQuery.filter((q) =>
        q.eq(q.field("issueId"), args.issueId!),
      );
    }

    // Order by due date ascending (soonest first)
    const finalQuery = tasksQuery.order("asc");

    return await finalQuery.collect();
  },
});

// Get details of a specific task
export const getTaskDetails = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getTaskDetails");
    }

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
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

    // Ensure the task belongs to the requesting user
    if (task.userId !== user._id) {
      throw new Error("Unauthorized access to task");
    }

    return task;
  },
});

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    due_date: v.number(),
    issueId: v.optional(v.id("issues")),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done"),
    ),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createTask");
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

    // If issueId is provided, verify it exists and belongs to the user
    if (args.issueId) {
      const issue = await ctx.db.get(args.issueId);
      if (!issue || issue.userId !== user._id) {
        throw new Error("Invalid issue ID");
      }
    }

    // Create the task
    const taskId = await ctx.db.insert("tasks", {
      userId: user._id,
      reminder_sent: false, // Initialize as false
      ...args,
    });

    return taskId;
  },
});

// Update an existing task
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    due_date: v.optional(v.number()),
    issueId: v.optional(v.id("issues")),
    status: v.optional(
      v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    ),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
    reminder_sent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to updateTask");
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

    // Get the existing task
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Ensure the task belongs to the requesting user
    if (task.userId !== user._id) {
      throw new Error("Unauthorized access to task");
    }

    // If issueId is provided, verify it exists and belongs to the user
    if (args.issueId) {
      const issue = await ctx.db.get(args.issueId);
      if (!issue || issue.userId !== user._id) {
        throw new Error("Invalid issue ID");
      }
    }

    // Remove the id from args since we don't want to update it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updates } = args;

    // Update the task
    await ctx.db.patch(args.id, updates);
  },
});

// Mark a task as done (convenience mutation)
export const completeTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to completeTask");
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

    // Get the existing task
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Ensure the task belongs to the requesting user
    if (task.userId !== user._id) {
      throw new Error("Unauthorized access to task");
    }

    // Update the task status to done
    await ctx.db.patch(args.id, { status: "done" });
  },
});
