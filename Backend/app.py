from flask import Flask, request, jsonify
from flask_cors import CORS
from threading import Thread, Lock
from queue import Queue
import subprocess
import os
import time
import uuid  # Importar módulo uuid

app = Flask(__name__)
CORS(app)

# Cola para manejar solicitudes y un lock para proteger la cola
job_queue = Queue()
queue_lock = Lock()

# Diccionario para almacenar los trabajos en progreso
in_progress_jobs = {}

# Función para procesar trabajos de la cola
def process_jobs():
    while True:
        job_id, code = job_queue.get()  # Tomar un trabajo de la cola
        if job_id is None:  # Señal para terminar el worker
            break
        with queue_lock:
            in_progress_jobs[job_id] = True

        try:
            # Guardar el código en un archivo temporal
            temp_filename = f'temp_simulation_{job_id}.py'
            with open(temp_filename, 'w') as temp_file:
                temp_file.write(code)

            # Ejecutar el código
            print(f"Ejecutando código para el trabajo {job_id}", flush=True)
            result = subprocess.run(
                ['python', temp_filename],
                capture_output=True,
                text=True
            )
            print(f"STDOUT: {result.stdout}", flush=True)
            print(f"STDERR: {result.stderr}", flush=True)
            print(f"Return Code: {result.returncode}", flush=True)
            print(f"Código ejecutado para el trabajo {job_id}", flush=True)

            # Eliminar el archivo temporal
            os.remove(temp_filename)

            # Guardar el resultado
            output = {
                'output': result.stdout,
                'error': result.stderr if result.returncode != 0 else None,
                'returncode': result.returncode
            }
            with queue_lock:
                completed_jobs[job_id] = output
                in_progress_jobs.pop(job_id, None)
                print(f"completed_jobs ahora contiene: {list(completed_jobs.keys())}", flush=True)
            print(f"Trabajo {job_id} completado y almacenado", flush=True)
        except Exception as e:
            with queue_lock:
                completed_jobs[job_id] = {'error': 'Error interno del servidor', 'details': str(e)}
                in_progress_jobs.pop(job_id, None)
                print(f"completed_jobs ahora contiene: {list(completed_jobs.keys())}", flush=True)
            print(f"Error al procesar el trabajo {job_id}: {str(e)}", flush=True)

        job_queue.task_done()  # Marcar el trabajo como terminado

# Diccionario para almacenar los resultados de los trabajos completados
completed_jobs = {}

# Iniciar un hilo para procesar la cola
worker_thread = Thread(target=process_jobs, daemon=True)
worker_thread.start()

@app.route('/simulate', methods=['POST'])
def simulate():
    try:
        # Obtener el código desde la solicitud
        data = request.get_json()
        code = data.get('code', '')

        if not code:
            return jsonify({'error': 'No se proporcionó ningún código.'}), 400

        # Generar un identificador único para el trabajo usando UUID
        job_id = str(uuid.uuid4())  # ID único basado en UUID

        # Agregar el trabajo a la cola
        with queue_lock:
            job_queue.put((job_id, code))
            print(f'Trabajo {job_id} agregado a la cola', flush=True)
            print(f'Estado actual de la cola: {list(job_queue.queue)}', flush=True)

        print(f'Trabajo {job_id} recibido', flush=True)
        print(f'Estado actual de la cola: {list(job_queue.queue)}', flush=True)
        return jsonify({'message': 'Trabajo recibido', 'job_id': job_id}), 202

    except Exception as e:
        print(f'Error en el servidor: {str(e)}', flush=True)
        return jsonify({'error': 'Error en el servidor', 'details': str(e)}), 500

@app.route('/status/<job_id>', methods=['GET'])  # Cambiar <int:job_id> a <job_id>
def get_status(job_id):
    print(f'Buscando trabajo {job_id}', flush=True)
    # Verificar si el trabajo ha sido procesado
    with queue_lock:
        if job_id in completed_jobs:
            return jsonify(completed_jobs.pop(job_id))  # Retornar y eliminar el resultado

        # Si está en progreso
        if job_id in in_progress_jobs:
            return jsonify({'status': 'En progreso'}), 200

        # Si no está en completed_jobs ni en progreso, chequear la cola
        print(f'Estado actual de la cola: {list(job_queue.queue)}', flush=True)
        for queued_job_id, _ in list(job_queue.queue):
            if queued_job_id == job_id:
                return jsonify({'status': 'En espera'}), 200

    print(f'Trabajo {job_id} no encontrado', flush=True)
    return jsonify({'status': 'No encontrado'}), 404

if __name__ == '__main__':
    print('Iniciando servidor...', flush=True)
    app.run(host='0.0.0.0', port=5000, threaded=True)  # Asegurar que Flask está en modo threaded
