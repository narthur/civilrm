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

    representatives: defineTable({
      userId: v.id("users"),
      name: v.string(),
      title: v.string(),
      office: v.string(),
      level: v.union(
        v.literal("federal"),
        v.literal("state"),
        v.literal("local")
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
            v.union(v.literal("formal"), v.literal("casual"))
          ),
          key_interests: v.optional(v.array(v.string())),
          best_practices: v.optional(v.array(v.string())),
        })
      ),
    }).index("by_user", ["userId"]),

    interactions: defineTable({
      userId: v.id("users"),
      representativeId: v.id("representatives"),
      issueId: v.optional(v.id("issues")), // Optional link to an issue
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
    })
    .index("by_user", ["userId"])
    .index("by_representative", ["representativeId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_issue", ["issueId"]), // Index for querying interactions by issue

    issues: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.string(),
      status: v.union(
        v.literal("active"),
        v.literal("monitoring"),
        v.literal("archived"),
        v.literal("resolved"),
        v.literal("blocked")
      ),
      priority: v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      ),
      tags: v.array(v.string()),
      target_date: v.optional(v.number()), // timestamp for any relevant deadline
      notes: v.string(),
      key_points: v.optional(v.array(v.string())), // Added
      success_criteria: v.optional(v.array(v.string())), // Added
    })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_user_status_priority", ["userId", "status", "priority"])
    .index("by_user_target_date", ["userId", "target_date"]),

    tasks: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.string(),
      due_date: v.number(),
      issueId: v.optional(v.id("issues")), // Optional link to an issue
      status: v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done")
      ),
      priority: v.union(
        v.literal("high"),
        v.literal("medium"),
        v.literal("low")
      ),
      reminder_sent: v.boolean(), // Track if a reminder has been sent
    })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_priority", ["userId", "priority"])
    .index("by_user_due_date", ["userId", "due_date"])
    .index("by_issue", ["issueId"]), // For querying tasks related to an issue

    followups: defineTable({
      userId: v.id("users"),
      interactionId: v.id("interactions"), // Link to the interaction this follows up on
      due_date: v.number(),
      type: v.union(
        v.literal("call"),
        v.literal("email"),
        v.literal("meeting")
      ),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
      notes: v.optional(v.string()),
      reminder_sent: v.boolean(), // Track if a reminder has been sent
    })
    .index("by_user", ["userId"])
    .index("by_user_due_date", ["userId", "due_date"])
    .index("by_user_status", ["userId", "status"])
    .index("by_interaction", ["interactionId"]), // For querying follow-ups for an interaction
  },
  {
    schemaValidation: false,
  },
);
