/* ---------- 1. Mobile menu (event handling + DOM) ---------- */
var menuButton = document.getElementById("menuToggle");
var navLinks = document.getElementById("navLinks");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", function () {
    var isOpen = navLinks.classList.toggle("open"); // show or hide menu
    menuButton.setAttribute("aria-expanded", isOpen);
    menuButton.textContent = isOpen ? "✕" : "☰";
  });
}

/* ---------- 2. Fade-in sections when scrolled into view ---------- */
var revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js"); // CSS hides items only when JS works
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach(function (item) { observer.observe(item); });
}

/* ---------- 3. Video fallback message (if media/intro.mp4 is missing) ---------- */
var introVideo = document.getElementById("introVideo");
var videoMsg = document.getElementById("videoMsg");
if (introVideo && videoMsg) {
  var source = introVideo.querySelector("source");
  source.addEventListener("error", function () {
    introVideo.style.display = "none";
    videoMsg.style.display = "block";
  });
}

/* ---------- 4. Profile photo fallback ---------- */
var profileImg = document.getElementById("profileImg");
if (profileImg) {
  profileImg.addEventListener("error", function () {
    profileImg.style.display = "none"; // shows the "Profile Photo" label underneath
  });
}

/* ---------- 5. Academic Planner ---------- */
var taskForm = document.getElementById("taskForm");

if (taskForm) {
  var taskList = document.getElementById("taskList");
  var titleInput = document.getElementById("taskTitle");
  var courseInput = document.getElementById("taskCourse");
  var dueInput = document.getElementById("taskDue");
  var taskError = document.getElementById("taskError");

  // Array that stores all tasks (each task is an object)
  var tasks = [];

  // Load saved tasks from localStorage
  function loadTasks() {
    try {
      var saved = localStorage.getItem("akazaTasks");
      if (saved) { tasks = JSON.parse(saved); }
    } catch (e) { tasks = []; }
  }

  // Save tasks to localStorage
  function saveTasks() {
    try { localStorage.setItem("akazaTasks", JSON.stringify(tasks)); } catch (e) {}
  }

  // Add new task
  function addTask(title, course, due) {
    var task = {
      id: Date.now(),          // unique id
      title: title,
      course: course || "General",
      due: due || "No due date",
      completed: false
    };
    tasks.push(task);
    saveTasks();
    renderTasks();
  }

  // Mark task as completed (click again to undo)
  function toggleTask(id) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) { tasks[i].completed = !tasks[i].completed; }
    }
    saveTasks();
    renderTasks();
  }

  // Delete task
  function deleteTask(id) {
    tasks = tasks.filter(function (task) { return task.id !== id; });
    saveTasks();
    renderTasks();
  }

  // Update statistics
  function updateStats() {
    var done = tasks.filter(function (t) { return t.completed; }).length;
    document.getElementById("statTotal").textContent = tasks.length;
    document.getElementById("statDone").textContent = done;
    document.getElementById("statPending").textContent = tasks.length - done;
  }

  // Render tasks on the page
  function renderTasks() {
    taskList.innerHTML = "";
    if (tasks.length === 0) {
      var empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No tasks yet. Add your first task above.";
      taskList.appendChild(empty);
    }
    tasks.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task" + (task.completed ? " done" : "");

      var info = document.createElement("div");
      var title = document.createElement("div");
      title.className = "task-title";
      title.textContent = task.title;
      var meta = document.createElement("div");
      meta.className = "task-meta";
      meta.textContent = "Course: " + task.course + " | Due: " + task.due + " | Status: " + (task.completed ? "Completed" : "Pending");
      info.appendChild(title);
      info.appendChild(meta);

      var actions = document.createElement("div");
      actions.className = "task-actions";

      var completeBtn = document.createElement("button");
      completeBtn.className = "btn btn-small";
      completeBtn.textContent = task.completed ? "Undo" : "Complete";
      completeBtn.addEventListener("click", function () { toggleTask(task.id); });

      var deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-small btn-gold";
      deleteBtn.textContent = "Delete";
      deleteBtn.setAttribute("aria-label", "Delete task " + task.title);
      deleteBtn.addEventListener("click", function () { deleteTask(task.id); });

      actions.appendChild(completeBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(info);
      li.appendChild(actions);
      taskList.appendChild(li);
    });
    updateStats();
  }

  // When the form is submitted
  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = titleInput.value.trim();
    if (title === "") {
      taskError.textContent = "Please enter a task title.";
      titleInput.classList.add("invalid");
      return;
    }
    taskError.textContent = "";
    titleInput.classList.remove("invalid");
    addTask(title, courseInput.value.trim(), dueInput.value);
    taskForm.reset();
    titleInput.focus();
  });

  loadTasks();
  renderTasks();
}

/* ---------- 6. Contact form validation ---------- */
var contactForm = document.getElementById("contactForm");

if (contactForm) {
  // Show or clear an error message for one field
  function setError(fieldId, message) {
    document.getElementById(fieldId + "Error").textContent = message;
    var input = document.getElementById(fieldId);
    if (message) { input.classList.add("invalid"); } else { input.classList.remove("invalid"); }
  }

  // Validate contact form
  function validateContact() {
    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var message = document.getElementById("message").value.trim();
    var valid = true;

    // Name must not be empty
    if (name === "") { setError("name", "Please enter your full name."); valid = false; }
    else { setError("name", ""); }

    // Email: not empty, then format check
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") { setError("email", "Please enter your email address."); valid = false; }
    else if (!emailPattern.test(email)) { setError("email", "Please enter a valid email address."); valid = false; }
    else { setError("email", ""); }

    // Phone: not empty, then digits only
    var digitsOnly = /^[0-9]+$/;
    if (phone === "") { setError("phone", "Please enter your phone number."); valid = false; }
    else if (!digitsOnly.test(phone)) { setError("phone", "Phone number must contain digits only."); valid = false; }
    else { setError("phone", ""); }

    // Message must not be empty
    if (message === "") { setError("message", "Please enter your message."); valid = false; }
    else { setError("message", ""); }

    return valid;
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var successBox = document.getElementById("successMsg");
    if (validateContact()) {
      successBox.style.display = "block";
      contactForm.reset();
    } else {
      successBox.style.display = "none";
    }
  });
}
