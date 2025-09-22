from flask import Flask  # type: ignore
from flask_cors import CORS  # type: ignore
from dotenv import load_dotenv  # type: ignore
from routes import Routes

app = Flask(__name__)  # Cria uma instância do Flask
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})


@app.route("/")  # Define uma rota para o caminho raiz
def home():
    return {"message": "API funcionando!"}  # Retorna uma mensagem


Routes(app)

load_dotenv()

if __name__ == "__main__":
    app.run(debug=True)  # Executa a API
