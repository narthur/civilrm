import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// Helper to get or create a user.
// In a real app, this would be tied to authentication.
// For now, we'll just use the first user or create one.
async function getOrCreateUser(ctx: any): Promise<Doc<"users">> {
  const users = await ctx.db.query("users").collect();
  if (users.length > 0) {
    return users[0];
  }
  // Create a default user if none exists
  const userId = await ctx.db.insert("users", {
    name: "New User",
    email: "newuser@example.com",
    // preferences will be undefined initially
  });
  const newUser = await ctx.db.get(userId);
  if (!newUser) throw new Error("Failed to create or get user");
  return newUser;
}

export const getMyProfile = query({
  args: {},
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    // In a real app, you'd use authentication to get the current user.
    // For now, we'll just try to get the first user.
    const users = await ctx.db.query("users").collect();
    if (users.length > 0) {
      return users[0];
    }
    return null; // No user found
  },
});

export const createUser = mutation({
  args: {}, // Or accept initial name/email if desired
  handler: async (ctx): Promise<Id<"users">> => {
    // In a real app, this would be tied to user sign-up and authentication.
    const userId = await ctx.db.insert("users", {
      name: "New User",
      email: "newuser@example.com",
      // preferences will be undefined initially
    });
    return userId;
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    // In a real app, ensure the authenticated user can only update their own profile
    await ctx.db.patch(id, rest);
  },
});