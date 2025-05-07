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

export const storeUser = mutation({
  args: {}, // No arguments, gets identity from ctx.auth
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name/email has changed, patch the user.
      if (user.name !== identity.name || user.email !== identity.email) {
        await ctx.db.patch(user._id, {
          name: identity.name ?? "Unnamed User", // Use Clerk name or default
          email: identity.email ?? "no-email@example.com", // Use Clerk email or default
        });
      }
      return user._id;
    }

    // If it's a new identity, create a new user.
    const userId = await ctx.db.insert("users", {
      name: identity.name ?? "Unnamed User",
      email: identity.email ?? "no-email@example.com",
      tokenIdentifier: identity.tokenIdentifier,
      // preferences can be set to default values here if desired
    });
    return userId;
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not authenticated, so no profile to get
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    return user; // This can be null if the user document hasn't been created yet
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    // preferences can be added here later
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found, cannot update profile.");
    }

    // Ensure only allowed fields are updated
    const updateData: Partial<Doc<"users">> = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.email !== undefined) updateData.email = args.email;
    // Add preferences update logic here later

    if (Object.keys(updateData).length > 0) {
        await ctx.db.patch(user._id, updateData);
    }
  },
});