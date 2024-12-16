# Usa una base de Linux con Python
FROM python:3.9-slim

# Instala las dependencias necesarias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    cmake \
    git \
    && apt-get clean

# Instala ANNarchy y sus dependencias
RUN pip install numpy ANNarchy

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios (opcional si necesitas archivos locales)
# COPY . .

# Define un comando por defecto (puedes sobrescribirlo con 'docker run' si es necesario)
CMD ["python"]
