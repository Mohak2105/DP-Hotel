# Build stage using official Maven + Java 21 image
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage using lightweight JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/dp-hotel-backend-*.jar app.jar

ENV PORT=5001
EXPOSE 5001

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-5001} -jar app.jar"]
