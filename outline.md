# Revision Timeline Web App - Project Outline

## File Structure
```
/mnt/okcomputer/output/
├── index.html              # Main timeline visualization page
├── topics.html             # Detailed topic exploration page
├── progress.html           # Progress tracking dashboard
├── main.js                 # Core JavaScript functionality
├── data.js                 # Learning objectives data and processing
├── resources/              # Static assets folder
│   ├── learning-objectives.json  # OCR Computer Science data
│   └── (images, icons if needed)
├── interaction.md          # Interaction design documentation
├── design.md              # Design style guide
└── outline.md             # This project outline
```

## Page Structure & Functionality

### 1. index.html - Main Timeline Page
**Purpose**: Primary interface showing horizontal timeline with today's focus

**Sections**:
- **Header**: Navigation bar with app title and page links
- **Daily Focus**: Large, prominent display of today's revision topic
- **Timeline Visualization**: Horizontal timeline with progress dot and hover tooltips
- **Quick Stats**: Today's date, days remaining, completion percentage
- **Footer**: Copyright and technical information

**Key Features**:
- Progress dot positioned by current date
- Hover tooltips showing date and topic for any timeline point
- Click to navigate to specific dates
- Responsive design converting to vertical timeline on mobile

### 2. topics.html - Topic Exploration Page
**Purpose**: Browse, search, and explore all learning objectives

**Sections**:
- **Header**: Navigation with search functionality
- **Filter Controls**: Difficulty, component, completion status filters
- **Topic Grid**: Cards showing all 156 learning objectives
- **Topic Details**: Expandable cards with full objective information
- **Pagination**: Load more functionality for performance

**Key Features**:
- Search through all learning objectives
- Filter by difficulty (Foundation/Intermediate/Advanced)
- Filter by component (Computer Systems/Algorithms & Programming)
- Mark topics as completed or needs review
- Sort by date scheduled, difficulty, or alphabetical

### 3. progress.html - Progress Dashboard
**Purpose**: Visual analytics and progress tracking

**Sections**:
- **Header**: Navigation with progress summary
- **Completion Metrics**: Overall percentage and streak counter
- **Difficulty Distribution**: Chart showing balanced coverage
- **Weekly Overview**: 7-day preview of upcoming topics
- **Achievement Badges**: Milestones and consistency rewards
- **Study Calendar**: Monthly view with completion indicators

**Key Features**:
- ECharts.js visualizations for progress data
- Weekly and monthly progress views
- Achievement system for motivation
- Export progress reports
- Study streak tracking

## JavaScript Architecture

### main.js - Core Application Logic
**Functions**:
- `initializeTimeline()`: Set up timeline visualization and interactions
- `updateProgressDot()`: Position progress indicator based on current date
- `handleTimelineHover()`: Show/hide tooltips on timeline interaction
- `loadDailyTopic()`: Display today's revision topic
- `navigateToDate()`: Jump to specific date and update UI
- `initializeAnimations()`: Set up Anime.js animations
- `handleMobileResponsiveness()`: Adapt layout for different screen sizes

### data.js - Data Processing & Management
**Functions**:
- `loadLearningObjectives()`: Parse JSON data and structure topics
- `distributeTopics()`: Evenly distribute 156 objectives across 60 days
- `getTopicForDate()`: Retrieve topic(s) assigned to specific date
- `getDateRange()`: Calculate days between start and end dates
- `calculateProgress()`: Compute completion percentages and statistics
- `saveUserProgress()`: Store completion status in localStorage
- `loadUserProgress()`: Retrieve saved progress data

## Data Flow & Logic

### Topic Distribution Strategy
1. **Total Objectives**: 156 learning objectives
2. **Date Range**: 60 days (16/01/2026 - 16/03/2026)
3. **Daily Allocation**: 2-3 objectives per day (average 2.6)
4. **Difficulty Balance**: Mix of foundation/intermediate/advanced each week
5. **Topic Grouping**: Related concepts scheduled consecutively

### Progress Tracking System
- **Completion Status**: Boolean flag for each objective
- **Review Status**: Mark topics needing additional review
- **Streak Counter**: Consecutive days with activity
- **Time Tracking**: Optional study time logging
- **Achievement System**: Badges for milestones and consistency

## Technical Implementation

### Libraries Integration
1. **Anime.js**: Progress dot movement, micro-interactions
2. **ECharts.js**: Progress charts and data visualization
3. **Splitting.js**: Text animations for topic transitions
4. **Matter.js**: Physics-based hover effects on timeline

### Responsive Design Strategy
- **Desktop (1200px+)**: Full horizontal timeline, side-by-side layouts
- **Tablet (768px-1199px)**: Stacked sections, maintained proportions
- **Mobile (320px-767px)**: Vertical timeline, swipe navigation, collapsible content

### Performance Optimization
- **Lazy Loading**: Load topic details on demand
- **Local Storage**: Cache user progress and preferences
- **Efficient DOM Updates**: Minimize reflows and repaints
- **Image Optimization**: Compress and serve appropriate sizes

## User Experience Flow

### First Visit
1. User lands on timeline page
2. Sees today's topic prominently displayed
3. Progress dot shows current position
4. Can hover timeline to explore future/past topics

### Daily Usage
1. Check today's topic on main page
2. Mark topic as completed after studying
3. Optionally preview upcoming topics
4. Review progress on dashboard page

### Advanced Features
1. Search for specific topics
2. Filter by difficulty or component
3. Track study streaks and achievements
4. Adjust timeline if falling behind

This structure ensures a comprehensive, user-friendly revision planning tool that effectively visualizes the learning journey while maintaining clean, minimalist design principles.