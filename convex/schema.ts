import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    messages: defineTable({
      author: v.string(),
      body: v.string(),
    }),
    users: defineTable({
      name: v.string(),
      email: v.string(),
      tokenIdentifier: v.string(),
      preferences: v.optional(
        v.object({
          notification_settings: v.object({
            email: v.boolean(),
            sms: v.optional(v.boolean()),
            push: v.optional(v.boolean()),
          }),
          default_reminder_time: v.optional(v.number()),
        }),
      ),
    }).index("by_token", ["tokenIdentifier"]),
  },
  {
    schemaValidation: false,
  },
);
