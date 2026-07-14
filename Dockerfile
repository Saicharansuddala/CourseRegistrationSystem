# ─────────────────────────────────────────
# Stage 1: Build the React frontend
# ─────────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Install dependencies first (better layer caching)
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Build the Spring Boot JAR
# ─────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build

WORKDIR /app

# Cache Maven dependencies first
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Copy the React build output into Spring Boot's static folder
# so Spring Boot serves the frontend from the same server
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

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
