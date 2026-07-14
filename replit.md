# Wildroot Field Academy — Course Registration System

## Overview
A Spring Boot course registration app themed as a nature/field-studies academy ("Wildroot Field Academy"). Students browse a catalog of outdoor science courses (forest ecology, marine biology, astronomy, etc.), each illustrated with a real nature photo, and enroll by email — no login required. Students can look up their schedule by email and drop courses.

## Stack
- **Backend:** Java 17, Spring Boot 4.1 (Spring MVC + Spring Data JPA), Maven
- **Database:** Replit's built-in PostgreSQL (connected via `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD` env vars; schema auto-created via `spring.jpa.hibernate.ddl-auto=update`)
- **Frontend:** Static HTML/CSS/vanilla JS served from `src/main/resources/static`, calling the JSON REST API under `/api/**`. No frontend build step.

## Structure
- `model/` — JPA entities: `Course`, `Student`, `Enrollment` (unique on student+course)
- `repository/` — Spring Data repositories
- `controller/` — `CourseController` (catalog CRUD), `EnrollmentController` (enroll/lookup/drop), `ApiExceptionHandler`
- `dto/` — response/request DTOs (`CourseDto` includes computed seats-left)
- `config/DataSeeder` — seeds 10 nature courses on startup if the `courses` table is empty
- `src/main/resources/static/` — `index.html`, `css/styles.css`, `js/app.js`, `images/*.jpg` (real nature photos), `favicon.svg`

## Running
- Workflow **"Start application"** runs `./mvnw spring-boot:run` on port 5000 (webview).
- Restart the workflow after any Java source change (Maven recompiles automatically on `spring-boot:run`, but a restart guarantees it picks up new classes).

## API
- `GET /api/courses` — catalog with computed `seatsLeft`
- `POST /api/enrollments` — body `{ studentName, studentEmail, courseId }`; creates the student if new, rejects duplicates/full courses
- `GET /api/enrollments?email=` — a student's enrollments
- `DELETE /api/enrollments/{id}` — drop a course

## User preferences
(none recorded yet)
