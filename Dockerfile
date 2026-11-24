# ==========================================
# Etapa 1: Compilacion de Spring Boot (Java 23)
# ==========================================
FROM eclipse-temurin:23-jdk AS builder
WORKDIR /app

# Copiar wrapper y pom.xml desde la carpeta Backend
COPY Backend/.mvn/ .mvn
COPY Backend/mvnw Backend/pom.xml ./
RUN chmod +x mvnw

# Descargar dependencias
RUN ./mvnw dependency:go-offline -B || true

# Copiar codigo fuente del Backend y compilar JAR
COPY Backend/src ./src
RUN ./mvnw clean package -DskipTests

# ==========================================
# Etapa 2: Imagen ligera de ejecucion JRE 23
# ==========================================
FROM eclipse-temurin:23-jre
WORKDIR /app

# Usuario de seguridad
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copiar el jar compilado
COPY --from=builder /app/target/*.jar app.jar

# Puerto de la app
EXPOSE 8080

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
