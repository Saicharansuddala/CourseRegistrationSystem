package com.example.CourseRegistrationSystem.dto;

import com.example.CourseRegistrationSystem.model.Enrollment;

import java.time.Instant;

public class EnrollmentDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private String courseCode;
    private String imageUrl;
    private Instant enrolledAt;

    public static EnrollmentDto from(Enrollment e) {
        EnrollmentDto dto = new EnrollmentDto();
        dto.id = e.getId();
        dto.studentId = e.getStudent().getId();
        dto.studentName = e.getStudent().getName();
        dto.courseId = e.getCourse().getId();
        dto.courseTitle = e.getCourse().getTitle();
        dto.courseCode = e.getCourse().getCode();
        dto.imageUrl = e.getCourse().getImageUrl();
        dto.enrolledAt = e.getEnrolledAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public Long getCourseId() {
        return courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }
}
