// Main Application Logic for Revision Timeline
class RevisionTimeline {
    constructor() {
        this.currentDate = new Date();
        this.animationSpeed = 800;
        this.init();
    }

    async init() {
        // Wait for data to load
        await revisionData.init();
        
        // Initialize UI components
        this.updateCurrentDateDisplay();
        this.updateDailyFocus();
        this.renderTimeline();
        this.updateStats();
        this.bindEvents();
        this.initializeAnimations();
        
        console.log('Revision Timeline initialized');
    }

    updateCurrentDateDisplay() {
        const dateElement = document.getElementById('current-date');
        const daysRemainingElement = document.getElementById('days-remaining');
        
        if (dateElement) {
            dateElement.textContent = this.currentDate.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        
        if (daysRemainingElement) {
            const totalDays = revisionData.getTotalDays();
            const daysPassed = Math.floor((this.currentDate - revisionData.startDate) / (1000 * 60 * 60 * 24));
            const daysLeft = totalDays - daysPassed;
            
            daysRemainingElement.textContent = `${daysLeft} days remaining in revision period`;
        }
    }

    updateDailyFocus() {
        const topics = revisionData.getCurrentDateTopics();
        const titleElement = document.getElementById('daily-topic-title');
        const descriptionElement = document.getElementById('daily-topic-description');
        const difficultyBadge = document.getElementById('difficulty-badge');
        const difficultyText = document.getElementById('difficulty-text');
        
        if (topics.length > 0) {
            const primaryTopic = topics[0];
            
            if (titleElement) {
                // Animate title change
                if (titleElement.textContent && titleElement.textContent !== primaryTopic.objective) {
                    anime({
                        targets: titleElement,
                        opacity: [1, 0],
                        duration: 300,
                        easing: 'easeInOutQuad',
                        complete: () => {
                            titleElement.textContent = primaryTopic.objective;
                            anime({
                                targets: titleElement,
                                opacity: [0, 1],
                                duration: 300,
                                easing: 'easeInOutQuad'
                            });
                        }
                    });
                } else {
                    titleElement.textContent = primaryTopic.objective;
                }
            }
            
            if (descriptionElement) {
                descriptionElement.textContent = `${primaryTopic.componentTitle} • ${primaryTopic.topicTitle}`;
            }
            
            if (difficultyBadge && difficultyText) {
                const difficultyColors = {
                    foundation: 'bg-green-100 text-green-800',
                    intermediate: 'bg-yellow-100 text-yellow-800',
                    advanced: 'bg-red-100 text-red-800'
                };
                
                difficultyBadge.className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${difficultyColors[primaryTopic.difficulty]}`;
                difficultyText.textContent = primaryTopic.difficulty.charAt(0).toUpperCase() + primaryTopic.difficulty.slice(1);
                
                // Add colored dot
                const dot = difficultyBadge.querySelector('span');
                if (dot) {
                    dot.className = `w-2 h-2 rounded-full mr-2 difficulty-${primaryTopic.difficulty}`;
                }
            }
        } else {
            if (titleElement) titleElement.textContent = 'No topics scheduled for today';
            if (descriptionElement) descriptionElement.textContent = 'Check your timeline for upcoming topics';
            if (difficultyBadge) difficultyBadge.style.display = 'none';
        }
    }

    renderTimeline() {
        if (window.innerWidth < 768) {
            this.renderMobileTimeline();
        } else {
            this.renderDesktopTimeline();
        }
    }

    renderDesktopTimeline() {
        const container = document.getElementById('timeline-container');
        const hoverZonesContainer = document.getElementById('hover-zones-container');
        const dateMarkersContainer = document.getElementById('date-markers');
        
        if (!container || !hoverZonesContainer || !dateMarkersContainer) return;
        
        // Clear existing content
        hoverZonesContainer.innerHTML = '';
        dateMarkersContainer.innerHTML = '';
        
        const dates = revisionData.getDateRange();
        const containerWidth = container.offsetWidth - 64; // Account for margins
        const dayWidth = containerWidth / (dates.length - 1);
        
        // Create hover zones and date markers
        dates.forEach((date, index) => {
            const xPosition = index * dayWidth;
            const dateStr = revisionData.formatDate(date);
            const topics = revisionData.getTopicForDate(date);
            
            // Create hover zone
            const hoverZone = document.createElement('div');
            hoverZone.className = 'timeline-hover-zone';
            hoverZone.style.left = `${xPosition - dayWidth/2}px`;
            hoverZone.style.width = `${dayWidth}px`;
            hoverZone.dataset.date = dateStr;
            hoverZone.dataset.index = index;
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = this.generateTooltipContent(date, topics);
            hoverZone.appendChild(tooltip);
            
            // Add hover events
            hoverZone.addEventListener('mouseenter', (e) => this.showTooltip(e));
            hoverZone.addEventListener('mouseleave', (e) => this.hideTooltip(e));
            hoverZone.addEventListener('click', (e) => this.navigateToDate(date));
            
            hoverZonesContainer.appendChild(hoverZone);
            
            // Add date markers for every 7 days
            if (index % 7 === 0 || index === dates.length - 1) {
                const marker = document.createElement('div');
                marker.className = 'date-marker';
                marker.style.left = `${xPosition}px`;
                marker.textContent = revisionData.formatDisplayDate(date);
                dateMarkersContainer.appendChild(marker);
            }
        });
        
        // Position progress dot
        this.updateProgressDotPosition();
    }

    renderMobileTimeline() {
        const container = document.getElementById('mobile-timeline-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const dates = revisionData.getDateRange();
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const sevenDaysAhead = new Date(today);
        sevenDaysAhead.setDate(today.getDate() + 7);
        
        // Show 7 days before and after today
        const relevantDates = dates.filter(date => 
            date >= sevenDaysAgo && date <= sevenDaysAhead
        );
        
        relevantDates.forEach(date => {
            const dateStr = revisionData.formatDate(date);
            const topics = revisionData.getTopicForDate(date);
            const isToday = this.isSameDay(date, today);
            const isPast = date < today;
            
            const timelineItem = document.createElement('div');
            timelineItem.className = `mobile-timeline-item p-4 border-l-4 ${
                isToday ? 'border-blue-500 bg-blue-50' : 
                isPast ? 'border-green-500 bg-green-50' : 
                'border-gray-300 bg-gray-50'
            } mb-4`;
            
            timelineItem.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="font-medium text-gray-800">${revisionData.formatDisplayDate(date)}</div>
                    <div class="text-sm ${isToday ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-gray-500'}">
                        ${isToday ? 'Today' : isPast ? 'Completed' : 'Upcoming'}
                    </div>
                </div>
                <div class="space-y-2">
                    ${topics.map(topic => `
                        <div class="text-sm">
                            <div class="font-medium text-gray-700">${topic.objective}</div>
                            <div class="text-gray-500">${topic.componentTitle}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            timelineItem.addEventListener('click', () => this.navigateToDate(date));
            container.appendChild(timelineItem);
        });
    }

    updateProgressDotPosition() {
        const progressDot = document.getElementById('progress-dot');
        if (!progressDot) return;
        
        const today = new Date();
        const startDate = revisionData.startDate;
        const endDate = revisionData.endDate;
        const totalDays = revisionData.getTotalDays();
        
        const daysPassed = Math.max(0, Math.min(totalDays - 1, 
            Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
        ));
        
        const containerWidth = progressDot.parentElement.offsetWidth - 64;
        const position = (daysPassed / (totalDays - 1)) * containerWidth;
        
        // Animate progress dot movement
        anime({
            targets: progressDot,
            left: `${position}px`,
            duration: this.animationSpeed,
            easing: 'easeInOutQuad'
        });
    }

    generateTooltipContent(date, topics) {
        const dateStr = revisionData.formatDisplayDate(date);
        const isToday = this.isSameDay(date, new Date());
        const isPast = date < new Date();
        
        let content = `<strong>${dateStr}</strong><br>`;
        
        if (isToday) {
            content += '<em>Today</em><br>';
        } else if (isPast) {
            content += '<em>Past</em><br>';
        } else {
            content += '<em>Future</em><br>';
        }
        
        if (topics.length > 0) {
            content += '<div class="mt-2">';
            topics.forEach(topic => {
                const difficultyColor = {
                    foundation: '#68D391',
                    intermediate: '#F6AD55',
                    advanced: '#FC8181'
                }[topic.difficulty];
                
                content += `
                    <div class="text-left text-xs mt-1">
                        <span style="color: ${difficultyColor}">●</span>
                        ${topic.objective.substring(0, 50)}${topic.objective.length > 50 ? '...' : ''}
                    </div>
                `;
            });
            content += '</div>';
        } else {
            content += '<div class="text-xs mt-1 text-gray-400">No topics scheduled</div>';
        }
        
        return content;
    }

    showTooltip(event) {
        const tooltip = event.currentTarget.querySelector('.tooltip');
        if (tooltip) {
            tooltip.classList.add('show');
        }
    }

    hideTooltip(event) {
        const tooltip = event.currentTarget.querySelector('.tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    navigateToDate(date) {
        this.currentDate = new Date(date);
        this.updateCurrentDateDisplay();
        this.updateDailyFocus();
        this.updateProgressDotPosition();
        
        // Smooth scroll to daily focus
        const dailyFocus = document.querySelector('section:nth-child(3)');
        if (dailyFocus) {
            dailyFocus.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateStats() {
        const stats = revisionData.calculateProgressStats();
        
        const completedElement = document.getElementById('completed-count');
        const streakElement = document.getElementById('streak-count');
        const percentageElement = document.getElementById('completion-percentage');
        
        if (completedElement) {
            anime({
                targets: completedElement,
                innerHTML: [0, stats.completed],
                duration: 1000,
                round: 1,
                easing: 'easeInOutQuad'
            });
        }
        
        if (streakElement) {
            anime({
                targets: streakElement,
                innerHTML: [0, stats.streak],
                duration: 1000,
                round: 1,
                easing: 'easeInOutQuad'
            });
        }
        
        if (percentageElement) {
            anime({
                targets: percentageElement,
                innerHTML: [0, stats.percentage],
                duration: 1000,
                round: 1,
                easing: 'easeInOutQuad',
                update: function(anim) {
                    percentageElement.innerHTML = Math.round(anim.animatables[0].target.innerHTML) + '%';
                }
            });
        }
    }

    bindEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        
        // Mark as completed button
        const markCompletedBtn = document.getElementById('mark-completed');
        if (markCompletedBtn) {
            markCompletedBtn.addEventListener('click', () => {
                const topics = revisionData.getCurrentDateTopics();
                if (topics.length > 0) {
                    topics.forEach(topic => {
                        revisionData.markTopicCompleted(topic.id);
                    });
                    
                    // Visual feedback
                    markCompletedBtn.textContent = 'Completed!';
                    markCompletedBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    markCompletedBtn.classList.add('bg-green-500');
                    
                    setTimeout(() => {
                        markCompletedBtn.textContent = 'Mark as Completed';
                        markCompletedBtn.classList.remove('bg-green-500');
                        markCompletedBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                    }, 2000);
                    
                    this.updateStats();
                }
            });
        }
        
        // View details button
        const viewDetailsBtn = document.getElementById('view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                window.location.href = 'topics.html';
            });
        }
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.renderTimeline();
        });
        
        // Auto-refresh daily focus at midnight
        this.scheduleDailyRefresh();
    }

    initializeAnimations() {
        // Animate page elements on load
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 750
        })
        .add({
            targets: 'header',
            translateY: [-50, 0],
            opacity: [0, 1]
        })
        .add({
            targets: 'main > section',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100)
        }, '-=500');
        
        // Animate progress dot on load
        const progressDot = document.getElementById('progress-dot');
        if (progressDot) {
            anime({
                targets: progressDot,
                scale: [0, 1],
                duration: 500,
                delay: 1000,
                easing: 'easeOutBack'
            });
        }
    }

    scheduleDailyRefresh() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow - now;
        
        setTimeout(() => {
            this.updateDailyFocus();
            this.updateCurrentDateDisplay();
            
            // Schedule next refresh
            this.scheduleDailyRefresh();
        }, msUntilMidnight);
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.revisionTimeline = new RevisionTimeline();
});

// Export for use in other pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RevisionTimeline };
}