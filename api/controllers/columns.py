from lib.JsonCustomEncoder import JsonCustomEncoder
from lib.SQLServerConnection import SQLServerConnection
from flask import request  # type: ignore

"""
Controlador para gerenciar rotas relacionadas as colunas do banco de dados.

Esta classe é responsável por registrar e manipular as rotas da aplicação Flask
que fornecem informações sobre as colunas do banco de dados.
"""


class ColumnsController:

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
        Registra todas as rotas relacionadas a colunas na aplicação Flask.

        Esta função define os endpoints da API que permitem:
        1. Adiciona um novo campo em uma tabela específica
        2. Altera um campo em uma tabela específica
        """

        @self.app.route("/<data_base>/columns/<table_name>", methods=["POST"])
        def columns_create(data_base, table_name):
            """
            Endpoint para criar um campo em uma tabela.

            Args:
                table_name (str): Nome da tabela a ser criado o campo

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            query = f"USE {data_base}; ALTER TABLE {table_name}"
            data = request.json.get("data")
            field = f"{data.get('name')} {data.get('type')}"
            if data.get("size"):
                field += f"({data.get('size')})"
            if data.get("is_null"):
                field += " NULL"
            else:
                field += " NOT NULL"
            if data.get("default"):
                field += f" DEFAULT {data.get('default')}"

            query += f" ADD {field}"

            success, error = self.db.execute_query(query)
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

        @self.app.route(
            "/<data_base>/columns/delete/<table_name>/<column_name>", methods=["POST"]
        )
        def columns_delete(data_base, table_name, column_name):
            """
            Endpoint para deletar um campo em uma tabela.

            Args:
                table_name (str): Nome da tabela a ser criado o campo

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            query = f"USE {data_base}; ALTER TABLE {table_name}"
            query += f" DROP COLUMN {column_name}"

            success, error = self.db.execute_query(query)
            if not success:
                print(error)
                return {"error": error}

            return {"data": {}}

        @self.app.route(
            "/<data_base>/columns/<table_name>/<column_name>", methods=["POST"]
        )
        def columns_alter(data_base, table_name, column_name):
            """
            Endpoint para criar um campo em uma tabela.

            Args:
                table_name (str): Nome da tabela a ser alterado o campo
                column_name (str): Nome do campo a ser alterado

            Returns:
                JSON com data = {} ou mensagem de erro em caso de falha
            """

            data = request.json.get("data")
            field = request.json.get("field")
            if data.get("name") == field.get("name"):
                return self.alterColumnSameName(
                    data_base, table_name, column_name, field, data
                )
            else:
                result = self.alterColumnNewName(data_base, table_name, field, data)
                print(result)
                if result == True:
                    return self.alterColumnSameName(
                        data_base, table_name, data.get("name"), field, data
                    )
                else:
                    return {"error": "Erro ao alterar coluna com novo nome"}

    def alterColumnSameName(self, data_base, table_name, column_name, field, data):
        query = f"USE {data_base}; ALTER TABLE {table_name}"
        field_query = f"{data.get('name')} {data.get('type')}"
        if data.get("size"):
            field_query += f"({data.get('size')})"
        if data.get("is_null"):
            field_query += " NULL"
        else:
            field_query += " NOT NULL"

        query += f" ALTER COLUMN {field_query}"

        success, error = self.db.execute_query(query)
        if not success:
            print(error)
            return {"error": error}

        if data.get("default_value") != field.get("default_value"):
            default_constraint = self.getDefaultConstraint(
                data_base, table_name, column_name
            )
            if default_constraint != None:
                query = f"USE {data_base}; ALTER TABLE {table_name} DROP CONSTRAINT {default_constraint};"
                success, error = self.db.execute_query(query)
                if not success:
                    print(error)
                    return {"error": error}
            if data.get("default_value") != "":
                if default_constraint == None:
                    default_constraint = f"DF__{table_name}__{column_name}"
                query = f"""
                    USE {data_base}; 
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT {default_constraint} 
                    DEFAULT '{data.get("default_value")}' FOR {column_name};
                """
                success, error = self.db.execute_query(query)
                if not success:
                    print(error)
                    return {"error": error}

        if data.get("is_unique") != field.get("is_unique"):
            default_constraint = self.getUniqueConstraint(
                data_base, table_name, column_name
            )
            if default_constraint != None:
                query = (
                    f"ALTER TABLE {table_name} DROP CONSTRAINT {default_constraint};"
                )
                success, error = self.db.execute_query(query)
                if not success:
                    print(error)
                    return {"error": error}
            if data.get("is_unique"):
                if default_constraint == None:
                    default_constraint = f"UQ__{table_name}__{column_name}"
                query = f"""
                    USE {data_base}; 
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT {default_constraint} 
                    UNIQUE ({column_name});
                """
                success, error = self.db.execute_query(query)
                if not success:
                    print(error)
                    return {"error": error}

        if data.get("is_primary") != field.get("is_primary"):
            default_constraint = self.getPrimaryConstraint(
                data_base, table_name, column_name
            )
            if default_constraint != None:
                query = (
                    f"ALTER TABLE {table_name} DROP CONSTRAINT {default_constraint};"
                )
                success, error = self.db.execute_query(query)
                if not success:
                    print(error)
                    return {"error": error}
            if data.get("is_primary"):
                if default_constraint == None:
                    default_constraint = f"PK__{table_name}__{column_name}"
                query = f"""
                    USE {data_base}; 
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT {default_constraint} 
                    PRIMARY KEY ({column_name})
                """
            
                success, error = self.db.execute_query(query)
                if not success:
                    print(error)
                    return {"error": error}

        return {"data": {}}

    def alterColumnNewName(self, data_base, table_name, field, data):
        query = f"USE {data_base};  EXEC sp_rename '{table_name}.{field.get('name')}', '{data.get('name')}', 'COLUMN';"
        success, error = self.db.execute_query(query)
        if not success:
            print(error)
            return False

        return True

    def getDefaultConstraint(self, data_base, table_name, column_name):
        query = f"""
            USE {data_base}; 
            SELECT
                dc.name AS ConstraintName
            FROM
                sys.default_constraints AS dc
            INNER JOIN
                sys.tables AS t ON dc.parent_object_id = t.object_id
            INNER JOIN
                sys.columns AS c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
            WHERE OBJECT_NAME(t.object_id) = '{table_name}' AND c.name = '{column_name}'
            """
        success, data = self.db.get_data(query)
        if not success:
            print(f"❌ Erro ao buscar ConstraintName na tabela {table_name}.")
            return None

        data = data.to_dict(orient="records")
        data = JsonCustomEncoder.toStr(data)
        default_constraint = None
        if data and data[0] and data[0]["ConstraintName"]:
            default_constraint = data[0]["ConstraintName"]
        return default_constraint

    def getUniqueConstraint(self, data_base, table_name, column_name):
        query = f"""
            USE {data_base}; 
            SELECT tc1.CONSTRAINT_NAME as ConstraintName  FROM 
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu1,
            INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc1
            WHERE kcu1.CONSTRAINT_NAME = tc1.CONSTRAINT_NAME
            AND tc1.CONSTRAINT_TYPE = 'Unique'
            AND tc1.TABLE_NAME = '{table_name}'
            AND kcu1.COLUMN_NAME = '{column_name}'
        """
        success, data = self.db.get_data(query)
        if not success:
            print(f"❌ Erro ao buscar ConstraintName na tabela {table_name}.")
            return None

        data = data.to_dict(orient="records")
        data = JsonCustomEncoder.toStr(data)
        default_constraint = None
        if data and data[0] and data[0]["ConstraintName"]:
            default_constraint = data[0]["ConstraintName"]
        return default_constraint

    def getPrimaryConstraint(self, data_base, table_name, column_name):
        query = f"""
            USE {data_base}; 
            SELECT tc1.CONSTRAINT_NAME as ConstraintName  FROM 
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu1,
            INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc1
            WHERE kcu1.CONSTRAINT_NAME = tc1.CONSTRAINT_NAME
            AND tc1.CONSTRAINT_TYPE = 'PRIMARY KEY'
            AND tc1.TABLE_NAME = '{table_name}'
            AND kcu1.COLUMN_NAME = '{column_name}'
        """
        success, data = self.db.get_data(query)
        if not success:
            print(f"❌ Erro ao buscar ConstraintName na tabela {table_name}.")
            return None

        data = data.to_dict(orient="records")
        data = JsonCustomEncoder.toStr(data)
        default_constraint = None
        if data and data[0] and data[0]["ConstraintName"]:
            default_constraint = data[0]["ConstraintName"]
        return default_constraint
