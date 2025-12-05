// Task Management Application with Local Storage

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksContainer = document.getElementById('tasksContainer');
const emptyState = document.getElementById('emptyState');
const successMessage = document.getElementById('successMessage');
const taskCount = document.getElementById('taskCount');
const rewardContainer = document.getElementById('rewardContainer');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Local Storage Key
const STORAGE_KEY = 'todoListTasks';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Delete All button
    deleteAllBtn.addEventListener('click', showDeleteAllConfirmation);
    confirmDeleteBtn.addEventListener('click', deleteAllTasks);
    cancelDeleteBtn.addEventListener('click', hideDeleteAllConfirmation);
    
    // Close modal on outside click
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            hideDeleteAllConfirmation();
        }
    });
});

// Task Object Structure
class Task {
    constructor(id, text, completed = false) {
        this.id = id;
        this.text = text;
        this.completed = completed;
        this.createdAt = new Date().toISOString();
    }
}

// Get tasks from Local Storage
function getTasksFromStorage() {
    const tasksJson = localStorage.getItem(STORAGE_KEY);
    if (tasksJson) {
        try {
            return JSON.parse(tasksJson);
        } catch (error) {
            console.error('Error parsing tasks from storage:', error);
            return [];
        }
    }
    return [];
}

// Save tasks to Local Storage
function saveTasksToStorage(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to storage:', error);
    }
}

// Load and render tasks from Local Storage
function loadTasks() {
    const tasks = getTasksFromStorage();
    renderTasks(tasks);
    updateTaskCount(tasks);
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        return;
    }
    
    // Get existing tasks
    const tasks = getTasksFromStorage();
    
    // Create new task with unique ID
    const newTask = new Task(
        Date.now().toString(),
        taskText,
        false
    );
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Save to Local Storage
    saveTasksToStorage(tasks);
    
    // Clear input
    taskInput.value = '';
    
    // Render updated list
    renderTasks(tasks);
    updateTaskCount(tasks);
    
    // Show success message
    showSuccessMessage();
    
    // Focus back on input
    taskInput.focus();
}

// Toggle task completion status
function toggleTaskComplete(taskId) {
    const tasks = getTasksFromStorage();
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const wasCompleted = tasks[taskIndex].completed;
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasksToStorage(tasks);
        renderTasks(tasks);
        updateTaskCount(tasks);
        
        // Show reward animation if task was just completed (not uncompleted)
        if (!wasCompleted && tasks[taskIndex].completed) {
            showCompletionReward();
        }
    }
}

// Delete a task
function deleteTask(taskId) {
    const tasks = getTasksFromStorage();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage(filteredTasks);
    renderTasks(filteredTasks);
    updateTaskCount(filteredTasks);
}

// Render all tasks
function renderTasks(tasks) {
    // Clear container
    tasksContainer.innerHTML = '';
    
    // Show/hide empty state and delete all button
    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
        deleteAllBtn.classList.add('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
        deleteAllBtn.classList.remove('hidden');
    }
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Render each task
    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task);
        // Add slight delay for smooth staggered animation
        if (index > 0) {
            taskElement.style.animationDelay = `${index * 0.05}s`;
        }
        fragment.appendChild(taskElement);
    });
    
    // Append all at once for better performance
    tasksContainer.appendChild(fragment);
}

// Create a task element
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    let baseClasses = 'task-item flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200';
    
    // Add completion styling if task is completed
    if (task.completed) {
        baseClasses += ' task-completed';
    }
    
    taskDiv.className = baseClasses;
    
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    
    // Task text
    const taskText = document.createElement('span');
    taskText.className = `flex-1 text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`;
    taskText.textContent = task.text;
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-sm font-bold shadow-md';
    deleteBtn.innerHTML = '🗑️ Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    // Append elements
    taskDiv.appendChild(checkbox);
    taskDiv.appendChild(taskText);
    taskDiv.appendChild(deleteBtn);
    
    return taskDiv;
}

// Update task count display and progress
function updateTaskCount(tasks) {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const totalTasks = tasks.length;
    const completedTasks = totalTasks - activeTasks;
    
    taskCount.textContent = activeTasks;
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    if (totalTasks > 0) {
        const progress = (completedTasks / totalTasks) * 100;
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    } else {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }
    
    // Check if all tasks are completed
    if (totalTasks > 0 && activeTasks === 0) {
        showAllCompletedCelebration();
    }
}

// Show success message
function showSuccessMessage() {
    successMessage.classList.remove('hidden');
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 2000);
}

// Show completion reward animation
function showCompletionReward() {
    // Create celebration message
    const celebrationMsg = document.createElement('div');
    celebrationMsg.className = 'celebration-message';
    celebrationMsg.innerHTML = '<div>Great Job!<br><span style="font-size: 1.2rem;">Task Completed! ✨</span></div>';
    rewardContainer.appendChild(celebrationMsg);
    
    // Create confetti particles
    createConfetti();
    
    // Create sparkle particles
    createSparkles();
    
    // Create star burst
    createStarBurst();
    
    // Remove celebration message after animation
    setTimeout(() => {
        celebrationMsg.remove();
    }, 2000);
    
    // Clear reward container after all animations
    setTimeout(() => {
        rewardContainer.innerHTML = '';
    }, 3000);
}

// Create confetti particles
function createConfetti() {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti confetti-animation';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 10 + 8) + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
        
        // Random rotation
        const rotation = Math.random() * 360;
        confetti.style.transform = `rotate(${rotation}deg)`;
        
        rewardContainer.appendChild(confetti);
    }
}

// Create sparkle particles
function createSparkles() {
    const sparkleCount = 20;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 1 + 's';
        
        rewardContainer.appendChild(sparkle);
    }
}

// Create star burst effect
function createStarBurst() {
    const starCount = 8;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star-burst';
        star.style.left = centerX + 'px';
        star.style.top = centerY + 'px';
        star.style.transformOrigin = 'center';
        
        // Position stars in a circle
        const angle = (360 / starCount) * i;
        const radius = 100;
        const x = centerX + Math.cos(angle * Math.PI / 180) * radius;
        const y = centerY + Math.sin(angle * Math.PI / 180) * radius;
        
        star.style.left = x + 'px';
        star.style.top = y + 'px';
        star.style.animationDelay = (i * 0.1) + 's';
        
        rewardContainer.appendChild(star);
    }
}

// Show all tasks completed celebration
function showAllCompletedCelebration() {
    // Check if celebration already shown (to avoid duplicates)
    if (document.querySelector('.all-completed-celebration')) {
        return;
    }
    
    // Create mega celebration message
    const megaCelebration = document.createElement('div');
    megaCelebration.className = 'all-completed-celebration';
    megaCelebration.innerHTML = `
        <div>Congratulations! 🎊</div>
        <div class="subtitle">All Tasks Completed!<br>You're Amazing! ✨</div>
    `;
    rewardContainer.appendChild(megaCelebration);
    
    // Create massive confetti
    createMassiveConfetti();
    
    // Create extra sparkles
    for (let i = 0; i < 50; i++) {
        createSparkles();
    }
    
    // Create multiple star bursts
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            createStarBurst();
        }, i * 300);
    }
    
    // Remove celebration after longer duration
    setTimeout(() => {
        megaCelebration.remove();
    }, 5000);
    
    // Clear reward container after all animations
    setTimeout(() => {
        rewardContainer.innerHTML = '';
    }, 6000);
}

// Create massive confetti for all completed celebration
function createMassiveConfetti() {
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#f43f5e'];
    const particleCount = 150;
    
    for (let i = 0; i < particleCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti confetti-animation';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 15 + 10) + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.animationDelay = Math.random() * 1 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
        
        // Random rotation
        const rotation = Math.random() * 720;
        confetti.style.transform = `rotate(${rotation}deg)`;
        
        rewardContainer.appendChild(confetti);
    }
}

// Show delete all confirmation modal
function showDeleteAllConfirmation() {
    confirmModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Hide delete all confirmation modal
function hideDeleteAllConfirmation() {
    confirmModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
}

// Delete all tasks
function deleteAllTasks() {
    // Clear all tasks from storage
    saveTasksToStorage([]);
    
    // Render empty state
    renderTasks([]);
    updateTaskCount([]);
    
    // Hide modal
    hideDeleteAllConfirmation();
    
    // Show success message
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in';
    message.textContent = '✓ All tasks deleted successfully!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transition = 'opacity 0.3s ease';
        setTimeout(() => message.remove(), 300);
    }, 2000);
}

