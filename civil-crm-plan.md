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
  notes?: string // personal notes about the representative
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
  follow_up_needed: boolean
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
```

### Internal Functions
```typescript
// Notifications
sendFollowupReminder(followup_id: Id<"followups">)
checkUpcomingDeadlines()

// Data Processing
generatePersonalReport(date_range: { start: number, end: number })
calculateAdvocacyStats()
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

### Reusable Components
- SearchBar
- FilterPanel
- StatusBadge
- DateTimePicker
- NotificationBell
- ActionMenu
- ConfirmationDialog
- ReminderSetter

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

### Phase 4: Analytics & Insights
- Personal engagement metrics
- Progress tracking
- Basic reporting

### Phase 5: Integration & Enhancement
- External API integrations
- Mobile optimization
- Advanced search/filter capabilities