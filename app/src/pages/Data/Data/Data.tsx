/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './Data.css'
import Modal from "../../../components/Modal/Modal";
import { globalEventEmitter } from "../../../utils/EventEmitter";
import { dateFormat, dateTimeFormat } from "../../../utils/DateFormat";

interface ColumnInterface {
    name: string;
    type: string;
}

function Data() {
    const { tableName } = useParams();
    const navigate = useNavigate()

    const [columns, setColumns] = useState<ColumnInterface[]>([])
    const [data, setData] = useState([])
    const [showData, setShowData] = useState([])
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState<string[]>([])
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState('')
    const [total, setTotal] = useState(0)
    const [totalSearch, setTotalSearch] = useState(0)
    const [deleteId, setDeleteId] = useState(0)
    const [modalDeleteTable, setModalDeleteTable] = useState(false)
    const [modalClearTable, setModalClearTable] = useState(false)
    const [modalDeleteData, setModalDeleteData] = useState(false)
    const [modalError, setModalError] = useState('')

    const apiUrl = import.meta.env.VITE_API_URL;
    const data_base = localStorage.getItem('data_base')

    async function fetchData() {
        const response = await fetch(`${apiUrl}/${data_base}/data/${tableName}`)
        const json = await response.json()
        setColumns(json.columns)
        setData(json.data)
        setTotal(json.total)
        setSearch('')
        setPage(1)
        renderData()
    }

    function newData() {
        navigate(`/data/form/${tableName}`)
    }

    function goStruct() {
        navigate(`/tables/struct/${tableName}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function editData(item: any) {
        navigate(`/data/form/${tableName}/${item.Id}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function tryDeleteData(item: any) {
        setDeleteId(item.Id)
        setModalDeleteData(true)
    }

    async function deleteData() {
        const response = await fetch(`${apiUrl}/${data_base}/data/delete/${tableName}/${deleteId}`, {
            method: 'POST',
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            fetchData()
        }
        setModalDeleteData(false)
    }

    async function deleteTable() {
        const response = await fetch(`${apiUrl}/${data_base}/tables/delete/${tableName}`, {
            method: 'POST',
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            globalEventEmitter.dispatchEvent(new CustomEvent('reloadTables'))
            navigate(`/`)
        }
        setModalDeleteTable(false)
    }

    async function clearTable() {
        const response = await fetch(`${apiUrl}/${data_base}/data/delete/${tableName}`, {
            method: 'POST',
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            fetchData()
        }
        setModalClearTable(false)
    }

    function changeLimit(value: number) {
        setPage(1)
        setLimit(value)
    }

    function renderData() {
        const search_data = data.filter((d) => {
            if (search.trim() === '') return true
            let finded = false
            Object.keys(d).map((i) => {
                const value: string = d[i]
                if (value.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1) {
                    finded = true
                }
            })
            if (finded) return true
            else return false
        })
        const dt = search_data.filter((_d, i) => {
            if (i >= ((page - 1) * limit) && i < (((page - 1) * limit) + limit)) return true
            return false
        })
        setShowData(dt)
        const pgs: string[] = []
        for (let i = 0; i < search_data.length / limit; i++) {
            if (search_data.length / limit > 12) {
                if (i < 5) pgs.push((i + 1).toString())
                if (i == 5) pgs.push('...')
                if (i > (search_data.length / limit) - 5) pgs.push((i + 1).toString())
            } else {
                pgs.push((i + 1).toString())
            }
        }
        setTotalSearch(search_data.length)
        setPages(pgs)
    }

    useEffect(() => {
        fetchData()
    }, [tableName])

    useEffect(() => {
        renderData()
    }, [data, page, limit, total])

    useEffect(() => {
        setPage(1)
        renderData()
    }, [search])

    return (
        <>
            <div className="header">
                <h3>Dados de {tableName}</h3>
                <div className="header-options">
                    <a onClick={newData}>Adicionar</a>
                    <a onClick={goStruct}>Estrutura</a>
                    <a onClick={() => setModalClearTable(true)}>Limpar</a>
                    <a onClick={() => setModalDeleteTable(true)}>Excluir</a>
                </div>
            </div>
            <div className="divider"></div>
            <div className="header">
                <div className="header-options">
                    <h4>Pesquisar:</h4>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar" />
                </div>
                <div className="header-options">
                    <h4>Mostrar:</h4>
                    <select onChange={(e) => changeLimit(parseInt(e.target.value))}>
                        <option value="10">10 Registros</option>
                        <option value="25">25 Registros</option>
                        <option value="50">50 Registros</option>
                        <option value="100">100 Registros</option>
                    </select>
                </div>
            </div>
            <div className="divider"></div>
            <div className="table-data-container">
                <table cellPadding={0} cellSpacing={0} className='table-data'>
                    <thead>
                        <tr>
                            {columns && columns.length > 0 && columns.map((item) => (
                                <th key={item.name}>
                                    {item.name}
                                </th>
                            ))}
                            <th className="center sticky-col">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {showData && showData.length > 0 && showData.map((item) => (
                            <tr key={item['Id']}>
                                {columns && columns.length > 0 && columns.map((column) => {
                                    if (column.type == 'date') {
                                        return (
                                            <td key={column.name} onClick={() => editData(item)} className="link">
                                                {dateFormat(item[column.name])}
                                            </td>
                                        )
                                    } else if (column.type == 'datetime') {
                                        return (
                                            <td key={column.name} onClick={() => editData(item)} className="link">
                                                {dateTimeFormat(item[column.name])}
                                            </td>
                                        )
                                    } else {
                                        return (
                                            <td key={column.name} onClick={() => editData(item)} className="link">
                                                {item[column.name]}
                                            </td>
                                        )
                                    }
                                })}
                                <td className="center sticky-col">
                                    <button className="sm" onClick={() => editData(item)}>✏️</button>
                                    <button className="sm" onClick={() => tryDeleteData(item)}>❌</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="data-footer">
                <div>
                    Página: {page} ({((page - 1) * limit) + 1} à {(((page - 1) * limit) + 1) + (showData.length - 1)})
                </div>
                <div className="paginate">
                    {pages && pages.length > 0 && pages.map(item => (
                        <>
                            {item === '...' && (<button key={item} disabled>{item}</button>)}
                            {item !== '...' && (<button key={item} onClick={() => setPage(parseInt(item))}>{item}</button>)}
                        </>
                    ))}
                </div>
                {search && search.trim() != '' && (
                    <div>Total Pesquisa: {totalSearch}</div>
                )}
                <div>Total: {total}</div>
            </div>
            <Modal isOpen={modalDeleteTable} onClose={() => setModalDeleteTable(false)}>
                <div className="modal-delete">
                    <h3>Excluir Tabela</h3>
                    <p>Deseja excluir a tabela <b>{tableName}</b>?</p>
                    <footer>
                        <button onClick={() => setModalDeleteTable(false)}>Cancelar</button>
                        <button onClick={deleteTable}>Excluir</button>
                    </footer>
                </div>
            </Modal>
            <Modal isOpen={modalClearTable} onClose={() => setModalClearTable(false)}>
                <div className="modal-delete">
                    <h3>Limpar Tabela</h3>
                    <p>Deseja excluir todos os registros a tabela <b>{tableName}</b>?</p>
                    <footer>
                        <button onClick={() => setModalClearTable(false)}>Cancelar</button>
                        <button onClick={clearTable}>Limpar Tabela</button>
                    </footer>
                </div>
            </Modal>
            <Modal isOpen={modalDeleteData} onClose={() => setModalDeleteData(false)}>
                <div className="modal-delete">
                    <h3>Excluir Registro</h3>
                    <p>Deseja excluir o registro <b>{deleteId}</b>?</p>
                    <footer>
                        <button onClick={() => setModalDeleteData(false)}>Cancelar</button>
                        <button onClick={deleteData}>Excluir</button>
                    </footer>
                </div>
            </Modal>
            <Modal size="sm" isOpen={modalError != ''} onClose={() => setModalError('')}>
                <div className="modal-delete">
                    <h3>Erro</h3>
                    <p>{modalError}</p>
                    <footer>
                        <button onClick={() => setModalError('')}>Fechar</button>
                    </footer>
                </div>
            </Modal>
        </>
    )
}

export default Data