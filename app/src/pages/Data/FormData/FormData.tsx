import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './FormData.css'
import Modal from "../../../components/Modal/Modal";
import { InputSqlServerTypes } from "../../../utils/SqlServerTypes";
import { dateTimeToDB } from "../../../utils/DateFormat";
import type { FieldInterface } from "../../../interfaces/FieldInterface";

function FormData() {
    const { tableName, id } = useParams();
    const navigate = useNavigate()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({});
    const [modalDelete, setModalDelete] = useState(false)
    const [modalError, setModalError] = useState('')
    const [fields, setFields] = useState<FieldInterface[]>([])
    const apiUrl = import.meta.env.VITE_API_URL;
    const data_base = localStorage.getItem('data_base')

    async function fetchData() {
        const response = await fetch(`${apiUrl}/${data_base}/tables/struct/${tableName}`)
        const json = await response.json()
        if (json.data) setFields(json.data)
        if (id) {
            const response = await fetch(`${apiUrl}/${data_base}/data/${tableName}/${id}`)
            const json = await response.json()
            if (json.data) setFormData(json.data[0])
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        if (e.target.type == 'datetime-local') {
            setFormData({ ...formData, [e.target.name]: dateTimeToDB(e.target.value) });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    }

    function goBack() {
        navigate(`/data/${tableName}`)
    }

    async function saveData() {
        let url = `${apiUrl}/${data_base}/data/${tableName}`
        if (id) url = `${apiUrl}/${data_base}/data/${tableName}/${id}`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            navigate(`/data/${tableName}`)
        }
    }

    async function deleteData() {
        const response = await fetch(`${apiUrl}/${data_base}/tables/delete/${tableName}`, {
            method: 'POST',
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            navigate(`/data/${tableName}`)
        }
        setModalDelete(false)
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableName])

    return (
        <>
            <div className="header">
                <h3>
                    {id ? 'Editar' : 'Novo Registro'} {tableName}
                </h3>
                <div className="header-options">
                    <a onClick={goBack}>Voltar</a>
                    {id && <a onClick={() => setModalDelete(true)}>Excluir Registro</a>}
                </div>
            </div>
            <div className="divider"></div>
            <form className="form-items" action={saveData}>
                {fields && fields.length > 0 && fields.map((item) => {
                    if (id || item.is_identity != '1') {
                        return (
                            <div key={item.name} className="form-control">
                                <label>{item.name} {item.is_null == 'NO' && item.is_primary == 'NO' ? '(Requerido)' : ''}:</label>
                                {InputSqlServerTypes[item.type.toUpperCase()] != 'textarea' && (
                                    <input
                                        type={InputSqlServerTypes[item.type.toUpperCase()]}
                                        name={item.name}
                                        value={formData[item.name] || ''}
                                        required={item.is_null == 'NO'}
                                        disabled={item.is_primary == 'YES' && item.is_identity == '1'}
                                        onChange={handleChange} />
                                )}
                                {InputSqlServerTypes[item.type.toUpperCase()] == 'textarea' && (
                                    <input
                                        type={InputSqlServerTypes[item.type.toUpperCase()]}
                                        name={item.name}
                                        value={formData[item.name] || ''}
                                        required={item.is_null == 'NO'}
                                        disabled={item.is_primary == 'YES'}
                                        onChange={handleChange} />
                                )}
                            </div>
                        )
                    }
                })}
                < div className="divider"></div>
                <div className="footer-buttons">
                    <button type="button" onClick={goBack}>Volvar</button>
                    <button type="submit">Salvar</button>
                </div>
            </form >
            <Modal isOpen={modalDelete} onClose={() => setModalDelete(false)}>
                <div className="modal-delete">
                    <h3>Excluir Registro</h3>
                    <p>Deseja excluir o registro <b>{id}</b>?</p>
                    <footer>
                        <button onClick={() => setModalDelete(false)}>Cancelar</button>
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

export default FormData