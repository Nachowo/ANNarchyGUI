from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

# Ruta para recibir el código y ejecutar la simulación
@app.route('/simulate', methods=['POST'])
def simulate():
    try:
        # Obtener el código desde la solicitud
        data = request.get_json()
        code = data.get('code', '')

        if not code:
            return jsonify({'error': 'No se proporcionó ningún código.'}), 400

        # Guardar el código en un archivo temporal
        temp_filename = 'simulation_code.py'
        print(f"Guardando código en {temp_filename}", flush=True)
        with open(temp_filename, 'w') as temp_file:
            temp_file.write(code)
        print("Código guardado", flush=True)
        
        # Ejecutar el código con ANNarchy en la máquina local
        print("Ejecutando código", flush=True)
        result = subprocess.run(
            ['python', temp_filename],
            capture_output=True,
            text=True
        )
        # Depuración: imprime el resultado completo
        print(f"STDOUT: {result.stdout}", flush=True)
        print(f"STDERR: {result.stderr}", flush=True)
        print(f"Return Code: {result.returncode}", flush=True)
        print("Código ejecutado", flush=True)

        # Eliminar el archivo temporal
        os.remove(temp_filename)

        # Manejar errores en la ejecución
        if result.returncode != 0:
            return jsonify({'error': 'Error en la simulación', 'details': result.stderr}), 500

        # Retornar el resultado de la simulación
        return jsonify({'output': result.stdout})

    except Exception as e:
        return jsonify({'error': 'Error en el servidor', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
