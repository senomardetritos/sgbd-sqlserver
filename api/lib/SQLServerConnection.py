from sqlalchemy import create_engine, text  # type: ignore
import pandas as pd  # type: ignore
from urllib.parse import quote_plus
import os


class SQLServerConnection:
    def __init__(self):
        server = os.getenv("DB_SERVER")
        port = os.getenv("DB_PORT")
        username = os.getenv("DB_USERNAME")
        password = os.getenv("DB_PASSWORD")
        self.connect(server, port, username, password)

    def connect(
        self,
        server,
        port,
        username,
        password,
    ):
        try:
            # Codificar a senha para URL (caso tenha caracteres especiais)
            encoded_password = quote_plus(password)

            # String de conexão com pymssql
            connection_string = (
                f"mssql+pymssql://{username}:{encoded_password}@{server}:{port}"
            )

            self.engine = create_engine(connection_string)

            # Testar a conexão
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            print("✅ Conexão bem-sucedida com SQLAlchemy + pymssql!")

        except Exception as e:
            print(f"❌ Erro na conexão: {e}")
            raise

    def get_dataframe(self, query, params=None):
        try:
            if params:
                return pd.read_sql(text(query), self.engine, params=params)
            else:
                return pd.read_sql(text(query), self.engine)
        except Exception as e:
            print(f"❌ Erro: {e}")
            return pd.DataFrame()

    def get_data(self, query, params=None):
        try:
            if params:
                return True, pd.read_sql(text(query), self.engine, params=params)
            else:
                return True, pd.read_sql(text(query), self.engine)
        except Exception as e:
            return False, f"❌ Erro na consulta: {e}"

    def execute_query(self, query, params=None):
        """Executa query sem retorno (INSERT, UPDATE, DELETE)"""
        try:
            with self.engine.begin() as conn:
                if params:
                    conn.execute(text(query), params)
                else:
                    conn.execute(text(query))
            return True, "✅ Query executada com sucesso!"
        except Exception as e:
            return False, f"❌ Erro na execução: {e} Query: {query}"

    def test_connection(self):
        """Testa a conexão com o banco"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT @@VERSION as version"))
                version = result.scalar()
                return True, f"✅ Conexão OK! SQL Server Version: {version}"
        except Exception as e:
            return False, f"❌ Falha no teste de conexão: {e}"
