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
        print(f"Guardando código en {temp_filename}")
        with open(temp_filename, 'w') as temp_file:
            temp_file.write(code)
        print("Código guardado")
        # Ejecutar el código con ANNarchy en Docker
        print("Ejecutando código")
        result = subprocess.run(
            ['docker', 'run', '--rm', '-v', f"{os.getcwd()}:/app", '-w', '/app', 'ann', 'python', temp_filename],
            capture_output=True,
            text=True
        )
        # Depuración: imprime el resultado completo
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")
        print(f"Return Code: {result.returncode}")
        print("Código ejecutado")

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
