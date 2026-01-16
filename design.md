# Revision Timeline Web App - Design Style Guide

## Design Philosophy

### Minimalist Flat UI Principles
- **Simplicity First**: Every element serves a clear functional purpose
- **Clean Typography**: Bold, readable fonts with clear hierarchy
- **Neutral Palette**: Muted, professional colors with high contrast for readability
- **Geometric Precision**: Sharp edges, consistent spacing, mathematical proportions
- **No Unnecessary Decoration**: Focus on content and functionality over ornamentation

### Color Palette
**Primary Colors:**
- **Background**: #FAFAFA (Warm white)
- **Primary Text**: #2D3748 (Dark charcoal)
- **Secondary Text**: #718096 (Medium gray)
- **Accent**: #4A5568 (Slate gray)

**Status Colors:**
- **Completed**: #38A169 (Forest green)
- **Current**: #3182CE (Blue)
- **Pending**: #E2E8F0 (Light gray)
- **Hover**: #CBD5E0 (Medium gray)

**Difficulty Indicators:**
- **Foundation**: #68D391 (Light green)
- **Intermediate**: #F6AD55 (Amber)
- **Advanced**: #FC8181 (Light red)

### Typography
**Primary Font**: Inter (Sans-serif)
- **Display Text**: 700 weight, 2.5rem (40px) - Daily topic title
- **Heading 1**: 600 weight, 1.875rem (30px) - Page titles
- **Heading 2**: 600 weight, 1.5rem (24px) - Section headers
- **Body Text**: 400 weight, 1rem (16px) - General content
- **Small Text**: 400 weight, 0.875rem (14px) - Dates, metadata

**Monospace Font**: JetBrains Mono
- **Code/Data**: 400 weight, 0.875rem (14px) - Technical content

## Visual Effects & Styling

### Used Libraries & Effects
1. **Anime.js**: Smooth progress dot movement and micro-interactions
2. **ECharts.js**: Clean data visualization for progress charts
3. **Splitting.js**: Text animation effects for topic transitions
4. **Matter.js**: Subtle physics-based hover effects on timeline

### Animation Strategy
- **Progress Dot**: Smooth linear movement along timeline using Anime.js
- **Topic Transitions**: Fade-in/fade-out with subtle slide using Splitting.js
- **Hover States**: Gentle scale and color transitions (150ms duration)
- **Loading States**: Subtle pulse animation for data loading

### Header Effect
- **Clean Navigation**: Fixed top navigation with subtle shadow
- **Progress Indicator**: Thin progress bar showing overall completion
- **Date Display**: Current date prominently displayed with calendar icon

### Timeline Styling
- **Horizontal Line**: 4px solid line in light gray (#E2E8F0)
- **Progress Dot**: 16px circle with subtle shadow and border
- **Date Markers**: Small vertical ticks at 7-day intervals
- **Hover Zones**: Invisible 40px tall interaction areas for precise hovering

### Card Design
- **Topic Cards**: Clean white background with subtle border
- **Shadow**: 0 1px 3px rgba(0,0,0,0.1) for depth
- **Border Radius**: 8px for modern, friendly appearance
- **Padding**: 24px for comfortable content spacing

### Interactive Elements
- **Buttons**: Solid background with hover state darkening
- **Links**: Underline on hover with smooth transition
- **Form Inputs**: Clean borders with focus state highlighting
- **Tooltips**: Small, contextual information boxes with arrow pointers

## Layout & Spacing

### Grid System
- **Container Max Width**: 1200px
- **Gutter**: 24px between columns
- **Section Padding**: 48px vertical, 24px horizontal
- **Mobile Breakpoint**: 768px

### Vertical Rhythm
- **Base Line Height**: 1.5
- **Section Spacing**: 48px
- **Component Spacing**: 24px
- **Element Spacing**: 16px
- **Micro Spacing**: 8px

### Responsive Behavior
- **Desktop**: Full horizontal timeline with side-by-side content
- **Tablet**: Stacked layout with maintained timeline proportions
- **Mobile**: Vertical timeline with swipe navigation

## Component Specifications

### Timeline Component
- **Height**: 120px total (40px interaction zone + 80px content)
- **Line Thickness**: 4px
- **Dot Size**: 16px diameter
- **Tooltip**: 200px width, auto height, 8px border radius

### Daily Focus Display
- **Container**: Full width, 200px minimum height
- **Title**: 2.5rem font size, bold weight
- **Subtitle**: 1rem font size, medium weight
- **Action Button**: 48px height, full width on mobile

### Navigation
- **Header Height**: 64px
- **Logo**: 32px height
- **Nav Items**: 16px font size, 24px padding
- **Mobile Menu**: Slide-in drawer, 280px width

This design system ensures a cohesive, professional appearance while maintaining the minimalist aesthetic and high functionality required for effective revision planning.