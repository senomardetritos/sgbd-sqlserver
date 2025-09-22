import { useEffect, useState } from 'react'
import './LeftMenu.css'
import { NavLink, useNavigate } from 'react-router-dom';
import { useEventEmitter } from '../../utils/EventEmitter';

interface TableInterface {
    TABLE_NAME: string
}

function LeftMenu() {

    const [tables, setTables] = useState<TableInterface[]>([])
    const navigate = useNavigate();

    async function fetchTables() {
        const apiUrl = import.meta.env.VITE_API_URL;
        const data_base = localStorage.getItem('data_base')
        const response = await fetch(`${apiUrl}/${data_base}/tables`)
        const json = await response.json()
        setTables(json.data)
    }

    function newTable() {
        navigate('/tables/new')
    }

    useEffect(() => { fetchTables() }, [])
    useEventEmitter('reloadTables', fetchTables);

    return (
        <>
            <h2>SGBD SQLServer</h2>
            <div className='divider'></div>
            <ul className='menu-items'>
                <li>
                    <button onClick={newTable}>Nova Tabela</button>
                </li>
                <li>
                    <div className='divider'></div>
                </li>
                <li>
                    <h3>Tabelas</h3>
                </li>
                <li>
                    <div className='divider'></div>
                </li>
                {tables && tables.length == 0 && (
                    <li>
                        <p>Nenhuma tabela criada...</p>
                    </li>
                )}
                {tables && tables.length > 0 && tables.map((item) => (
                    <li key={item.TABLE_NAME}>
                        <NavLink to={`/data/${item.TABLE_NAME}`}>{item.TABLE_NAME}</NavLink>
                    </li>
                ))}
            </ul>
        </>
    )
}

export default LeftMenu