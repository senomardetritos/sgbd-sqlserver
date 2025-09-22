from lib.SQLServerConnection import SQLServerConnection
from flask import request  # type: ignore
import pyodbc  # type: ignore
from dotenv import load_dotenv  # type: ignore
import os

"""
    Controlador para gerenciar rotas relacionadas aos banco de dados.
    
    Esta classe é responsável por registrar e manipular as rotas da aplicação Flask
    que fornecem informações sobre os bancos de dados.
    """


class DataBasesController:

    def __init__(self, app):
        """
        Inicializa o controlador com a aplicação Flask e estabelece conexão com o banco.

        Args:
            app: Instância da aplicação Flask
        """
        self.app = app
        self.db = SQLServerConnection()

    def register_routes(self):
        """
        Registra todas as rotas relacionadas aos banco de dados na aplicação Flask.

        Esta função define os endpoints da API que permitem:
        1. Listar todos os bancos de dados
        2. Criar um banco de dados
        3. Excluir um banco de dados
        """

        @self.app.route("/databases")
        def databases():
            """
            Endpoint para listar todos os bancos de dados.

            Returns:
                JSON com lista de bancos de dados ou mensagem de erro em caso de falha
            """

            query = "SELECT database_id, name FROM sys.databases WHERE name not in ('master', 'tempdb', 'model', 'msdb')"
            success, tables = self.db.get_data(query)

            if not success:
                error = "❌ Erro ao buscar bancos de dados."
                print(error)
                return {"error": error}

            if tables.size == 0:
                print("❌ Nenhum banco de dados encontrado.")
                return {"data": []}

            data = tables.to_dict(orient="records")
            return {"data": data}

        @self.app.route("/<data_base>/database/create", methods=["POST"])
        def database_create(data_base):
            """
            Endpoint para criar um banco de dados.

            Args:
                table_name (str): Nome do banco de dados a ser criado

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            # Connect in autocommit mode
            driver = "{ODBC Driver 17 for SQL Server}"
            server = os.getenv("DB_SERVER")
            port = os.getenv("DB_PORT")
            username = os.getenv("DB_USERNAME")
            password = os.getenv("DB_PASSWORD")
            cnxn = pyodbc.connect(
                f"DRIVER={driver};SERVER={server};PORT={port};UID={username};PWD={password}",
                autocommit=True,
            )
            cursor = cnxn.cursor()

            # Execute CREATE DATABASE
            cursor.execute(f"CREATE DATABASE {data_base}")

            # Close resources
            cursor.close()
            cnxn.close()

            return {"data": {}}

        @self.app.route("/<data_base>/database/delete", methods=["POST"])
        def database_delete(data_base):
            """
            Endpoint para excluir um banco de dados.

            Args:
                table_name (str): Nome do banco de dados a ser excluido

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """
            
             # Connect in autocommit mode
            driver = "{ODBC Driver 17 for SQL Server}"
            server = os.getenv("DB_SERVER")
            port = os.getenv("DB_PORT")
            username = os.getenv("DB_USERNAME")
            password = os.getenv("DB_PASSWORD")
            cnxn = pyodbc.connect(
                f"DRIVER={driver};SERVER={server};PORT={port};UID={username};PWD={password}",
                autocommit=True,
            )
            cursor = cnxn.cursor()

            # Execute CREATE DATABASE
            cursor.execute(
                f"""
                ALTER DATABASE {data_base} SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
                DROP DATABASE {data_base};
                """
            )

            # Close resources
            cursor.close()
            cnxn.close()

            return {"data": {}}
