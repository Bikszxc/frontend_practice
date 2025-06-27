class HackerTodo {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('hackerTasks')) || [];
        this.taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 0;

        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.clearBtn = document.getElementById('clearBtn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.emptyState = document.getElementById('emptyState');

        this.totalTasks = document.getElementById('totalTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.completedTasks = document.getElementById('completedTasks');

        this.init();
    }

    init() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearBtn.addEventListener('click', () => this.clearAllTasks());
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());

        this.renderTasks();
        this.updateStats();
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        if (!taskText) return;

        const inputRect = this.taskInput.getBoundingClientRect();
        const inputStyles = window.getComputedStyle(this.taskInput);

        const originalPlaceholder = this.taskInput.placeholder;
        this.taskInput.placeholder = '';

        const textElement = document.createElement('div');
        textElement.textContent = taskText;
        textElement.className = 'fixed pointer-events-none z-50 text-gray-100 whitespace-nowrap transition-all duration-700 ease-out';
        textElement.style.left = `${inputRect.left + parseInt(inputStyles.paddingLeft)}px`;
        textElement.style.top = `${inputRect.top + parseInt(inputStyles.paddingTop)}px`;

        const placeholderElement = document.createElement('div');
        placeholderElement.textContent = originalPlaceholder;
        placeholderElement.className = 'fixed pointer-events-none z-50 text-gray-500 whitespace-nowrap transition-all duration-900 ease-in opacity-0';
        placeholderElement.style.left = `${inputRect.left + parseInt(inputStyles.paddingLeft) + 1}px`;
        placeholderElement.style.top = `${inputRect.top + parseInt(inputStyles.paddingTop) + 1}px`;

        document.body.appendChild(textElement);
        document.body.appendChild(placeholderElement);

        this.taskInput.value = '';

        requestAnimationFrame(() => {
            textElement.classList.add('translate-x-48', 'opacity-0');

            setTimeout(() => {
                placeholderElement.classList.remove('opacity-0');
                placeholderElement.classList.add('opacity-100');
            }, 100);
        });

        setTimeout(() => {
            document.body.removeChild(textElement);
            document.body.removeChild(placeholderElement);
            this.taskInput.placeholder = originalPlaceholder;
        }, 1000);

        const task = {
            id: ++this.taskIdCounter,
            text: taskText,
            completed: false,
            timestamp: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveToStorage();

        this.addNewTaskElement(task);
        this.updateStats();
        this.updateEmptyState();

        this.taskInput.style.borderColor = '#10b981';
        setTimeout(() => {
            this.taskInput.style.borderColor = '';
        }, 200);
    }

    addNewTaskElement(task) {
        const taskElement = this.createTaskElement(task);

        taskElement.classList.add('new-task-top');
        this.taskList.insertBefore(taskElement, this.taskList.firstChild);

        taskElement.offsetHeight;

        taskElement.classList.remove('new-task-top');
        taskElement.classList.add('new-task-growing');

        setTimeout(() => {
            taskElement.classList.remove('new-task', 'new-task-growing');
        }, 300);
    }

    removeTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== id);
                this.saveToStorage();

                taskElement.remove();

                this.updateStats();
                this.updateEmptyState();
            }, 300);
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (!task) return;

        task.completed = !task.completed;
        task.timestamp = new Date().toISOString() // change task time on toggle

        this.saveToStorage();

        const oldElement = document.querySelector(`[data-task-id="${id}"]`);
        if (oldElement) {
            oldElement.classList.add('removing');

            setTimeout(() => {
                oldElement.remove();

                // Update task order in array
                this.tasks = this.tasks.filter(t => t.id !== id);

                if (task.completed) {
                    this.tasks.push(task);
                } else {
                    this.tasks.unshift(task);
                }

                this.saveToStorage();

                const taskElement = this.createTaskElement(task);

                if (task.completed) {
                    taskElement.classList.add('preparing-insert');
                    this.taskList.appendChild(taskElement);

                    taskElement.offsetHeight;

                    taskElement.classList.remove('preparing-insert');
                    taskElement.classList.add('new-task');
                } else {
                    taskElement.classList.add('new-task-top');
                    this.taskList.insertBefore(taskElement, this.taskList.firstChild);

                    taskElement.offsetHeight;

                    taskElement.classList.remove('new-task-top');
                    taskElement.classList.add('new-task-growing');
                }

                setTimeout(() => {
                    taskElement.classList.remove('new-task', 'new-task-growing');
                }, 300);

                this.updateStats();
            }, 300);
        }
    }


    clearAllTasks() {
        if (this.tasks.length === 0) return;

        if (confirm('Are you sure you want to clear all tasks?')) {
            const taskElements = document.querySelectorAll('.task-item');
            taskElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('removing');
                }, index * 50);
            });

            setTimeout(() => {
                this.tasks = [];
                this.saveToStorage();
                this.taskList.innerHTML = '';
                this.updateStats();
                this.updateEmptyState();
            }, taskElements.length * 50 + 300);
        }
    }

    clearCompletedTasks() {
        const CompletedTasks = this.tasks.filter(task => task.completed)
        if (CompletedTasks.length === 0) return;

        if (confirm('Are you sure you want to clear all completed tasks?')) {
            const taskElements = document.querySelectorAll('.task-item');
            taskElements.forEach((element, index) => {
                setTimeout(() => {
                    if (element.classList.contains('task-completed')) {
                        element.classList.add('removing');
                    }
                }, index * 50);
            });

            setTimeout(() => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveToStorage();
                this.renderTasks()
                this.updateStats();
                this.updateEmptyState();
            }, CompletedTasks.length * 50 + 300);
        }
    }

    renderTasks() {
        this.taskList.innerHTML = '';

        if (this.tasks.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }

    updateEmptyState() {
        if (this.tasks.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.classList.add('puff-in-center');
            this.emptyState.style.display = 'none';
        }
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item flex items-center gap-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-200 ${task.completed ? 'task-completed' : ''}`;
        li.setAttribute('data-task-id', task.id);

        const timestamp = new Date(task.timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="todoApp.toggleTask(${task.id})"
            >
            <span class="flex-1 text-gray-100 w-16 block break-words ${task.completed ? 'line-through' : ''}">
                ${this.escapeHtml(task.text)}
            </span>
            <span class="text-xs text-gray-500">[${timestamp}]</span>
            <button 
                class="text-red-400 hover:text-red-300 transition-colors text-sm px-2 py-1 rounded hover:bg-red-900/20"
                onclick="todoApp.removeTask(${task.id})"
            >
                [DEL]
            </button>
        `;

        return li;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        this.animateStatUpdate(this.totalTasks, total);
        this.animateStatUpdate(this.completedTasks, completed);
        this.animateStatUpdate(this.pendingTasks, pending);

        const scroller = document.getElementById('task-scroller');
        if (total >= 6) {
            scroller.classList.add('pr-2')
        } else {
            scroller.classList.remove('pr-2')
        }
    }

    animateStatUpdate(element, newValue) {
        element.classList.add('stat-updated');
        element.textContent = newValue;
        setTimeout(() => {
            element.classList.remove('stat-updated');
        }, 500);
    }

    saveToStorage() {
        localStorage.setItem('hackerTasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskIdCounter', this.taskIdCounter.toString());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById("main-content");
    if (container) {
        container.classList.add('puff-in-center');
    } else {
        console.log("Container not found!");
    }
});

const todoApp = new HackerTodo();