---
name: Spring Data JPA lazy loading in REST controllers
description: Why GET endpoints that map entities with LAZY relations to DTOs return 500 instead of data, and the fix.
---

With `spring.jpa.open-in-view=false` (recommended, avoids the open-session-in-view anti-pattern), the Hibernate session closes when the repository call returns. Any `@ManyToOne(fetch = FetchType.LAZY)` field accessed after that point (e.g. while building a DTO in the controller) throws `LazyInitializationException`, which a catch-all `@ExceptionHandler(Exception.class)` will silently turn into a generic 500 with no obvious cause in the client response.

**Why:** discovered when a "list a student's enrollments" endpoint (Enrollment -> Student/Course, both LAZY) returned `{"message":"Something went wrong"}` for any student who actually had enrollments, but returned `[]` fine for one with none — the empty-list path never touched the lazy proxies.

**How to apply:** when a controller method maps entities with lazy associations into a response DTO, add `@Transactional(readOnly = true)` to that controller method (or do the mapping in a `@Transactional` service method) so the session stays open through the mapping. Also scope any catch-all `@RestControllerAdvice` (e.g. via `basePackageClasses`) so it doesn't swallow framework-level exceptions like `NoResourceFoundException` for missing static assets (e.g. `/favicon.ico`) and turn expected 404s into 500s.
