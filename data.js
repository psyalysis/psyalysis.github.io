// Data Management for Revision Timeline App
class RevisionData {
    constructor() {
        this.learningObjectives = [];
        this.topicSchedule = {};
        this.startDate = new Date('2026-01-16');
        this.endDate = new Date('2026-03-16');
        this.userProgress = this.loadUserProgress();
        this.init();
    }

    async init() {
        await this.loadLearningObjectives();
        this.distributeTopics();
        this.calculateProgressStats();
    }

    async loadLearningObjectives() {
        try {
            const response = await fetch('./resources/learning-objectives.json');
            const data = await response.json();
            
            // Flatten all learning objectives into a single array
            this.learningObjectives = [];
            let idCounter = 0;
            
            data.components.forEach(component => {
                component.topics.forEach(topic => {
                    topic.subtopics.forEach(subtopic => {
                        subtopic.learningObjectives.forEach(obj => {
                            this.learningObjectives.push({
                                id: `obj-${idCounter++}`,
                                componentId: component.componentId,
                                componentTitle: component.title,
                                topicId: topic.topicId,
                                topicTitle: topic.title,
                                subtopicId: subtopic.subtopicId,
                                subtopicTitle: subtopic.title,
                                objectiveId: obj.id,
                                objective: obj.objective,
                                type: obj.type,
                                difficulty: obj.difficulty,
                                scheduledDate: null,
                                completed: this.userProgress.completed.includes(`obj-${idCounter-1}`),
                                needsReview: this.userProgress.needsReview.includes(`obj-${idCounter-1}`)
                            });
                        });
                    });
                });
            });
            
            console.log(`Loaded ${this.learningObjectives.length} learning objectives`);
        } catch (error) {
            console.error('Error loading learning objectives:', error);
            // Fallback data if JSON fails to load
            this.learningObjectives = this.getFallbackData();
        }
    }

    getFallbackData() {
        // Simplified fallback data for demonstration
        const fallbackTopics = [
            "CPU Architecture and Components",
            "Fetch-Decode-Execute Cycle",
            "Factors Affecting CPU Performance",
            "Pipelining and Processor Efficiency",
            "Von Neumann vs Harvard Architecture",
            "CISC vs RISC Processors",
            "Graphics Processing Units (GPUs)",
            "Multicore and Parallel Systems",
            "Input, Output and Storage Devices",
            "Magnetic, Flash and Optical Storage"
        ];
        
        return fallbackTopics.map((topic, index) => ({
            id: `obj-${index}`,
            componentId: "01",
            componentTitle: "Computer Systems",
            topicId: "1.1",
            topicTitle: "Processor Architecture",
            subtopicId: "1.1.1",
            subtopicTitle: "Structure and function of the processor",
            objectiveId: `1.1.1.${String.fromCharCode(97 + index)}`,
            objective: topic,
            type: index % 3 === 0 ? "knowledge" : index % 3 === 1 ? "understanding" : "application",
            difficulty: index < 3 ? "foundation" : index < 7 ? "intermediate" : "advanced",
            scheduledDate: null,
            completed: false,
            needsReview: false
        }));
    }

    distributeTopics() {
        const totalDays = this.getTotalDays();
        const objectivesPerDay = Math.ceil(this.learningObjectives.length / totalDays);
        
        // Sort objectives by difficulty to ensure balanced distribution
        const sortedObjectives = [...this.learningObjectives].sort((a, b) => {
            const difficultyOrder = { 'foundation': 0, 'intermediate': 1, 'advanced': 2 };
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        });

        // Distribute objectives across dates
        let objectiveIndex = 0;
        for (let d = new Date(this.startDate); d <= this.endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = this.formatDate(d);
            this.topicSchedule[dateStr] = [];
            
            // Assign 2-3 objectives per day
            const objectivesForDay = Math.min(objectivesPerDay, sortedObjectives.length - objectiveIndex);
            for (let i = 0; i < objectivesForDay && objectiveIndex < sortedObjectives.length; i++) {
                const objective = sortedObjectives[objectiveIndex++];
                objective.scheduledDate = dateStr;
                this.topicSchedule[dateStr].push(objective);
            }
        }
        
        console.log(`Distributed ${this.learningObjectives.length} objectives across ${totalDays} days`);
    }

    getTotalDays() {
        const diffTime = Math.abs(this.endDate - this.startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    getTopicForDate(date) {
        const dateStr = this.formatDate(date);
        return this.topicSchedule[dateStr] || [];
    }

    getCurrentDateTopics() {
        const today = new Date();
        return this.getTopicForDate(today);
    }

    getDateRange() {
        const dates = [];
        for (let d = new Date(this.startDate); d <= this.endDate; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
        return dates;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    formatDisplayDate(date) {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    getProgressPercentage() {
        const completed = this.learningObjectives.filter(obj => obj.completed).length;
        return Math.round((completed / this.learningObjectives.length) * 100);
    }

    getStreakCount() {
        // Calculate consecutive days with completed topics
        let streak = 0;
        const today = new Date();
        
        for (let d = new Date(today); d >= this.startDate; d.setDate(d.getDate() - 1)) {
            const dateStr = this.formatDate(d);
            const dayTopics = this.topicSchedule[dateStr] || [];
            const dayCompleted = dayTopics.every(topic => topic.completed);
            
            if (dayCompleted) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    getCompletedCount() {
        return this.learningObjectives.filter(obj => obj.completed).length;
    }

    getDifficultyDistribution() {
        const distribution = { foundation: 0, intermediate: 0, advanced: 0 };
        this.learningObjectives.forEach(obj => {
            distribution[obj.difficulty]++;
        });
        return distribution;
    }

    markTopicCompleted(topicId) {
        const topic = this.learningObjectives.find(obj => obj.id === topicId);
        if (topic) {
            topic.completed = true;
            topic.needsReview = false;
            this.saveUserProgress();
            this.calculateProgressStats();
        }
    }

    markTopicNeedsReview(topicId) {
        const topic = this.learningObjectives.find(obj => obj.id === topicId);
        if (topic) {
            topic.needsReview = true;
            this.saveUserProgress();
        }
    }

    calculateProgressStats() {
        const stats = {
            total: this.learningObjectives.length,
            completed: this.getCompletedCount(),
            percentage: this.getProgressPercentage(),
            streak: this.getStreakCount(),
            difficulty: this.getDifficultyDistribution()
        };
        
        this.stats = stats;
        return stats;
    }

    saveUserProgress() {
        const progress = {
            completed: this.learningObjectives.filter(obj => obj.completed).map(obj => obj.id),
            needsReview: this.learningObjectives.filter(obj => obj.needsReview).map(obj => obj.id),
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('revisionProgress', JSON.stringify(progress));
        this.userProgress = progress;
    }

    loadUserProgress() {
        const saved = localStorage.getItem('revisionProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            completed: [],
            needsReview: [],
            lastUpdated: null
        };
    }

    searchTopics(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.learningObjectives.filter(obj => 
            obj.objective.toLowerCase().includes(lowercaseQuery) ||
            obj.topicTitle.toLowerCase().includes(lowercaseQuery) ||
            obj.subtopicTitle.toLowerCase().includes(lowercaseQuery) ||
            obj.componentTitle.toLowerCase().includes(lowercaseQuery)
        );
    }

    filterTopics(filters) {
        return this.learningObjectives.filter(obj => {
            if (filters.difficulty && obj.difficulty !== filters.difficulty) return false;
            if (filters.component && obj.componentId !== filters.component) return false;
            if (filters.type && obj.type !== filters.type) return false;
            if (filters.completed !== undefined && obj.completed !== filters.completed) return false;
            if (filters.needsReview !== undefined && obj.needsReview !== filters.needsReview) return false;
            return true;
        });
    }

    getWeeklyOverview(date = new Date()) {
        const week = [];
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay()); // Sunday
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const topics = this.getTopicForDate(day);
            week.push({
                date: day,
                dateStr: this.formatDisplayDate(day),
                topics: topics,
                completed: topics.every(t => t.completed)
            });
        }
        
        return week;
    }
}

// Initialize global revision data instance
const revisionData = new RevisionData();