import { useState, useEffect } from 'react';
import './index.css';

const STORAGE_KEY = "wildroot_student";
const API = import.meta.env.VITE_API_URL ?? '';

function App() {
  const [courses, setCourses] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', isError: false, show: false });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [gateName, setGateName] = useState('');
  const [gateEmail, setGateEmail] = useState('');
  const [gateError, setGateError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [lookupEmail, setLookupEmail] = useState(currentStudent ? currentStudent.email : '');
  const [isEnrollListLoading, setIsEnrollListLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (currentStudent) {
      setLookupEmail(currentStudent.email);
      lookupEnrollments(currentStudent.email);
    }
  }, [currentStudent]);

  const showToast = (message, isError = false) => {
    setToast({ message, isError, show: true });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3200);
  };

  const loadCourses = async () => {
    try {
      const res = await fetch(`${API}/api/courses`);
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setGateError('');
    if (!gateName || !gateEmail) return;
    setIsRegistering(true);

    try {
      const res = await fetch(`${API}/api/students/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gateName, email: gateEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGateError(data.message || "Could not register. Please try again.");
        return;
      }
      setCurrentStudent(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      setGateError("Network error. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const switchAccount = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStudent(null);
    setIsProfileModalOpen(false);
    setGateName('');
    setGateEmail('');
    setGateError('');
    setEnrollments([]);
    setLookupEmail('');
  };

  const lookupEnrollments = async (emailToLookup = lookupEmail) => {
    if (!emailToLookup) return;
    setIsEnrollListLoading(true);
    try {
      const res = await fetch(`${API}/api/enrollments?email=${encodeURIComponent(emailToLookup)}`);
      const data = await res.json();
      setEnrollments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnrollListLoading(false);
    }
  };

  const dropEnrollment = async (id) => {
    if (!window.confirm("Drop this course?")) return;
    try {
      const res = await fetch(`${API}/api/enrollments/${id}`, { method: "DELETE" });
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
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!activeCourseId || !currentStudent) return;

    try {
      const res = await fetch(`${API}/api/enrollments`, {
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
      setActiveCourseId(null);
      await loadCourses();
      lookupEnrollments();
    } catch (err) {
      showToast("Network error. Please try again.", true);
    }
  };

  const activeCourse = courses.find(c => c.id === activeCourseId);
  const seatsLeft = courses.reduce((sum, c) => sum + c.seatsLeft, 0);

  return (
    <div className={!currentStudent ? "gated" : ""}>
      {!currentStudent && (
        <div className="gate-overlay" id="gateOverlay">
          <div className="gate-card">
            <div className="gate-eyebrow">🌲 Wildroot Field Academy</div>
            <h1>Register to enter the academy</h1>
            <p>Tell us who you are before you browse the trail catalog. It only takes a moment, and you won't need to re-enter it to enroll.</p>
            <form id="gateForm" onSubmit={handleRegister}>
              <label htmlFor="gateName">Full name</label>
              <input type="text" id="gateName" required placeholder="Jordan Rivers" autoComplete="name" value={gateName} onChange={e => setGateName(e.target.value)} />
              <label htmlFor="gateEmail">Email</label>
              <input type="email" id="gateEmail" required placeholder="you@example.com" autoComplete="email" value={gateEmail} onChange={e => setGateEmail(e.target.value)} />
              <button type="submit" className="btn-primary gate-submit" disabled={isRegistering}>
                {isRegistering ? "Registering…" : "Enter the academy"}
              </button>
            </form>
            <p className="gate-error" id="gateError">{gateError}</p>
          </div>
        </div>
      )}

      <nav className={`site-nav ${isScrolled ? 'scrolled' : ''}`} id="siteNav">
        <div className="brand"><span className="brand-mark">🌿</span> Wildroot Field Academy</div>
        <ul className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} id="navLinks">
          <li><a href="#courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</a></li>
          <li><a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a></li>
          <li><a href="#my-courses" onClick={() => setIsMobileMenuOpen(false)}>My Enrollments</a></li>
          <li className="nav-links-mobile-only">
            <button className="nav-profile" onClick={() => { setIsProfileModalOpen(true); setIsMobileMenuOpen(false); }}>
              <span className="nav-profile-avatar">👤</span>
              <span id="navStudentNameMobile">{currentStudent?.name.split(" ")[0]}</span>
            </button>
          </li>
        </ul>
        <div className="nav-account">
          {currentStudent && (
            <button className="nav-profile" id="navProfile" onClick={() => setIsProfileModalOpen(true)}>
              <span className="nav-profile-avatar">👤</span>
              <span id="navStudentName">{currentStudent.name.split(" ")[0]}</span>
            </button>
          )}
          <button className="nav-cta" onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}>Browse Courses</button>
          <button className="nav-toggle" id="navToggle" aria-label="Open menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="container hero-content">
          <div className="hero-eyebrow">🌲 Field-based learning since the trailhead</div>
          <h1>Learn where the wild things grow.</h1>
          <p>Wildroot Field Academy runs hands-on nature courses in forests, reefs, deserts and night skies. Pick a trail, reserve your seat, and start your semester outdoors.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}>Explore Courses</button>
            <button className="btn-secondary" onClick={() => document.getElementById('my-courses').scrollIntoView({ behavior: 'smooth' })}>Check My Enrollments</button>
          </div>
          <div className="hero-stats">
            <div><strong id="statCourses">{courses.length}</strong><span>Field courses</span></div>
            <div><strong id="statSeats">{seatsLeft || "–"}</strong><span>Seats open now</span></div>
            <div><strong>1:12</strong><span>Instructor ratio</span></div>
          </div>
        </div>
      </header>

      <section className="courses" id="courses">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Course Catalog</span>
            <h2>Ten trails, ten ecosystems</h2>
            <p>Every course pairs a field site with a working scientist. Seats are limited so each cohort keeps its footprint small.</p>
          </div>
          <div className="course-grid" id="courseGrid">
            {courses.length === 0 ? (
              <p className="empty-state">No courses are open yet. Check back soon.</p>
            ) : (
              courses.map(course => {
                const full = course.seatsLeft <= 0;
                return (
                  <article className="course-card" key={course.id}>
                    <div className="course-media">
                      <img src={course.imageUrl || "/images/placeholder.jpg"} alt={course.title} loading="lazy" />
                      <span className="course-code">{course.code}</span>
                      <span className={`seats-badge ${full ? "full" : ""}`}>{full ? "Full" : `${course.seatsLeft} seats left`}</span>
                    </div>
                    <div className="course-body">
                      <h3>{course.title}</h3>
                      <div className="course-meta">
                        <span>{course.credits} credits</span>
                        <span>·</span>
                        <span>{course.location}</span>
                      </div>
                      <p className="course-desc">{course.description}</p>
                      <div className="course-footer">
                        <span className="instructor">{course.instructor}</span>
                        <button className="enroll-btn" disabled={full} onClick={() => {
                          if (!currentStudent) { showToast("Please register first.", true); return; }
                          setActiveCourseId(course.id);
                        }}>
                          {full ? "Full" : "Enroll"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="trail" id="about">
        <div className="container">
          <div className="trail-media">
            <img src="/images/rainforest.jpg" alt="Waterfall in a lush rainforest" />
          </div>
          <div className="trail-copy">
            <span className="section-eyebrow">Why Wildroot</span>
            <h2>Small cohorts, real field sites, no lecture halls.</h2>
            <p>We built Wildroot around a simple idea: ecology is best learned outdoors. Every course listed here runs at an active field station, farm, reef, or observatory — not a classroom.</p>
            <ul className="trail-list">
              <li>Every instructor is an active field researcher in their subject.</li>
              <li>Class sizes are capped so every student gets hands-on time.</li>
              <li>Enroll instantly online — no waitlist forms, no office hours required.</li>
              <li>Credits transfer to most environmental science and biology programs.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="my-courses" id="my-courses">
        <div className="container">
          <div className="section-head">
            <span className="section-eyebrow">Your Schedule</span>
            <h2>Look up your enrollments</h2>
            <p>Enter the email you used when enrolling to see your current course schedule.</p>
          </div>
          <div className="lookup-row">
            <input type="email" id="lookupEmail" placeholder="you@example.com" readOnly value={lookupEmail} />
            <button onClick={() => lookupEnrollments()}>View schedule</button>
          </div>
          <div className="enrollment-list" id="enrollmentList">
            {isEnrollListLoading ? (
               <p className="empty-state">Searching…</p>
            ) : !lookupEmail ? (
               <p className="empty-state">Register to see your enrolled courses.</p>
            ) : enrollments.length === 0 ? (
               <p className="empty-state">No enrollments found yet. Browse the catalog above to reserve a seat.</p>
            ) : (
              enrollments.map(enrollment => (
                <div className="enrollment-item" key={enrollment.id}>
                  <img src={enrollment.imageUrl || "/images/placeholder.jpg"} alt={enrollment.courseTitle} />
                  <div className="details">
                    <h4>{enrollment.courseTitle}</h4>
                    <span>{enrollment.courseCode} · Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                  </div>
                  <button className="drop-btn" onClick={() => dropEnrollment(enrollment.id)}>Drop</button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <div className="brand"><span className="brand-mark">🌿</span> Wildroot Field Academy</div>
              <p>A field-first course registration system for students who'd rather learn under a canopy than fluorescent lights.</p>
            </div>
          </div>
          <div className="footer-bottom">© 2026 Wildroot Field Academy. All trails lead outside.</div>
        </div>
      </footer>

      <div className={`toast ${toast.isError ? 'error' : ''} ${toast.show ? 'show' : ''}`} id="toast">{toast.message}</div>

      {/* Profile Modal */}
      <div className={`modal-overlay ${isProfileModalOpen ? 'show' : ''}`} id="profileModalOverlay" onClick={(e) => { if(e.target.id === 'profileModalOverlay') setIsProfileModalOpen(false); }}>
        <div className="modal">
          <button className="modal-close" onClick={() => setIsProfileModalOpen(false)}>&times;</button>
          <h3>My profile</h3>
          <span className="modal-course">Your registration details</span>
          <div className="profile-details">
            <div className="profile-row"><span>Full name</span><strong id="profileName">{currentStudent?.name}</strong></div>
            <div className="profile-row"><span>Email</span><strong id="profileEmail">{currentStudent?.email}</strong></div>
            <div className="profile-row"><span>Courses enrolled</span><strong id="profileEnrollCount">{enrollments.length}</strong></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={() => setIsProfileModalOpen(false)}>Close</button>
            <button type="button" className="modal-submit" onClick={switchAccount}>Switch account</button>
          </div>
        </div>
      </div>

      {/* Enroll Modal */}
      <div className={`modal-overlay ${activeCourseId ? 'show' : ''}`} id="modalOverlay" onClick={(e) => { if(e.target.id === 'modalOverlay') setActiveCourseId(null); }}>
        <div className="modal">
          <button className="modal-close" onClick={() => setActiveCourseId(null)}>&times;</button>
          <h3>Reserve your seat</h3>
          <span className="modal-course" id="modalCourseTitle">{activeCourse ? `${activeCourse.code} — ${activeCourse.title}` : ''}</span>
          <p className="modal-student">Enrolling as <strong id="modalStudentName">{currentStudent?.name}</strong> (<span id="modalStudentEmail">{currentStudent?.email}</span>)</p>
          <form id="enrollForm" onSubmit={handleEnroll}>
            <div className="modal-actions">
              <button type="button" className="modal-cancel" onClick={() => setActiveCourseId(null)}>Cancel</button>
              <button type="submit" className="modal-submit">Confirm enrollment</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}

export default App;
