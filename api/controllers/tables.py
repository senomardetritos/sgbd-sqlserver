from lib.SQLServerConnection import SQLServerConnection
from flask import request  # type: ignore

"""
    Controlador para gerenciar rotas relacionadas a tabelas do banco de dados.
    
    Esta classe é responsável por registrar e manipular as rotas da aplicação Flask
    que fornecem informações sobre as tabelas do banco de dados e seus dados.
    """


class TablesController:

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
        Registra todas as rotas relacionadas a tabelas na aplicação Flask.

        Esta função define os endpoints da API que permitem:
        1. Listar todas as tabelas
        2. Criar uma tabela
        3. Excluir uma tabela
        4. Busca a estrutura de uma tabela específica
        """

        @self.app.route("/<data_base>/tables")
        def tables(data_base):
            """
            Endpoint para listar todas as tabelas do banco de dados.

            Returns:
                JSON com lista de tabelas ou mensagem de erro em caso de falha
            """

            query = f"USE {data_base}; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"
            success, tables = self.db.get_data(query)

            if not success:
                error = "❌ Erro ao buscar tabelas."
                print(error)
                return {"error": error}

            if tables.size == 0:
                print("❌ Nenhuma tabela encontrada no banco.")
                return {"data": []}

            data = tables.to_dict(orient="records")
            return {"data": data}

        @self.app.route("/<data_base>/tables/create/<table_name>", methods=["POST"])
        def tables_create(data_base, table_name):
            """
            Endpoint para criar uma tabela.

            Args:
                table_name (str): Nome da tabela a ser criada

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """
            fields = []
            primary = []
            for item in request.json:
                field = f"{item.get('name')} {item.get('type')}"
                if item.get("size"):
                    field += f"({item.get('size')})"
                if item.get("is_unique"):
                    field += " UNIQUE"
                if item.get("is_null"):
                    field += " NULL"
                else:
                    field += " NOT NULL"
                if item.get("increment"):
                    field += " PRIMARY KEY IDENTITY(1,1)"
                if item.get("default_value"):
                    field += f" DEFAULT '{item.get('default_value')}'"
                if item.get("is_primary"):
                    primary.append(item.get("name"))

                fields.append(field)
            
            if len(primary) > 0:
                fields.append(f"PRIMARY KEY ({', '.join(primary)})")

            aux = ", ".join(fields)
            query = f"USE {data_base}; CREATE TABLE {table_name} ({aux})"

            success, error = self.db.execute_query(query)
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

        @self.app.route("/<data_base>/tables/delete/<table_name>", methods=["POST"])
        def tables_delete(data_base, table_name):
            """
            Endpoint para excluir uma tabela.

            Args:
                table_name (str): Nome da tabela a ser excluida

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            query = f"USE {data_base}; DROP TABLE {table_name}"
            success, error = self.db.execute_query(query)
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

        @self.app.route("/<data_base>/tables/struct/<table_name>")
        def struct_table(data_base, table_name):
            """
            Endpoint para visualizar a estrutura de uma tabela específica.

            Args:
                table_name (str): Nome da tabela a ser consultada

            Returns:
                JSON com a estrutura da tabela ou mensagem de erro em caso de falha
            """

            query = f"""
                USE {data_base}; 
                SELECT c.COLUMN_NAME as name, c.DATA_TYPE as type, c.COLUMN_DEFAULT as default_value,
                CASE WHEN c.CHARACTER_MAXIMUM_LENGTH IS NULL THEN '' ELSE c.CHARACTER_MAXIMUM_LENGTH END as size,
                CASE WHEN c.NUMERIC_PRECISION IS NULL THEN '' ELSE c.NUMERIC_PRECISION END as precision,
                c.IS_NULLABLE as is_null,
                CASE WHEN (SELECT count(*) FROM 
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu1,
                    INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc1
                    WHERE kcu1.CONSTRAINT_NAME = tc1.CONSTRAINT_NAME
                    AND tc1.CONSTRAINT_TYPE = 'Unique'
                    AND kcu1.COLUMN_NAME = c.COLUMN_NAME) > 0  THEN 'YES' ELSE 'NO' END as is_unique,
                CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES' ELSE 'NO' END as is_primary,
                ic.is_identity 
                FROM
                    INFORMATION_SCHEMA.COLUMNS AS c
                LEFT JOIN
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu ON c.TABLE_SCHEMA = kcu.TABLE_SCHEMA
                    AND c.TABLE_NAME = kcu.TABLE_NAME
                    AND c.COLUMN_NAME = kcu.COLUMN_NAME
                LEFT JOIN
                    INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc ON kcu.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
                    AND kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                    AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                LEFT JOIN
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS pk ON tc.CONSTRAINT_SCHEMA = pk.CONSTRAINT_SCHEMA
                    AND tc.CONSTRAINT_NAME = pk.CONSTRAINT_NAME
                    AND c.COLUMN_NAME = pk.COLUMN_NAME
                LEFT JOIN
	                sys.columns AS c2 ON c2.name = kcu.COLUMN_NAME and OBJECT_NAME(c2.object_id) = kcu.TABLE_NAME
                LEFT JOIN
    				sys.identity_columns AS ic ON c2.column_id = ic.column_id AND c2.object_id = ic.object_id
                WHERE c.TABLE_NAME = '{table_name}'
                ORDER BY c.ORDINAL_POSITION
                """

            success, columns = self.db.get_data(query)
            if not success:
                error = f"❌ Erro ao buscar dados na tabela {table_name}."
                print(error)
                return {"error": error}

            data = columns.to_dict(orient="records")
            return {"data": data}
