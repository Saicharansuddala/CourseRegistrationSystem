let courses = [];
let activeCourseId = null;
let currentStudent = null;

const grid = document.getElementById("courseGrid");
const toast = document.getElementById("toast");
const modalOverlay = document.getElementById("modalOverlay");
const modalCourseTitle = document.getElementById("modalCourseTitle");
const profileModalOverlay = document.getElementById("profileModalOverlay");
const STORAGE_KEY = "wildroot_student";
let lastEnrollmentCount = 0;

window.addEventListener("scroll", () => {
  document.getElementById("siteNav").classList.toggle("scrolled", window.scrollY > 40);
});

function showToast(message, isError) {
  toast.textContent = message;
  toast.classList.toggle("error", !!isError);
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ---------- Registration gate ---------- */

function loadStoredStudent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function storeStudent(student) {
  currentStudent = student;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
}

function unlockSite() {
  document.body.classList.remove("gated");
  document.getElementById("navStudentName").textContent = currentStudent.name.split(" ")[0];
  document.getElementById("lookupEmail").value = currentStudent.email;
  lookupEnrollments();
}

function switchAccount() {
  localStorage.removeItem(STORAGE_KEY);
  currentStudent = null;
  closeProfileModal();
  document.getElementById("gateName").value = "";
  document.getElementById("gateEmail").value = "";
  document.getElementById("gateError").textContent = "";
  document.body.classList.add("gated");
}

/* ---------- Profile modal ---------- */

function openProfileModal() {
  if (!currentStudent) return;
  document.getElementById("profileName").textContent = currentStudent.name;
  document.getElementById("profileEmail").textContent = currentStudent.email;
  document.getElementById("profileEnrollCount").textContent = lastEnrollmentCount;
  profileModalOverlay.classList.add("show");
}

function closeProfileModal() {
  profileModalOverlay.classList.remove("show");
}

profileModalOverlay.addEventListener("click", (e) => {
  if (e.target === profileModalOverlay) closeProfileModal();
});

document.getElementById("gateForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("gateName").value.trim();
  const email = document.getElementById("gateEmail").value.trim();
  const errorEl = document.getElementById("gateError");
  errorEl.textContent = "";
  if (!name || !email) return;

  const submitBtn = e.target.querySelector(".gate-submit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Registering…";

  try {
    const res = await fetch("/api/students/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.message || "Could not register. Please try again.";
      return;
    }
    storeStudent(data);
    unlockSite();
  } catch (err) {
    errorEl.textContent = "Network error. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enter the academy";
  }
});

/* ---------- Courses ---------- */

async function loadCourses() {
  try {
    const res = await fetch("/api/courses");
    if (!res.ok) throw new Error("Failed to load courses");
    courses = await res.json();
    renderCourses();
    updateHeroStats();
  } catch (err) {
    grid.innerHTML = '<p class="empty-state">Could not load courses right now. Please refresh.</p>';
  }
}

function updateHeroStats() {
  const seatsLeft = courses.reduce((sum, c) => sum + c.seatsLeft, 0);
  document.getElementById("statCourses").textContent = courses.length;
  document.getElementById("statSeats").textContent = seatsLeft;
}

function renderCourses() {
  if (!courses.length) {
    grid.innerHTML = '<p class="empty-state">No courses are open yet. Check back soon.</p>';
    return;
  }
  grid.innerHTML = courses.map(courseCardHtml).join("");
}

function courseCardHtml(course) {
  const full = course.seatsLeft <= 0;
  return `
    <article class="course-card">
      <div class="course-media">
        <img src="${course.imageUrl}" alt="${escapeHtml(course.title)}" loading="lazy" />
        <span class="course-code">${escapeHtml(course.code)}</span>
        <span class="seats-badge ${full ? "full" : ""}">${full ? "Full" : course.seatsLeft + " seats left"}</span>
      </div>
      <div class="course-body">
        <h3>${escapeHtml(course.title)}</h3>
        <div class="course-meta">
          <span>${course.credits} credits</span>
          <span>·</span>
          <span>${escapeHtml(course.location)}</span>
        </div>
        <p class="course-desc">${escapeHtml(course.description)}</p>
        <div class="course-footer">
          <span class="instructor">${escapeHtml(course.instructor)}</span>
          <button class="enroll-btn" ${full ? "disabled" : ""} onclick="openModal(${course.id})">
            ${full ? "Full" : "Enroll"}
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ---------- Enrollment modal ---------- */

function openModal(courseId) {
  if (!currentStudent) {
    showToast("Please register first.", true);
    return;
  }
  const course = courses.find((c) => c.id === courseId);
  if (!course) return;
  activeCourseId = courseId;
  modalCourseTitle.textContent = `${course.code} — ${course.title}`;
  document.getElementById("modalStudentName").textContent = currentStudent.name;
  document.getElementById("modalStudentEmail").textContent = currentStudent.email;
  modalOverlay.classList.add("show");
}

function closeModal() {
  modalOverlay.classList.remove("show");
  activeCourseId = null;
}

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById("enrollForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!activeCourseId || !currentStudent) return;

  try {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        courseId: activeCourseId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.message || "Could not enroll. Please try again.", true);
      return;
    }
    showToast(`You're enrolled in ${data.courseCode}!`);
    closeModal();
    await loadCourses();
    lookupEnrollments();
  } catch (err) {
    showToast("Network error. Please try again.", true);
  }
});

/* ---------- My enrollments ---------- */

async function lookupEnrollments() {
  const email = currentStudent ? currentStudent.email : document.getElementById("lookupEmail").value.trim();
  const list = document.getElementById("enrollmentList");
  if (!email) {
    list.innerHTML = '<p class="empty-state">Register to see your enrolled courses.</p>';
    return;
  }
  list.innerHTML = '<p class="empty-state">Searching…</p>';
  try {
    const res = await fetch(`/api/enrollments?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    lastEnrollmentCount = data.length;
    if (!data.length) {
      list.innerHTML = '<p class="empty-state">No enrollments found yet. Browse the catalog above to reserve a seat.</p>';
      return;
    }
    list.innerHTML = data.map(enrollmentItemHtml).join("");
  } catch (err) {
    list.innerHTML = '<p class="empty-state">Something went wrong. Please try again.</p>';
  }
}

function enrollmentItemHtml(enrollment) {
  return `
    <div class="enrollment-item">
      <img src="${enrollment.imageUrl}" alt="${escapeHtml(enrollment.courseTitle)}" />
      <div class="details">
        <h4>${escapeHtml(enrollment.courseTitle)}</h4>
        <span>${escapeHtml(enrollment.courseCode)} · Enrolled ${new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
      </div>
      <button class="drop-btn" onclick="dropEnrollment(${enrollment.id})">Drop</button>
    </div>
  `;
}

async function dropEnrollment(id) {
  if (!confirm("Drop this course?")) return;
  try {
    const res = await fetch(`/api/enrollments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Could not drop the course.", true);
      return;
    }
    showToast("Course dropped.");
    await loadCourses();
    lookupEnrollments();
  } catch (err) {
    showToast("Network error. Please try again.", true);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

/* ---------- Boot ---------- */

loadCourses();

const stored = loadStoredStudent();
if (stored && stored.email && stored.name) {
  currentStudent = stored;
  unlockSite();
} else {
  document.getElementById("gateName").focus();
}
