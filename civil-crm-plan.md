# Personal Civil Advocacy Tool Plan

## High-Level Features Summary

This Personal Civil Advocacy Tool aims to empower individuals to effectively engage with their representatives and track their advocacy efforts. Key features include:

-   **Personal Dashboard**: Track your advocacy journey, upcoming tasks, and recent interactions with representatives.
-   **Representative Directory**: Access and manage your database of elected officials, including contact information and interaction history.
-   **Issue Tracking**: Define and track the issues you care about, set priorities, and monitor progress.
-   **Interaction Logging**: Record your communications and meetings with representatives, including outcomes and follow-ups.
-   **Task Management**: Create and track personal tasks and follow-ups for your advocacy work.
-   **Progress Tracking**: Monitor your engagement effectiveness and track outcomes of your advocacy efforts.
-   **External Data Integration**: Automatically populate and update representative data using public APIs (e.g., Google Civic, OpenStates).
-   **Communication Tools**: Streamline your outreach with email templates, SMS reminders, and calendar scheduling.
-   **Smart Reminders**: Get timely notifications for follow-ups, upcoming votes, and important deadlines.
-   **AI Writing Assistant**: Get real-time feedback on your messages to representatives, with suggestions for clarity, effectiveness, and tone while maintaining your authentic voice.

## Schema Design

```typescript
// User profile
user: {
  name: string,
  email: string,
  preferences: {
    notification_settings: {
      email: boolean,
      sms?: boolean,
      push?: boolean
    },
    default_reminder_time?: number // hours before due date
  }
}

// Representatives (elected officials, staff)
representatives: {
  name: string,
  title: string,
  office: string,
  level: "federal" | "state" | "local",
  district?: string,
  contactInfo: {
    email?: string,
    phone?: string,
    office_address?: string
  },
  notes?: string, // personal notes about the representative
  communication_preferences?: {
    preferred_style?: "formal" | "casual",
    key_interests?: string[],
    best_practices?: string[] // learned from successful interactions
  }
}

// Issues you're tracking
issues: {
  title: string,
  description: string,
  status: "active" | "monitoring" | "archived",
  priority: "high" | "medium" | "low",
  tags: string[],
  target_date?: number, // timestamp for any relevant deadline
  notes: string
}

// Interactions with representatives
interactions: {
  representative_id: Id<"representatives">,
  issue_id?: Id<"issues">,
  type: "call" | "email" | "meeting" | "letter",
  date: number, // timestamp
  notes: string,
  outcome: "positive" | "neutral" | "negative" | "no_response",
  follow_up_needed: boolean,
  message_feedback?: {
    original_draft?: string,
    final_version?: string,
    what_worked?: string[] // store successful communication patterns
  }
}

// Follow-ups for your interactions
followups: {
  interaction_id: Id<"interactions">,
  due_date: number,
  type: "call" | "email" | "meeting",
  status: "pending" | "completed" | "cancelled",
  notes?: string,
  reminder_sent: boolean
}

// Personal tasks
tasks: {
  title: string,
  description: string,
  due_date: number,
  issue_id?: Id<"issues">,
  status: "todo" | "in_progress" | "done",
  priority: "high" | "medium" | "low"
}
```

## API Design

### Public Queries
```typescript
// Representatives
listMyRepresentatives(filters?: { level?: string, district?: string })
searchRepresentatives(query: string)
getRepresentativeDetails(id: Id<"representatives">)

// Issues
listMyIssues(filters?: { status?: string, priority?: string })
getIssueDetails(id: Id<"issues">)
searchIssues(query: string)

// Interactions
listMyInteractions(filters?: { 
  representative_id?: Id<"representatives">,
  issue_id?: Id<"issues">,
  date_range?: { start: number, end: number }
})
getInteractionDetails(id: Id<"interactions">)

// Tasks & Follow-ups
listMyTasks(filters?: { status?: string })
listMyUpcomingFollowups()
```

### Public Mutations
```typescript
// User Profile
updateProfile(data: Partial<UserData>)
updateNotificationPreferences(preferences: NotificationPreferences)

// Representatives
addRepresentative(data: RepresentativeData)
updateRepresentative(id: Id<"representatives">, data: Partial<RepresentativeData>)
addPersonalNotes(id: Id<"representatives">, notes: string)

// Issues
createIssue(data: IssueData)
updateIssue(id: Id<"issues">, data: Partial<IssueData>)
archiveIssue(id: Id<"issues">)

// Interactions
logInteraction(data: InteractionData)
updateInteraction(id: Id<"interactions">, data: Partial<InteractionData>)

// Tasks & Follow-ups
createTask(data: TaskData)
updateTaskStatus(id: Id<"tasks">, status: string)
scheduleFollowup(data: FollowupData)
completeFollowup(id: Id<"followups">)

// Message Assistant
analyzeMessageDraft(args: {
  draft: string,
  representative_id: Id<"representatives">,
  issue_id?: Id<"issues">
})
saveCommunicationPreferences(
  representative_id: Id<"representatives">,
  preferences: CommunicationPreferences
)
```

### Internal Functions
```typescript
// Notifications
sendFollowupReminder(followup_id: Id<"followups">)
checkUpcomingDeadlines()

// Data Processing
generatePersonalReport(date_range: { start: number, end: number })
calculateAdvocacyStats()

// AI Assistant
generateMessageFeedback(args: {
  draft: string,
  context: {
    representative_id: Id<"representatives">,
    issue_id?: Id<"issues">,
    previous_successful_interactions?: boolean
  }
}): Promise<{
  tone_suggestions: string[],
  clarity_improvements: string[],
  effectiveness_tips: string[],
  structure_feedback: string[],
  custom_insights: string[]
}>

analyzeSuccessfulInteractions(
  representative_id: Id<"representatives">
): Promise<{
  patterns: string[],
  effective_approaches: string[],
  recommended_practices: string[]
}>
```

## Frontend Components

### Core Pages
- Personal Dashboard
  - Activity feed
  - Upcoming tasks/follow-ups
  - Issue status overview
  - Quick action buttons
- Representatives Directory
  - List/grid view with filters
  - Search interface
  - Individual profile pages with interaction history
- Issue Tracker
  - Priority-based list view
  - Issue detail pages with related interactions
  - Progress timeline
- Interaction Logger
  - Quick entry form
  - Detailed interaction view
  - Follow-up scheduler
- Task Management
  - Personal task list
  - Calendar view
  - Follow-up manager

### New Message Assistant Components
- MessageEditor
  - Real-time feedback panel
  - Suggestion highlighting
  - Accept/reject suggestion buttons
  - Feedback categories filter
- CommunicationInsights
  - Representative-specific tips
  - Success patterns display
  - Best practices guide
- FeedbackPreferences
  - Feedback intensity settings
  - Focus areas selection
  - Custom rules input

### Reusable Components
- SearchBar
- FilterPanel
- StatusBadge
- DateTimePicker
- NotificationBell
- ActionMenu
- ConfirmationDialog
- ReminderSetter
- AIFeedbackCard
- SuggestionHighlight
- ToneIndicator
- EffectivenessScore

## External Integrations

1. **Representative Data**
   - Google Civic Information API
   - OpenStates API
   - ProPublica Congress API

2. **Personal Communication**
   - Email templates
   - SMS notifications (optional)
   - Calendar integration

3. **Data Enrichment**
   - News API for representative/issue tracking
   - Legislative tracking APIs
   - Vote records APIs

4. **AI Services**
   - OpenAI GPT-4 for message analysis
   - Custom fine-tuned models for advocacy-specific feedback
   - Tone and clarity analysis APIs

## Development Phases

### Phase 1: Core Personal Infrastructure
- User profile system
- Representative directory
- Basic interaction logging

### Phase 2: Issue Management
- Personal issue tracking
- Enhanced interaction logging
- Basic progress tracking

### Phase 3: Personal Task Management
- Task system
- Follow-up scheduling
- Smart notification system

### Phase 4: AI Writing Assistant
- Basic message feedback system
- Tone and clarity analysis
- Representative-specific insights
- Success pattern learning

### Phase 5: Analytics & Insights
- Personal engagement metrics
- Progress tracking
- Basic reporting

### Phase 6: Integration & Enhancement
- External API integrations
- Mobile optimization
- Advanced search/filter capabilities

## AI Writing Assistant Guidelines

### Feedback Principles
1. **Preserve Authentic Voice**
   - Never rewrite the entire message
   - Focus on enhancing clarity and effectiveness
   - Maintain the writer's personal style and tone

2. **Context-Aware Suggestions**
   - Consider representative's background and preferences
   - Account for issue sensitivity and urgency
   - Reference successful past interactions

3. **Constructive Feedback Categories**
   - Clarity and conciseness
   - Tone appropriateness
   - Structure and organization
   - Persuasiveness
   - Call-to-action effectiveness

4. **Learning and Adaptation**
   - Track which suggestions are accepted/rejected
   - Learn from successful interactions
   - Build representative-specific communication profiles

5. **Privacy and Security**
   - No storage of message content without explicit consent
   - Local processing where possible
   - Clear data usage policies