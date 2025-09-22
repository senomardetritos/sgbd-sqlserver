export const SqlServerTypes = [
    { name: 'INT', size: false },
    { name: 'DECIMAL', size: true },
    { name: 'NUMERIC', size: true },
    { name: 'DATE', size: false },
    { name: 'TIME', size: false },
    { name: 'DATETIME', size: false },
    { name: 'CHAR', size: true },
    { name: 'VARCHAR', size: true },
    { name: 'TEXT', size: false },
    { name: 'JSON', size: false },
    { name: 'GEOGRAPHY', size: false },
    { name: 'GEOMETRY', size: false },
]

export const InputSqlServerTypes: Record<string, string> = {
    INT: 'number',
    DECIMAL: 'number',
    NUMERIC: 'number',
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime-local',
    CHAR: 'text',
    VARCHAR: 'text',
    TEXT: 'textarea',
    JSON: 'textarea',
    GEOGRAPHY: 'textarea',
    GEOMETRY: 'textarea'
}