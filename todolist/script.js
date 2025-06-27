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

        // Stats elements
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

        const task = {
            id: ++this.taskIdCounter,
            text: taskText,
            completed: false,
            timestamp: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.taskInput.value = '';
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
        taskElement.classList.add('new-task');

        this.taskList.insertBefore(taskElement, this.taskList.firstChild);

        setTimeout(() => {
            taskElement.classList.remove('new-task');
        }, 300);
    }

    insertSortedTaskElement(task) {
        const taskElement = this.createTaskElement(task);
        taskElement.classList.add('new-task');

        if (task.completed) {
            this.taskList.appendChild(taskElement); // to bottom
        } else {
            this.taskList.insertBefore(taskElement, this.taskList.firstChild); // to top
        }

        setTimeout(() => {
            taskElement.classList.remove('new-task');
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

                task.timestamp = new Date().toISOString() // change task time on toggle

                this.saveToStorage();

                this.insertSortedTaskElement(task);

                this.updateStats();
            }, 200);
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
        if (this.tasks.filter(task => task.completed).length === 0) return;

        if (confirm('Are you sure you want to clear all completed tasks?')) {
            const taskElements = document.querySelectorAll('.task-item');
            taskElements.forEach((element, index) => {
                setTimeout(() => {
                    if (element.classList.contains('task-completed')) {
                        element.classList.add('removing');
                        this.tasks.splice(index, 1);
                    }
                }, index * 50);
            });

            setTimeout(() => {
                this.saveToStorage();
                this.updateStats();
                this.updateEmptyState();
            }, taskElements.length * 50 + 300);
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
            <span class="flex-1 text-gray-100 ${task.completed ? 'line-through' : ''}">
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

const todoApp = new HackerTodo();