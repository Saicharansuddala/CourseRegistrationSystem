package com.example.CourseRegistrationSystem.controller;

import com.example.CourseRegistrationSystem.dto.EnrollRequest;
import com.example.CourseRegistrationSystem.dto.EnrollmentDto;
import com.example.CourseRegistrationSystem.model.Course;
import com.example.CourseRegistrationSystem.model.Enrollment;
import com.example.CourseRegistrationSystem.model.Student;
import com.example.CourseRegistrationSystem.repository.CourseRepository;
import com.example.CourseRegistrationSystem.repository.EnrollmentRepository;
import com.example.CourseRegistrationSystem.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public EnrollmentController(EnrollmentRepository enrollmentRepository, CourseRepository courseRepository,
                                 StudentRepository studentRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/enrollments")
    public ResponseEntity<EnrollmentDto> enroll(@RequestBody EnrollRequest request) {
        if (request.getStudentName() == null || request.getStudentName().isBlank()
                || request.getStudentEmail() == null || request.getStudentEmail().isBlank()
                || request.getCourseId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email and course are required");
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        long enrolledCount = enrollmentRepository.countByCourseId(course.getId());
        if (enrolledCount >= course.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This course is full");
        }

        Student student = studentRepository.findByEmailIgnoreCase(request.getStudentEmail().trim())
                .orElseGet(() -> studentRepository.save(
                        new Student(request.getStudentName().trim(), request.getStudentEmail().trim())));

        if (enrollmentRepository.findByStudentIdAndCourseId(student.getId(), course.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already enrolled in this course");
        }

        Enrollment enrollment = enrollmentRepository.save(new Enrollment(student, course));
        return ResponseEntity.status(HttpStatus.CREATED).body(EnrollmentDto.from(enrollment));
    }

    @GetMapping("/enrollments")
    @Transactional(readOnly = true)
    public List<EnrollmentDto> myEnrollments(@RequestParam String email) {
        return studentRepository.findByEmailIgnoreCase(email)
                .map(student -> enrollmentRepository.findByStudentIdOrderByEnrolledAtDesc(student.getId())
                        .stream().map(EnrollmentDto::from).toList())
                .orElseGet(List::of);
    }

    @DeleteMapping("/enrollments/{id}")
    public ResponseEntity<Void> drop(@PathVariable Long id) {
        if (!enrollmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        enrollmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
