# ==========================================
# Etapa 1: Compilacion con Maven y Java 23
# ==========================================
FROM eclipse-temurin:23-jdk AS builder
WORKDIR /app

# Copiar wrapper de Maven y descriptor pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Descargar dependencias para aprovechar la cache de capas
RUN ./mvnw dependency:go-offline -B || true

# Copiar codigo fuente y compilar empaquetando el .jar (sin tests para agilizar)
COPY src ./src
RUN ./mvnw clean package -DskipTests

# ==========================================
# Etapa 2: Imagen ligera de ejecucion JRE 23
# ==========================================
FROM eclipse-temurin:23-jre
WORKDIR /app

# Usuario no-root por seguridad
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copiar el artefacto .jar generado
COPY --from=builder /app/target/*.jar app.jar

# Puerto por defecto (sobreescrito dinamicamente por la nube si define PORT)
EXPOSE 8080

# Optimizacion de memoria para entornos Cloud
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Comando de arranque
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
