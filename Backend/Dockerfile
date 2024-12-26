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
RUN pip install numpy ANNarchy flask flask-cors

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo app.py al contenedor
COPY app.py .

# Define el comando por defecto para ejecutar la aplicación
CMD ["python", "app.py"]
