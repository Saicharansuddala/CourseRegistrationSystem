package com.example.CourseRegistrationSystem.repository;

import com.example.CourseRegistrationSystem.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCode(String code);
}
