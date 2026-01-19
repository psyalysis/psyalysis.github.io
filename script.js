// ============================================
// OCR Computer Science Learning Checklist
// ============================================

// State management
let data = null;
let checkedState = {};

// ============================================
// localStorage Management
// ============================================

/**
 * Load checked state from localStorage
 * Returns an object mapping learning objective IDs to boolean checked state
 */
function loadCheckedState() {
    try {
        const stored = localStorage.getItem('ocr-cs-checked');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
    return {};
}

/**
 * Save checked state to localStorage
 * @param {string} id - Learning objective ID
 * @param {boolean} checked - Checked state
 */
function saveCheckedState(id, checked) {
    checkedState[id] = checked;
    try {
        localStorage.setItem('ocr-cs-checked', JSON.stringify(checkedState));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * Check if a learning objective is checked
 * @param {string} id - Learning objective ID
 * @returns {boolean}
 */
function isChecked(id) {
    return checkedState[id] === true;
}

// ============================================
// JSON Parsing and Data Loading
// ============================================

/**
 * Load and parse the JSON data file
 * @returns {Promise<Object>}
 */
async function loadData() {
    try {
        const response = await fetch('./json/LearningObjectives.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        throw error;
    }
}

// ============================================
// Progress Calculation
// ============================================

/**
 * Calculate progress for a topic
 * @param {Object} topic - Topic object with subtopics
 * @returns {Object} Object with completed and total counts
 */
function calculateTopicProgress(topic) {
    let completed = 0;
    let total = 0;
    
    topic.subtopics.forEach(subtopic => {
        subtopic.learningObjectives.forEach(obj => {
            const counts = countObjectiveAndSubs(obj);
            completed += counts.completed;
            total += counts.total;
        });
    });
    
    return { completed, total };
}

/**
 * Count all objectives including sub-objectives
 * For objectives with sub-objectives, only count the sub-objectives
 * For objectives without sub-objectives, count the objective itself
 * @param {Object} objective - Objective object (may have subObjectives)
 * @returns {Object} Object with completed and total counts
 */
function countObjectiveAndSubs(objective) {
    // If has sub-objectives, only count them (not the parent)
    if (objective.subObjectives && Array.isArray(objective.subObjectives) && objective.subObjectives.length > 0) {
        let completed = 0;
        let total = objective.subObjectives.length;
        
        objective.subObjectives.forEach(subObj => {
            if (isChecked(subObj.id)) {
                completed++;
            }
        });
        
        return { completed, total };
    } else {
        // No sub-objectives, count the objective itself
        return {
            completed: isChecked(objective.id) ? 1 : 0,
            total: 1
        };
    }
}

/**
 * Calculate progress for a subtopic
 * @param {Object} subtopic - Subtopic object with learning objectives
 * @returns {Object} Object with completed and total counts
 */
function calculateSubtopicProgress(subtopic) {
    let completed = 0;
    let total = 0;
    
    subtopic.learningObjectives.forEach(obj => {
        const counts = countObjectiveAndSubs(obj);
        completed += counts.completed;
        total += counts.total;
    });
    
    return { completed, total };
}

/**
 * Create a circular progress indicator SVG
 * @param {number} percentage - Completion percentage (0-100)
 * @param {string} className - CSS class name for the container
 * @param {boolean} isCompleted - Whether the section is fully completed
 * @returns {HTMLElement}
 */
function createProgressCircle(percentage, className, isCompleted) {
    const container = document.createElement('div');
    container.className = className;
    if (isCompleted) {
        container.classList.add('completed');
    }
    
    let size, strokeWidth;
    if (className.includes('subtopic') || className.includes('objective')) {
        size = 30;
        strokeWidth = 2.3;
    } else {
        size = 32;
        strokeWidth = 2.5;
    }
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', className.replace('-circle', '-svg'));
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('class', className.replace('-circle', '-circle-bg'));
    bgCircle.setAttribute('cx', size / 2);
    bgCircle.setAttribute('cy', size / 2);
    bgCircle.setAttribute('r', radius);
    
    const fillCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    fillCircle.setAttribute('class', className.replace('-circle', '-circle-fill'));
    fillCircle.setAttribute('cx', size / 2);
    fillCircle.setAttribute('cy', size / 2);
    fillCircle.setAttribute('r', radius);
    fillCircle.setAttribute('stroke-dasharray', circumference);
    fillCircle.setAttribute('stroke-dashoffset', offset);
    
    svg.appendChild(bgCircle);
    svg.appendChild(fillCircle);
    container.appendChild(svg);
    
    return container;
}

// ============================================
// DOM Generation
// ============================================

/**
 * Create a regular learning objective element (without sub-objectives) - similar to subtopic
 * @param {Object} objective - Learning objective object
 * @returns {HTMLElement}
 */
function createRegularObjectiveElement(objective) {
    const item = document.createElement('div');
    item.className = 'learning-objective regular-objective';
    item.dataset.id = objective.id;
    
    // Objective text
    const text = document.createElement('div');
    text.className = 'objective-text';
    text.textContent = objective.objective;
    
    // Progress circle
    const progress = calculateObjectiveProgress(objective);
    const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
    const isCompleted = progress.completed === progress.total && progress.total > 0;
    const progressCircle = createProgressCircle(percentage, 'objective-progress-circle', isCompleted);
    
    item.appendChild(text);
    item.appendChild(progressCircle);
    
    // Make it clickable to toggle (for single objectives without sub-objectives)
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleObjective(objective.id, item);
    });
    
    return item;
}

/**
 * Create a learning objective element (for sub-objectives only - these keep checkboxes)
 * @param {Object} objective - Learning objective object
 * @returns {HTMLElement}
 */
function createLearningObjectiveElement(objective) {
    const item = document.createElement('div');
    item.className = 'learning-objective sub-objective';
    item.dataset.id = objective.id;
    
    // Set initial checked state
    if (isChecked(objective.id)) {
        item.classList.add('checked');
    }
    
    // Checkbox
    const checkbox = document.createElement('div');
    checkbox.className = 'checkbox';
    
    // Objective text
    const text = document.createElement('div');
    text.className = 'objective-text';
    text.textContent = objective.objective;
    
    item.appendChild(checkbox);
    item.appendChild(text);
    
    // Toggle on click
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleObjective(objective.id, item);
    });
    
    return item;
}

/**
 * Calculate progress for a single objective (based on sub-objectives if they exist)
 * @param {Object} objective - Objective object (may have subObjectives)
 * @returns {Object} Object with completed and total counts
 */
function calculateObjectiveProgress(objective) {
    const subObjectives = objective.subObjectives || [];
    
    if (subObjectives.length > 0) {
        // If has sub-objectives, calculate based on them
        let completed = 0;
        let total = subObjectives.length;
        
        subObjectives.forEach(subObj => {
            if (isChecked(subObj.id)) {
                completed++;
            }
        });
        
        return { completed, total };
    } else {
        // If no sub-objectives, it's just a single item
        return {
            completed: isChecked(objective.id) ? 1 : 0,
            total: 1
        };
    }
}

/**
 * Create a parent objective element with sub-objectives
 * @param {Object} parentObjective - Parent objective object with subObjectives array
 * @returns {HTMLElement}
 */
function createParentObjectiveElement(parentObjective) {
    const container = document.createElement('div');
    container.className = 'parent-objective';
    container.dataset.baseId = parentObjective.id;
    
    const subObjectives = parentObjective.subObjectives || [];
    
    // Parent objective row
    const parentRow = document.createElement('div');
    parentRow.className = 'learning-objective parent-row';
    parentRow.dataset.id = parentObjective.id;
    
    // Expand/collapse toggle
    const expandToggle = document.createElement('div');
    expandToggle.className = 'expand-toggle';
    
    // Objective text
    const text = document.createElement('div');
    text.className = 'objective-text';
    text.textContent = parentObjective.objective;
    
    // Progress circle
    const progress = calculateObjectiveProgress(parentObjective);
    const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
    const isCompleted = progress.completed === progress.total && progress.total > 0;
    const progressCircle = createProgressCircle(percentage, 'objective-progress-circle', isCompleted);
    
    parentRow.appendChild(expandToggle);
    parentRow.appendChild(text);
    parentRow.appendChild(progressCircle);
    
    // Sub-objectives container (starts collapsed)
    const subContainer = document.createElement('div');
    subContainer.className = 'sub-objectives-container collapsed';
    
    subObjectives.forEach(subObj => {
        subContainer.appendChild(createLearningObjectiveElement(subObj));
    });
    
    container.appendChild(parentRow);
    container.appendChild(subContainer);
    
    // Allow clicking to expand/collapse
    parentRow.addEventListener('click', (e) => {
        // Don't toggle if clicking the expand toggle or its children
        if (e.target === expandToggle || expandToggle.contains(e.target)) {
            return;
        }
        e.stopPropagation();
        subContainer.classList.toggle('collapsed');
        container.classList.toggle('expanded');
    });
    
    // Prevent text selection on double-click
    text.addEventListener('mousedown', (e) => {
        if (e.detail > 1) {
            e.preventDefault();
        }
    });
    
    // Toggle expand/collapse
    expandToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        subContainer.classList.toggle('collapsed');
        container.classList.toggle('expanded');
    });
    
    return container;
}

/**
 * Create a subtopic element
 * @param {Object} subtopic - Subtopic object
 * @returns {HTMLElement}
 */
function createSubtopicElement(subtopic) {
    const subtopicEl = document.createElement('div');
    subtopicEl.className = 'subtopic collapsed';
    subtopicEl.dataset.subtopicId = subtopic.subtopicId;
    
    // Header
    const header = document.createElement('div');
    header.className = 'subtopic-header';
    
    const title = document.createElement('div');
    title.className = 'subtopic-title';
    title.textContent = subtopic.title;
    
    // Progress circle
    const progress = calculateSubtopicProgress(subtopic);
    const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
    const isCompleted = progress.completed === progress.total && progress.total > 0;
    const progressCircle = createProgressCircle(percentage, 'subtopic-progress-circle', isCompleted);
    
    const toggle = document.createElement('div');
    toggle.className = 'subtopic-toggle';
    
    header.appendChild(title);
    header.appendChild(progressCircle);
    header.appendChild(toggle);
    
    // Content container
    const content = document.createElement('div');
    content.className = 'subtopic-content';
    
    // Process each learning objective
    subtopic.learningObjectives.forEach(objective => {
        // Check if objective has sub-objectives
        if (objective.subObjectives && Array.isArray(objective.subObjectives) && objective.subObjectives.length > 0) {
            // Has sub-objectives - create parent with children
            content.appendChild(createParentObjectiveElement(objective));
        } else {
            // No sub-objectives - create regular objective with progress circle
            const regularObj = createRegularObjectiveElement(objective);
            content.appendChild(regularObj);
        }
    });
    
    subtopicEl.appendChild(header);
    subtopicEl.appendChild(content);
    
    // Toggle collapse on header click
    header.addEventListener('click', () => {
        subtopicEl.classList.toggle('collapsed');
    });
    
    return subtopicEl;
}

/**
 * Create a topic element
 * @param {Object} topic - Topic object
 * @returns {HTMLElement}
 */
function createTopicElement(topic) {
    const topicEl = document.createElement('div');
    topicEl.className = 'topic collapsed';
    topicEl.dataset.topicId = topic.topicId;
    
    // Header
    const header = document.createElement('div');
    header.className = 'topic-header';
    
    const title = document.createElement('div');
    title.className = 'topic-title';
    title.textContent = topic.title;
    
    // Progress circle
    const progressData = calculateTopicProgress(topic);
    const percentage = progressData.total > 0 ? (progressData.completed / progressData.total) * 100 : 0;
    const isCompleted = progressData.completed === progressData.total && progressData.total > 0;
    const progressCircle = createProgressCircle(percentage, 'topic-progress-circle', isCompleted);
    
    const toggle = document.createElement('div');
    toggle.className = 'topic-toggle';
    
    header.appendChild(title);
    header.appendChild(progressCircle);
    header.appendChild(toggle);
    
    // Content container
    const content = document.createElement('div');
    content.className = 'topic-content';
    
    // Subtopics
    topic.subtopics.forEach(subtopic => {
        content.appendChild(createSubtopicElement(subtopic));
    });
    
    topicEl.appendChild(header);
    topicEl.appendChild(content);
    
    // Toggle collapse on header click
    header.addEventListener('click', () => {
        topicEl.classList.toggle('collapsed');
    });
    
    return topicEl;
}

/**
 * Create a component element
 * @param {Object} component - Component object
 * @returns {HTMLElement}
 */
function createComponentElement(component) {
    const componentEl = document.createElement('div');
    componentEl.className = 'component';
    
    // Header
    const header = document.createElement('div');
    header.className = 'component-header';
    header.textContent = component.title;
    
    componentEl.appendChild(header);
    
    // Topics
    component.topics.forEach(topic => {
        componentEl.appendChild(createTopicElement(topic));
    });
    
    return componentEl;
}

/**
 * Render all components to the DOM
 * @param {Object} data - Parsed JSON data
 */
function renderContent(data) {
    const content = document.getElementById('content');
    content.innerHTML = '';
    
    data.components.forEach(component => {
        content.appendChild(createComponentElement(component));
    });
}


// ============================================
// Interaction Handlers
// ============================================

/**
 * Toggle a learning objective's checked state
 * @param {string} id - Learning objective ID
 * @param {HTMLElement} element - The learning objective DOM element
 */
function toggleObjective(id, element) {
    const currentlyChecked = isChecked(id);
    const newState = !currentlyChecked;
    
    // Update state
    saveCheckedState(id, newState);
    
    // Update UI
    if (newState) {
        element.classList.add('checked');
    } else {
        element.classList.remove('checked');
    }
    
    // Update parent objective progress if it has sub-objectives
    const parentObjective = element.closest('.parent-objective');
    if (parentObjective) {
        const subContainer = parentObjective.querySelector('.sub-objectives-container');
        const parentRow = parentObjective.querySelector('.parent-row');
        
        if (subContainer && parentRow) {
            // Find the parent objective data
            const parentId = parentRow.dataset.id;
            const parentObj = data.components
                .flatMap(c => c.topics)
                .flatMap(t => t.subtopics)
                .flatMap(st => st.learningObjectives)
                .find(obj => obj.id === parentId);
            
            if (parentObj) {
                const progress = calculateObjectiveProgress(parentObj);
                const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
                const isCompleted = progress.completed === progress.total && progress.total > 0;
                
                // Update parent objective progress circle
                const progressCircleEl = parentRow.querySelector('.objective-progress-circle');
                if (progressCircleEl) {
                    const svg = progressCircleEl.querySelector('.objective-progress-svg');
                    const fillCircle = svg.querySelector('.objective-progress-circle-fill');
                    const size = 30;
                    const radius = (size - 2.3) / 2;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (percentage / 100) * circumference;
                    
                    fillCircle.setAttribute('stroke-dashoffset', offset);
                    
                    if (isCompleted) {
                        progressCircleEl.classList.add('completed');
                    } else {
                        progressCircleEl.classList.remove('completed');
                    }
                }
            }
        }
    }
    
    // Update regular objective progress circle
    if (element.classList.contains('regular-objective')) {
        const objectiveId = element.dataset.id;
        const objective = data.components
            .flatMap(c => c.topics)
            .flatMap(t => t.subtopics)
            .flatMap(st => st.learningObjectives)
            .find(obj => obj.id === objectiveId);
        
        if (objective) {
            const progress = calculateObjectiveProgress(objective);
            const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
            const isCompleted = progress.completed === progress.total && progress.total > 0;
            
            const progressCircleEl = element.querySelector('.objective-progress-circle');
            if (progressCircleEl) {
                const svg = progressCircleEl.querySelector('.objective-progress-svg');
                const fillCircle = svg.querySelector('.objective-progress-circle-fill');
                const size = 30;
                const radius = (size - 2.3) / 2;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentage / 100) * circumference;
                
                fillCircle.setAttribute('stroke-dashoffset', offset);
                
                if (isCompleted) {
                    progressCircleEl.classList.add('completed');
                } else {
                    progressCircleEl.classList.remove('completed');
                }
            }
        }
    }
    
    // Update progress for parent subtopic
    const subtopicEl = element.closest('.subtopic');
    if (subtopicEl && subtopicEl.dataset.subtopicId) {
        // Find the subtopic data
        const subtopic = data.components
            .flatMap(c => c.topics)
            .flatMap(t => t.subtopics)
            .find(st => st.subtopicId === subtopicEl.dataset.subtopicId);
        
        if (subtopic) {
            const progress = calculateSubtopicProgress(subtopic);
            const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
            const isCompleted = progress.completed === progress.total && progress.total > 0;
            
            // Update subtopic progress circle
            const progressCircleEl = subtopicEl.querySelector('.subtopic-progress-circle');
            if (progressCircleEl) {
                const svg = progressCircleEl.querySelector('.subtopic-progress-svg');
                const fillCircle = svg.querySelector('.subtopic-progress-circle-fill');
                const size = 28;
                const radius = (size - 2.5) / 2;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentage / 100) * circumference;
                
                fillCircle.setAttribute('stroke-dashoffset', offset);
                
                if (isCompleted) {
                    progressCircleEl.classList.add('completed');
                } else {
                    progressCircleEl.classList.remove('completed');
                }
            }
        }
    }
    
    // Update progress for parent topic
    const topicEl = element.closest('.topic');
    if (topicEl && topicEl.dataset.topicId) {
        // Find the topic data
        const topic = data.components
            .flatMap(c => c.topics)
            .find(t => t.topicId === topicEl.dataset.topicId);
        
        if (topic) {
            const progress = calculateTopicProgress(topic);
            const percentage = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
            const isCompleted = progress.completed === progress.total && progress.total > 0;
            
            // Update topic progress circle
            const progressCircleEl = topicEl.querySelector('.topic-progress-circle');
            if (progressCircleEl) {
                const svg = progressCircleEl.querySelector('.topic-progress-svg');
                const fillCircle = svg.querySelector('.topic-progress-circle-fill');
                const size = 32;
                const radius = (size - 2.5) / 2;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentage / 100) * circumference;
                
                fillCircle.setAttribute('stroke-dashoffset', offset);
                
                if (isCompleted) {
                    progressCircleEl.classList.add('completed');
                } else {
                    progressCircleEl.classList.remove('completed');
                }
            }
        }
    }
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize the application
 */
async function init() {
    try {
        // Load checked state from localStorage
        checkedState = loadCheckedState();
        
        // Load JSON data
        data = await loadData();
        
        // Render content
        renderContent(data);
        
        // Hide welcome overlay after animation
        setTimeout(() => {
            const overlay = document.getElementById('welcomeOverlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }, 2500);
    } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('content').innerHTML = 
            '<div style="padding: 48px 24px; text-align: center; color: #666;">Error loading data. Please refresh the page.</div>';
        // Hide overlay even on error
        const overlay = document.getElementById('welcomeOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}