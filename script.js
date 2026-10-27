const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDeadline = document.getElementById("taskDeadline");
const taskStatus = document.getElementById("taskStatus");
const taskList = document.getElementById("taskList");
const searchTask = document.getElementById("searchTask");

let tasks = JSON.parse(localStorage.getItem("projectTasks")) || [];
let editingTaskId = null;

function saveTasks() {
localStorage.setItem("projectTasks", JSON.stringify(tasks));
}

function updateSummary() {
document.getElementById("totalTasks").textContent = tasks.length;

document.getElementById("progressTasks").textContent =
    tasks.filter(task => task.status === "In Progress").length;

document.getElementById("completedTasks").textContent =
    tasks.filter(task => task.status === "Completed").length;

}

function renderTasks() {
taskList.innerHTML = "";

const searchText = searchTask.value.toLowerCase().trim();

const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchText) ||
    task.description.toLowerCase().includes(searchText)
);

if (filteredTasks.length === 0) {
    taskList.innerHTML =
        '<p class="empty-message">No tasks found. Add a new task!</p>';
}

filteredTasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.textContent = task.description || "No description provided.";

    const status = document.createElement("span");
    status.className = "status";
    status.textContent = task.status;

    const priority = document.createElement("p");
    priority.textContent = "Priority: " + task.priority;

    const deadline = document.createElement("p");
    deadline.textContent = "Deadline: " + (task.deadline || "Not set");

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const statusSelect = document.createElement("select");

    ["To Do", "In Progress", "Completed"].forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        statusSelect.appendChild(option);
    });

    statusSelect.value = task.status;
    statusSelect.setAttribute("aria-label", "Change task status");

    statusSelect.addEventListener("change", () => {
        task.status = statusSelect.value;
        saveTasks();
        renderTasks();
        updateSummary();
    });

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-btn";
    editButton.addEventListener("click", () => editTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(statusSelect, editButton, deleteButton);
    card.append(title, description, status, priority, deadline, actions);
    taskList.appendChild(card);
});

updateSummary();

}

taskForm.addEventListener("submit", function(event) {
event.preventDefault();

const title = taskTitle.value.trim();

if (!title) {
    alert("Please enter a task title.");
    return;
}

const taskData = {
    title: title,
    description: taskDescription.value.trim(),
    priority: taskPriority.value,
    deadline: taskDeadline.value,
    status: taskStatus.value
};

if (editingTaskId !== null) {
    const task = tasks.find(task => task.id === editingTaskId);

    if (task) {
        Object.assign(task, taskData);
    }

    editingTaskId = null;
    taskForm.querySelector('button[type="submit"]').textContent = "Add Task";
} else {
    tasks.push({
        id: Date.now(),
        ...taskData
    });
}

saveTasks();
taskForm.reset();
taskPriority.value = "Medium";
taskStatus.value = "To Do";

renderTasks();

});

function editTask(id) {
const task = tasks.find(task => task.id === id);

if (!task) return;

taskTitle.value = task.title;
taskDescription.value = task.description;
taskPriority.value = task.priority;
taskDeadline.value = task.deadline;
taskStatus.value = task.status;

editingTaskId = id;
taskForm.querySelector('button[type="submit"]').textContent = "Save Changes";

taskForm.scrollIntoView({ behavior: "smooth", block: "start" });
taskTitle.focus();

}

function deleteTask(id) {
if (!confirm("Are you sure you want to delete this task?")) {
return;
}

tasks = tasks.filter(task => task.id !== id);

if (editingTaskId === id) {
    editingTaskId = null;
    taskForm.reset();
    taskForm.querySelector('button[type="submit"]').textContent = "Add Task";
}

saveTasks();
renderTasks();

}

searchTask.addEventListener("input", renderTasks);

renderTasks();