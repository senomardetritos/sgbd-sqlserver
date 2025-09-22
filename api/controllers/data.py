from lib.JsonCustomEncoder import JsonCustomEncoder
from lib.SQLServerConnection import SQLServerConnection
from flask import request  # type: ignore

"""
    Controlador para gerenciar rotas relacionadas aos dados do banco de dados.
    
    Esta classe é responsável por registrar e manipular as rotas da aplicação Flask
    que fornecem informações sobre os dados do banco de dados.
    """


class DataController:

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
        Registra todas as rotas relacionadas aos dados na aplicação Flask.

        Esta função define os endpoints da API que permitem:
        1. Visualizar os primeiros registros de uma tabela específica
        2. Busca o registro por Id de uma tabela específica
        3. Criar um registro em uma tabela específica
        4. Atualizar um registro em uma tabela específica
        5. Excluir um registro em uma tabela específica
        6. Excluir todos os registros em uma tabela específica
        """

        @self.app.route("/<data_base>/data/<table_name>")
        def list_data(data_base, table_name):
            """
            Endpoint para visualizar os primeiros 25 registros de uma tabela específica.

            Args:
                table_name (str): Nome da tabela a ser consultada

            Returns:
                JSON com os registros da tabela ou mensagem de erro em caso de falha
            """
            try:
                params = {}
                where = []
                if request.args:
                    params = request.args.to_dict()
                if params:
                    for key in params:
                        where.append(f"{key} = '{params[key]}'")

                query = f"""
                    USE {data_base};
                    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = '{table_name}'
                    ORDER BY ORDINAL_POSITION
                    """

                success, columns = self.db.get_data(query)
                cols = []
                for column in columns.to_dict(orient="records"):
                    cols.append(
                        {"name": column["COLUMN_NAME"], "type": column["DATA_TYPE"]}
                    )

                query = f"USE {data_base}; SELECT COUNT(*) as Total FROM {table_name}"
                if len(where) > 0:
                    query += " WHERE " + " AND ".join(where)

                success, totals = self.db.get_data(query)
                total = totals.to_dict(orient="records")[0]["Total"]

                fields = self.getFields(data_base, table_name)
                query = f"USE {data_base}; SELECT {', '.join(fields)} FROM {table_name}"
                if len(where) > 0:
                    query += " WHERE " + " AND ".join(where)

                success, records = self.db.get_data(query)

                if not success:
                    error = f"❌ Erro ao buscar dados na tabela {table_name}."
                    print(error)
                    return {"error": query}

                if records.size == 0:
                    print(f"❌ Nenhum dado encontrado na tabela {table_name}.")
                    data = []
                else:
                    data = records.to_dict(orient="records")

                data = JsonCustomEncoder.toStr(data)

                return {
                    "data": data,
                    "columns": cols,
                    "total": total,
                }

            except Exception as e:
                return {"error": f"Erro: {e}"}

        @self.app.route("/<data_base>/data/<table_name>/<id>")
        def get_data(data_base, table_name, id):
            """
            Endpoint para buscar um registro por Id de uma tabela específica.

            Args:
                table_name (str): Nome da tabela a ser consultada
                id (int): Id do registro a ser consultado

            Returns:
                JSON com o registro da tabela ou mensagem de erro em caso de falha
            """
            try:
                fields = self.getFields(data_base, table_name)
                query = f"USE {data_base}; SELECT {', '.join(fields)} FROM {table_name} WHERE Id = '{id}'"

                success, records = self.db.get_data(query)

                if not success:
                    error = f"❌ Erro ao buscar dados na tabela {table_name}."
                    print(error)
                    return {"error": error}

                if records.size == 0:
                    error = f"❌ Dado não encontrado na tabela {table_name}."
                    print(error)
                    return {"error": error}
                else:
                    data = records.to_dict(orient="records")
                    data = JsonCustomEncoder.toStr(data)

                return {"data": data}

            except Exception as e:
                return {"error": f"Erro: {e}"}

        @self.app.route("/<data_base>/data/<table_name>", methods=["POST"])
        def create_data(data_base, table_name):
            """
            Endpoint para criar um registro em uma tabela específica.

            Args:
                table_name (str): Nome da tabela

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            fields = []
            for key in request.json:
                fields.append(key)
            query = f"USE {data_base}; INSERT INTO {table_name} ({','.join(fields)}) values (:{',:'.join(fields)})"

            success, error = self.db.execute_query(query, request.json)
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

        @self.app.route("/<data_base>/data/<table_name>/<id>", methods=["POST"])
        def update_data(data_base, table_name, id):
            """
            Endpoint para atualizar um registro em uma tabela específica.

            Args:
                table_name (str): Nome da tabela
                id (int): Id do registro

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            columns = self.getColumns(data_base, table_name)
            fields = []
            for column in columns.to_dict(orient="records"):
                if column["COLUMN_NAME"] != "Id":
                    fields.append(f"{column['COLUMN_NAME']} = :{column['COLUMN_NAME']}")
            query = f"USE {data_base}; UPDATE {table_name} SET {','.join(fields)} where Id = :Id"

            success, error = self.db.execute_query(query, request.json)
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

        @self.app.route("/<data_base>/data/delete/<table_name>/<id>", methods=["POST"])
        def delete_data(data_base, table_name, id):
            """
            Endpoint para deletar um registro em uma tabela específica.

            Args:
                table_name (str): Nome da tabela
                id (int): Id do registro

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            fields = []

            query = f"USE {data_base}; DELETE FROM {table_name} where Id = :Id"

            success, error = self.db.execute_query(query, {"Id": id})
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

        @self.app.route("/<data_base>/data/delete/<table_name>", methods=["POST"])
        def clear_data(data_base, table_name):
            """
            Endpoint para deletar todos os registros em uma tabela específica.

            Args:
                table_name (str): Nome da tabela

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            fields = []

            query = f"USE {data_base}; DELETE FROM {table_name}"

            success, error = self.db.execute_query(query)
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

    def getColumns(self, data_base, table_name):
        query = f"""
            USE {data_base}; 
            SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = '{table_name}'
            ORDER BY ORDINAL_POSITION
            """

        success, columns = self.db.get_data(query)
        return columns

    def getFields(self, data_base, table_name):
        columns = self.getColumns(data_base, table_name)
        fields = []
        for column in columns.to_dict(orient="records"):
            if column["DATA_TYPE"] == "geometry":
                fields.append(
                    f"{column['COLUMN_NAME']}.ToString() as {column['COLUMN_NAME']}"
                )
            elif column["DATA_TYPE"] == "geography":
                fields.append(
                    f"{column['COLUMN_NAME']}.ToString() as {column['COLUMN_NAME']}"
                )
            else:
                fields.append(column["COLUMN_NAME"])
        return fields
