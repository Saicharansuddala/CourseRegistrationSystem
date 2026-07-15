# ─────────────────────────────────────────
# Stage 1: Build the Spring Boot JAR
# ─────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build

WORKDIR /app

# Cache Maven dependencies first
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the JAR (skip tests for faster builds)
RUN mvn clean package -DskipTests -B

# ─────────────────────────────────────────
# Stage 3: Lean production image
# ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=backend-build /app/target/*.jar app.jar

# Change ownership
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]
