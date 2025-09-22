import { useEffect, useState } from 'react'
import './Header.css'
import Modal from '../Modal/Modal';
import { globalEventEmitter } from '../../utils/EventEmitter';
import { useNavigate } from 'react-router-dom';

interface DataBaseInterface {
    database_id: number;
    name: string;
}

function Header() {

    const navigate = useNavigate()

    const [dataBase, setDataBase] = useState<DataBaseInterface>()
    const [dataBases, setDataBases] = useState<DataBaseInterface[]>([])
    const [dataBaseName, setDataBaseName] = useState('')

    const [modalForm, setModalForm] = useState(false)
    const [modalDelete, setModalDelete] = useState(false)
    const [modalError, setModalError] = useState('')
    const [deleteData, setDeleteData] = useState<DataBaseInterface>()

    const apiUrl = import.meta.env.VITE_API_URL

    async function fetchData() {
        const response = await fetch(`${apiUrl}/databases`)
        const json = await response.json()
        await setDataBases(json.data)
        const data_base = json.data.find((db: DataBaseInterface) => db.name == localStorage.getItem('data_base'))
        await setDataBase(data_base ?? json.data[0])
        return json.data
    }

    function handleChange(database_id: string) {
        const data_base = dataBases.find(db => db.database_id == parseInt(database_id))
        setDataBase(data_base)
        updateDataBase(data_base?.name)
    }

    async function newDataBase() {
        if (dataBaseName.indexOf(' ') !== -1) {
            setModalError('Nome do banco de dados não pode ter espaços em branco')
            return
        }
        const url = `${apiUrl}/${dataBaseName}/database/create`
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            const databases = await fetchData()
            setDataBase(databases.find((db: DataBaseInterface) => db.name == dataBaseName))
            updateDataBase(dataBaseName)
            setModalForm(false)
        }
    }

    function updateDataBase(data_base: string | undefined) {
        localStorage.setItem('data_base', data_base || '')
        globalEventEmitter.dispatchEvent(new CustomEvent('reloadTables'))
        navigate('/')
    }

    async function deleteDataBase() {
        const url = `${apiUrl}/${deleteData?.name}/database/delete`
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            const databases = await fetchData()
            setDataBase(databases[0])
            updateDataBase(databases[0].name)
            setModalDelete(false)
        }
    }

    function showModalDelete() {
        setDeleteData(dataBase)
        setModalDelete(true)
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <div className='form-header'>
                <div className='form-header-left'>
                    <h4>Bancos de Dados:</h4>
                    <select
                        name="database"
                        value={dataBase?.database_id}
                        onChange={(e) => handleChange(e.target.value)}
                    >
                        {dataBases && dataBases.length > 0 && dataBases.map(db => (
                            <option key={db.database_id} value={db.database_id}>{db.name}</option>
                        ))}
                    </select>
                </div>
                <div className='form-header-right'>
                    <a onClick={() => setModalForm(true)}>Criar Banco de Dados</a>
                    <a onClick={showModalDelete}>Excluir Banco de Dados</a>
                </div>
            </div>
            <div className='divider'></div>
            <Modal isOpen={modalForm} onClose={() => setModalForm(false)}>
                <div className="modal-delete">
                    <h3>Novo Banco de Dados</h3>
                    <div className='divider sm'></div>
                    <div className='form-header'>
                        <div className='form-modal'>
                            <h4>Nome:</h4>
                            <input
                                name="database"
                                value={dataBaseName}
                                onChange={(e) => setDataBaseName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className='divider sm'></div>
                    <footer>
                        <button onClick={() => setModalForm(false)}>Cancelar</button>
                        <button onClick={newDataBase}>Criar Banco de Dados</button>
                    </footer>
                </div>
            </Modal >
            <Modal isOpen={modalDelete} onClose={() => setModalDelete(false)}>
                <div className="modal-delete">
                    <h3>Excluir Banco de Dados</h3>
                    <p>Deseja excluir o Banco de Dados <b>{dataBase?.name}</b>?</p>
                    <footer>
                        <button onClick={() => setModalDelete(false)}>Cancelar</button>
                        <button onClick={deleteDataBase}>Excluir</button>
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

export default Header