package com.example.CourseRegistrationSystem.controller;

import com.example.CourseRegistrationSystem.dto.RegisterRequest;
import com.example.CourseRegistrationSystem.dto.StudentDto;
import com.example.CourseRegistrationSystem.model.Student;
import com.example.CourseRegistrationSystem.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Registers (or re-identifies) a student before they can browse the catalog.
     * Idempotent: calling it again with the same email just returns the existing student.
     */
    @PostMapping("/register")
    public StudentDto register(@RequestBody RegisterRequest request) {
        if (request.getName() == null || request.getName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name and email are required");
        }

        String email = request.getEmail().trim();
        String name = request.getName().trim();

        Student student = studentRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> studentRepository.save(new Student(name, email)));

        return StudentDto.from(student);
    }
}
