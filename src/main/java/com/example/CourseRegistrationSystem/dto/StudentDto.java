package com.example.CourseRegistrationSystem.dto;

import com.example.CourseRegistrationSystem.model.Student;

public class StudentDto {
    private Long id;
    private String name;
    private String email;

    public static StudentDto from(Student s) {
        StudentDto dto = new StudentDto();
        dto.id = s.getId();
        dto.name = s.getName();
        dto.email = s.getEmail();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
}
