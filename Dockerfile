# Usar una imagen base que tenga Node.js y Python
FROM node:16-buster as build-frontend

# Instalar dependencias del frontend
WORKDIR /frontend
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm install

# Construir el frontend
RUN npm run build

# Usar una imagen base con Python y Docker
FROM python:3.9-slim as build-backend

# Instalar dependencias del backend
WORKDIR /backend
COPY ./backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Instalar Docker para la simulación
RUN apt-get update && apt-get install -y docker.io

# Configurar contenedor final
FROM python:3.9-slim

# Copiar archivos del frontend y el backend
COPY --from=build-frontend /frontend/build /frontend/build
COPY --from=build-backend /backend /backend

# Exponer puertos
EXPOSE 5000 3000

# Comando para ejecutar el frontend y backend
CMD ["sh", "-c", "cd /frontend && npm start & cd /backend && python app.py"]
