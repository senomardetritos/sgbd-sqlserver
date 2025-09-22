from controllers.tables import TablesController
from controllers.data import DataController
from controllers.columns import ColumnsController
from controllers.databases import DataBasesController

class Routes:

    def __init__(self, app):
        tables = TablesController(app)
        tables.register_routes()
        data = DataController(app)
        data.register_routes()
        columns = ColumnsController(app)
        columns.register_routes()
        database = DataBasesController(app)
        database.register_routes()
