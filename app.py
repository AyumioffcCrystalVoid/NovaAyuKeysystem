from flask import Flask, jsonify, request, session, send_from_directory, render_template
from flask_cors import CORS
import random
import string
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('FLASK_SECRET', 'dev-secret-change-me')
CORS(app)

# Helper: gera chave no formato AAAA-AAAA-AAAA-AAAA (letras maiúsculas)
def gerar_chave():
	parts = []
	for _ in range(4):
		part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
		parts.append(part)
	return '-'.join(parts)

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/api/checkpoint', methods=['POST'])
def checkpoint():
	# inicializa session
	cp = session.get('checkpoint', 0)
	# Avança para próximo checkpoint até 3
	if cp < 3:
		cp += 1
		session['checkpoint'] = cp
	return jsonify({
		'checkpoint': cp,
		'message': f'Checkpoint {cp} recebido.'
	})

@app.route('/api/status', methods=['GET'])
def status():
	cp = session.get('checkpoint', 0)
	return jsonify({'checkpoint': cp})

@app.route('/api/claim', methods=['POST'])
def claim():
	cp = session.get('checkpoint', 0)
	if cp >= 3:
		# gera key e reseta sessão (opcional)
		key = gerar_chave()
		session['checkpoint'] = 0
		# poderia salvar chave em banco ou arquivo para auditoria
		return jsonify({'ok': True, 'key': key})
	else:
		return jsonify({'ok': False, 'error': 'Pré-requisitos não concluídos (3 checkpoints necessários).', 'checkpoint': cp}), 400

if __name__ == '__main__':
	app.run(host='0.0.0.0', port=5000, debug=True)
