let courses = [];
let activeCourseId = null;

const grid = document.getElementById("courseGrid");
const toast = document.getElementById("toast");
const modalOverlay = document.getElementById("modalOverlay");
const modalCourseTitle = document.getElementById("modalCourseTitle");

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

function openModal(courseId) {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return;
  activeCourseId = courseId;
  modalCourseTitle.textContent = `${course.code} — ${course.title}`;
  document.getElementById("studentName").value = "";
  document.getElementById("studentEmail").value = "";
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
  const studentName = document.getElementById("studentName").value.trim();
  const studentEmail = document.getElementById("studentEmail").value.trim();
  if (!activeCourseId || !studentName || !studentEmail) return;

  try {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentName, studentEmail, courseId: activeCourseId }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.message || "Could not enroll. Please try again.", true);
      return;
    }
    showToast(`You're enrolled in ${data.courseCode}!`);
    closeModal();
    await loadCourses();
  } catch (err) {
    showToast("Network error. Please try again.", true);
  }
});

async function lookupEnrollments() {
  const email = document.getElementById("lookupEmail").value.trim();
  const list = document.getElementById("enrollmentList");
  if (!email) {
    showToast("Enter an email to look up your schedule.", true);
    return;
  }
  list.innerHTML = '<p class="empty-state">Searching…</p>';
  try {
    const res = await fetch(`/api/enrollments?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (!data.length) {
      list.innerHTML = '<p class="empty-state">No enrollments found for that email yet.</p>';
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

loadCourses();
