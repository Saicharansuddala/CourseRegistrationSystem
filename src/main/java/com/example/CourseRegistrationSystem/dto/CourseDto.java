package com.example.CourseRegistrationSystem.dto;

import com.example.CourseRegistrationSystem.model.Course;

public class CourseDto {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String instructor;
    private Integer credits;
    private Integer capacity;
    private Integer enrolled;
    private Integer seatsLeft;
    private String imageUrl;
    private String location;

    public static CourseDto from(Course c, long enrolledCount) {
        CourseDto dto = new CourseDto();
        dto.id = c.getId();
        dto.code = c.getCode();
        dto.title = c.getTitle();
        dto.description = c.getDescription();
        dto.instructor = c.getInstructor();
        dto.credits = c.getCredits();
        dto.capacity = c.getCapacity();
        dto.enrolled = (int) enrolledCount;
        dto.seatsLeft = Math.max(0, c.getCapacity() - (int) enrolledCount);
        dto.imageUrl = c.getImageUrl();
        dto.location = c.getLocation();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getInstructor() {
        return instructor;
    }

    public Integer getCredits() {
        return credits;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public Integer getEnrolled() {
        return enrolled;
    }

    public Integer getSeatsLeft() {
        return seatsLeft;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getLocation() {
        return location;
    }
}
