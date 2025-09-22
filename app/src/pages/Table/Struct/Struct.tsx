import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FieldInterface } from "../../../interfaces/FieldInterface";
import Modal from "../../../components/Modal/Modal";
import FormStruct from "../FormStruct/FormStruct";

function Struct() {
    const { tableName } = useParams();
    const navigate = useNavigate();

    const [fields, setFields] = useState<FieldInterface[]>([])
    const [field, setField] = useState<FieldInterface>()
    const [deleteFieldName, setDeleteFieldName] = useState(0)
    const [modalDeleteField, setModalDeleteField] = useState(false)
    const [modalFormField, setModalFormField] = useState(false)
    const [modalError, setModalError] = useState('')

    const apiUrl = import.meta.env.VITE_API_URL;
    const data_base = localStorage.getItem('data_base')

    async function fetchData() {
        const response = await fetch(`${apiUrl}/${data_base}/tables/struct/${tableName}`)
        const json = await response.json()
        if (json.data) setFields(json.data)
    }

    function newField() {
        setField({} as FieldInterface)
        setModalFormField(true)
    }

    function goBack() {
        navigate(`/data/${tableName}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function editField(item: any) {
        setField(item)
        setModalFormField(true)
    }

    function closeForm(reload: boolean) {
        if (reload) fetchData()
        setModalFormField(false)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function tryDeleteField(item: any) {
        setDeleteFieldName(item.name)
        setModalDeleteField(true)
    }

    async function deleteField() {
        const url = `${apiUrl}/${data_base}/columns/delete/${tableName}/${deleteFieldName}`
        const response = await fetch(url, {
            method: 'POST',
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            fetchData()
        }
        setModalDeleteField(false)
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tableName])

    return (
        <>
            <div className="header">
                <h3>Estrutura da Tabela: {tableName}</h3>
                <div className="header-options">
                    <a onClick={newField}>Novo Campo</a>
                    <a onClick={goBack}>Voltar</a>
                </div>
            </div>
            <div className="divider"></div>
            <table cellPadding={0} cellSpacing={0}>
                <thead>
                    <tr>
                        <th>Campo</th>
                        <th>Tipo</th>
                        <th>Tamanho</th>
                        <th>Nulo</th>
                        <th>Default</th>
                        <th>Único</th>
                        <th>Primário</th>
                        <th>Editar</th>
                        <th>Remover</th>
                    </tr>
                </thead>
                <tbody>
                    {fields && fields.length > 0 && fields.map(item => (
                        <tr key={item.name}>
                            <td>{item.name}</td>
                            <td>{item.type.toUpperCase()}</td>
                            <td>{item.size && item.size > 0 ? item.size : ''}{item.size && item?.size > 0 && item.precision ? `,${item.precision}` : ''}</td>
                            <td>{item.is_null == 'YES' ? 'Sim' : 'Não'}</td>
                            <td>{item.default_value?.replace(/[(')]/g, '')}</td>
                            <td>{item.is_unique == 'YES' ? 'Sim' : 'Não'}</td>
                            <td>{item.is_primary == 'YES' ? 'Sim' : 'Não'}</td>
                            <td>
                                <button className="sm" onClick={() => editField(item)}>✏️</button>
                            </td>
                            <td>
                                <button className="sm" onClick={() => tryDeleteField(item)}>❌</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={modalDeleteField} onClose={() => setModalDeleteField(false)}>
                <div className="modal-delete">
                    <h3>Excluir Campo</h3>
                    <p>Deseja excluir o campo <b>{deleteFieldName}</b>?</p>
                    <footer>
                        <button onClick={() => setModalDeleteField(false)}>Cancelar</button>
                        <button onClick={deleteField}>Excluir Campo</button>
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
            <Modal size="lg" isOpen={modalFormField} onClose={() => setModalFormField(false)}>
                <FormStruct tableName={tableName} field={field} onClose={(reload) => closeForm(reload)} />
            </Modal>

        </>
    )
}

export default Struct