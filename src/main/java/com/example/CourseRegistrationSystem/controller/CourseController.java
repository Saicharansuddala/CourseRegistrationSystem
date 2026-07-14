package com.example.CourseRegistrationSystem.controller;

import com.example.CourseRegistrationSystem.dto.CourseDto;
import com.example.CourseRegistrationSystem.model.Course;
import com.example.CourseRegistrationSystem.repository.CourseRepository;
import com.example.CourseRegistrationSystem.repository.EnrollmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseController(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @GetMapping
    public List<CourseDto> listCourses() {
        return courseRepository.findAll().stream()
                .map(c -> CourseDto.from(c, enrollmentRepository.countByCourseId(c.getId())))
                .sorted((a, b) -> a.getCode().compareTo(b.getCode()))
                .toList();
    }

    @GetMapping("/{id}")
    public CourseDto getCourse(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Course not found"));
        return CourseDto.from(course, enrollmentRepository.countByCourseId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDto createCourse(@RequestBody Course course) {
        Course saved = courseRepository.save(course);
        return CourseDto.from(saved, 0);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
