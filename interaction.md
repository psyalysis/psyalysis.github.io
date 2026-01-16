# Revision Timeline Web App - Interaction Design

## Core Interaction Components

### 1. Horizontal Timeline with Progress Indicator
**Primary Interaction**: Visual progress tracking across 60-day period (16/01/2026 - 16/03/2026)
- **Progress Dot**: Automatically positioned based on current system date
- **Hover Interaction**: Hover over any point to reveal date and assigned topic(s)
- **Click Interaction**: Click on timeline to jump to specific date and view detailed topic information
- **Visual States**: Past dates (completed), current date (highlighted), future dates (pending)

### 2. Daily Focus Display
**Primary Interaction**: Large, prominent text showing today's revision topic
- **Auto-update**: Changes automatically when date progresses
- **Topic Details**: Click to expand full learning objectives for current topic
- **Difficulty Indicator**: Color-coded difficulty level (Foundation: Green, Intermediate: Amber, Advanced: Red)

### 3. Topic Navigation System
**Secondary Interaction**: Browse and explore all scheduled topics
- **Calendar Grid**: Monthly view showing topic distribution
- **Topic Cards**: Each topic displayed with title, difficulty, and completion status
- **Filter Controls**: Filter by difficulty level, component (Computer Systems vs Algorithms), or completion status
- **Search Function**: Quick search through all learning objectives

### 4. Progress Tracking Dashboard
**Tertiary Interaction**: Monitor revision progress and statistics
- **Completion Metrics**: Visual progress bars showing percentage completed
- **Difficulty Distribution**: Chart showing balance of foundation/intermediate/advanced topics
- **Streak Counter**: Days of consistent revision
- **Upcoming Milestones**: Preview of next 7 days' topics

## Multi-turn Interaction Loops

### Timeline Exploration Loop
1. User hovers over timeline → Tooltip shows date and topic
2. User clicks on date → Focus shifts to that day's topic
3. User can navigate forward/backward through dates
4. Return to timeline to explore other dates

### Topic Study Loop
1. User views daily topic → Clicks for detailed objectives
2. User can mark topic as "completed" or "needs review"
3. System updates progress metrics
4. User can navigate to next/previous topics

### Progress Review Loop
1. User checks progress dashboard → Views completion statistics
2. User identifies weak areas → Filters topics by difficulty or component
3. User can reschedule topics or adjust timeline
4. System provides recommendations for balanced revision

## Data Interaction Logic

### Automatic Topic Distribution
- 156 learning objectives distributed across 60 days
- 2-3 topics per day (approximately 2.6 topics daily average)
- Balanced difficulty distribution ensuring mix of foundation/intermediate/advanced each week
- Topics grouped by related concepts (e.g., CPU architecture before data types)

### Real-time Updates
- Progress dot position updates based on current date
- Daily focus changes automatically at midnight
- Progress metrics recalculate when topics are marked complete
- Hover tooltips generated dynamically from topic schedule

## Mobile Responsiveness
- Timeline converts to vertical scroll on mobile devices
- Touch-friendly interaction targets (minimum 44px)
- Swipe gestures for date navigation
- Collapsible sections for detailed topic information

## Accessibility Features
- High contrast color scheme for readability
- Keyboard navigation support
- Screen reader compatible labels
- Focus indicators for all interactive elements

## Error Handling
- Graceful degradation if JSON data fails to load
- Fallback topics for dates outside planned range
- Clear messaging for any system errors
- Local storage for user progress data