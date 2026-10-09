// ==========================================
// TO-DO LIST LIFE DASHBOARD
// Vanilla JavaScript + Local Storage API
// ==========================================

const STORAGE_KEYS = {
    tasks: "lifeDashboard_tasks",
    links: "lifeDashboard_links",
    name: "lifeDashboard_name",
    theme: "lifeDashboard_theme",
    duration: "lifeDashboard_duration"
};

// ---------- DOM ELEMENTS ----------
const currentTime = document.getElementById("currentTime");
const currentDate = document.getElementById("currentDate");
const greeting = document.getElementById("greeting");

const nameInput = document.getElementById("nameInput");
const saveNameBtn = document.getElementById("saveNameBtn");

const timerDisplay = document.getElementById("timerDisplay");
const durationSelect = document.getElementById("durationSelect");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskMessage = document.getElementById("taskMessage");

const linkForm = document.getElementById("linkForm");
const linkNameInput = document.getElementById("linkNameInput");
const linkUrlInput = document.getElementById("linkUrlInput");
const linkList = document.getElementById("linkList");
const linkMessage = document.getElementById("linkMessage");

const themeToggle = document.getElementById("themeToggle");

// ---------- STORAGE HELPERS ----------
function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error("Failed to load Local Storage data:", error);
        return fallback;
    }
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// ---------- GREETING / CLOCK ----------
function updateDateTime() {
    const now = new Date();

    currentTime.textContent = now.toLocaleTimeString("en-US", {
        hour12: false
    });

    currentDate.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    updateGreeting(now.getHours());
}

function updateGreeting(hour) {
    let message;

    if (hour >= 5 && hour < 12) {
        message = "Good Morning";
    } else if (hour >= 12 && hour < 18) {
        message = "Good Afternoon";
    } else {
        message = "Good Evening";
    }

    const name = localStorage.getItem(STORAGE_KEYS.name);

    greeting.textContent = name
        ? `${message}, ${name}!`
        : message;
}

function loadName() {
    const savedName = localStorage.getItem(STORAGE_KEYS.name);

    if (savedName) {
        nameInput.value = savedName;
    }
}

saveNameBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();

    if (!name) {
        localStorage.removeItem(STORAGE_KEYS.name);
        updateDateTime();
        return;
    }

    localStorage.setItem(STORAGE_KEYS.name, name);
    updateDateTime();
});

// ---------- FOCUS TIMER ----------
let timerInterval = null;
let remainingSeconds = 25 * 60;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);
}

function getSelectedDuration() {
    return Number(durationSelect.value) * 60;
}

function startTimer() {
    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateTimerDisplay();
        } else {
            stopTimer();
            alert("Focus session completed!");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    remainingSeconds = getSelectedDuration();
    updateTimerDisplay();
}

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);

durationSelect.addEventListener("change", () => {
    const selectedMinutes = Number(durationSelect.value);

    localStorage.setItem(
        STORAGE_KEYS.duration,
        String(selectedMinutes)
    );

    resetTimer();
});

function loadTimerSettings() {
    const savedDuration = Number(
        localStorage.getItem(STORAGE_KEYS.duration)
    );

    if ([15, 25, 30, 45, 60].includes(savedDuration)) {
        durationSelect.value = String(savedDuration);
    }

    remainingSeconds = getSelectedDuration();
    updateTimerDisplay();
}

// ---------- TO-DO LIST ----------
let tasks = loadData(STORAGE_KEYS.tasks, []);

function showTaskMessage(message) {
    taskMessage.textContent = message;

    setTimeout(() => {
        taskMessage.textContent = "";
    }, 2500);
}

function renderTasks() {
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty-state";
        empty.textContent = "No tasks yet.";
        taskList.appendChild(empty);
        return;
    }

    tasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? "completed" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete ${task.text}`);

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveData(STORAGE_KEYS.tasks, tasks);
            renderTasks();
        });

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        // Required feature: Edit task
        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.type = "button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            const newText = prompt("Edit task:", task.text);

            if (newText === null) {
                return;
            }

            const trimmedText = newText.trim();

            if (!trimmedText) {
                showTaskMessage("Task cannot be empty.");
                return;
            }

            // Challenge: Prevent duplicate tasks
            const duplicate = tasks.some(
                (item) =>
                    item.id !== task.id &&
                    item.text.toLowerCase() === trimmedText.toLowerCase()
            );

            if (duplicate) {
                showTaskMessage("This task already exists.");
                return;
            }

            task.text = trimmedText;
            saveData(STORAGE_KEYS.tasks, tasks);
            renderTasks();
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((item) => item.id !== task.id);
            saveData(STORAGE_KEYS.tasks, tasks);
            renderTasks();
        });

        actions.append(editButton, deleteButton);
        li.append(checkbox, text, actions);
        taskList.appendChild(li);
    });
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        return;
    }

    // Challenge: Prevent duplicate tasks
    const duplicate = tasks.some(
        (task) => task.text.toLowerCase() === text.toLowerCase()
    );

    if (duplicate) {
        showTaskMessage("This task already exists.");
        return;
    }

    tasks.push({
        id: Date.now(),
        text,
        completed: false
    });

    saveData(STORAGE_KEYS.tasks, tasks);
    taskInput.value = "";
    renderTasks();
});

// ---------- QUICK LINKS ----------
let links = loadData(STORAGE_KEYS.links, []);

function showLinkMessage(message) {
    linkMessage.textContent = message;

    setTimeout(() => {
        linkMessage.textContent = "";
    }, 2500);
}

function normalizeUrl(url) {
    const trimmed = url.trim();

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    return `https://${trimmed}`;
}

function isValidUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function renderLinks() {
    linkList.innerHTML = "";

    if (links.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No quick links yet.";
        linkList.appendChild(empty);
        return;
    }

    links.forEach((link) => {
        const wrapper = document.createElement("div");
        wrapper.className = "link-item";

        const anchor = document.createElement("a");
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = link.name;

        const removeButton = document.createElement("button");
        removeButton.className = "remove-link";
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", `Remove ${link.name}`);

        removeButton.addEventListener("click", () => {
            links = links.filter((item) => item.id !== link.id);
            saveData(STORAGE_KEYS.links, links);
            renderLinks();
        });

        wrapper.append(anchor, removeButton);
        linkList.appendChild(wrapper);
    });
}

linkForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = linkNameInput.value.trim();
    const url = normalizeUrl(linkUrlInput.value);

    if (!name || !isValidUrl(url)) {
        showLinkMessage("Please enter a valid link.");
        return;
    }

    const duplicate = links.some(
        (link) =>
            link.name.toLowerCase() === name.toLowerCase() ||
            link.url.toLowerCase() === url.toLowerCase()
    );

    if (duplicate) {
        showLinkMessage("This link already exists.");
        return;
    }

    links.push({
        id: Date.now(),
        name,
        url
    });

    saveData(STORAGE_KEYS.links, links);

    linkNameInput.value = "";
    linkUrlInput.value = "";

    renderLinks();
});

// ---------- CHALLENGE 1: LIGHT / DARK MODE ----------
function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "light";
    applyTheme(savedTheme);
}

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";

    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    applyTheme(newTheme);
});

// ---------- INITIALIZE ----------
updateDateTime();
setInterval(updateDateTime, 1000);

loadName();
loadTimerSettings();
loadTheme();
renderTasks();
renderLinks();
