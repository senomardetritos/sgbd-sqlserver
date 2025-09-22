import { useEffect, useState } from 'react';
import type { FieldInterface } from '../../../interfaces/FieldInterface';
import './FormStruct.css'
import { SqlServerTypes } from '../../../utils/SqlServerTypes';
import Modal from '../../../components/Modal/Modal';

interface FormStructProps {
    tableName: string | undefined;
    field?: FieldInterface,
    onClose: (reload: boolean) => void;
}

function FormStruct({ tableName, field, onClose }: FormStructProps) {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({})
    const [hasSize, setHasSize] = useState<string[]>([])
    const [errors, setErrors] = useState<string[]>([])
    const [modalError, setModalError] = useState('')

    const apiUrl = import.meta.env.VITE_API_URL;
    const data_base = localStorage.getItem('data_base')

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        if (e.target.name == 'type' && hasSize.indexOf(e.target.value) === -1) {
            setFormData({ ...formData, ['size']: '', [e.target.name]: e.target.value });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    }

    function handleChecked(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    }

    async function handleSubmit() {
        if (!checkErrors()) return

        let url = `${apiUrl}/${data_base}/columns/${tableName}`
        if (field?.name) url = `${apiUrl}/${data_base}/columns/${tableName}/${field?.name}`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ field, data: formData }),
        });

        const json = await response.json();
        if (json.error) {
            setModalError(json.error)
        } else {
            onClose(true)
        }
    }

    function checkErrors() {
        const error: string[] = []
        if (!tableName) {
            error.push(`Tabela precisa ter um nome`)
        }
        if (!formData['name']) {
            error.push(`Nome do campo é requerido`)
        }
        if (!formData['type']) {
            error.push(`Tipo é requerido`)
        }
        if (hasSize.indexOf(formData['type']?.toUpperCase()) !== -1 && !formData['size']) {
            error.push(`Tamanho é requerido`)
        }
        if (!formData['is_null'] && !formData['default_value']) {
            error.push(`Campo deve ser nulo ou ter um valor default`)
        }

        setErrors(error)
        if (error.length == 0) return true
        return false
    }

    useEffect(() => {
        if (field?.name) {
            const copy_field = Object.assign({}, field)
            if (hasSize.indexOf(copy_field.type) === -1) delete copy_field.size
            copy_field.is_null = field.is_null == 'YES' ? true : false
            copy_field.is_unique = field.is_unique == 'YES' ? true : false
            copy_field.is_primary = field.is_primary == 'YES' ? true : false
            copy_field.default_value = field.default_value?.replace(/[(')]/g, '')
            setFormData(copy_field)
        } else { setFormData({ ...formData, ['type']: 'INT' }) }

        const data: string[] = []
        SqlServerTypes.map(item => {
            if (item.size) data.push(item.name)
        })
        setHasSize(data)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <h3>Editar Tabela: {tableName}</h3>
            <div className='divider'></div>
            <form className='form-items'>
                <div className='form-control'>
                    <label>Nome do Campo:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData['name'] || ''}
                        onChange={handleChange} />
                </div>
                <div className='form-control'>
                    <label>Tipo:</label>
                    {formData['type'] && (
                        <select
                            name="type"
                            value={formData['type']?.toUpperCase() || ''}
                            onChange={handleChange}>
                            {SqlServerTypes.map(item => (
                                <option key={item.name} value={item.name}>{item.name}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className='form-control'>
                    <label>Tamanho:</label>
                    <input
                        type="text"
                        name="size"
                        value={formData['size'] || ''}
                        onChange={handleChange}
                        disabled={hasSize.indexOf(formData['type']?.toUpperCase()) === -1} />
                </div>
                <div className='form-control'>
                    <label>Valor Default:</label>
                    <input
                        type="text"
                        name="default_value"
                        value={formData['default_value'] || ''}
                        onChange={handleChange} />
                </div>
                <div className='form-control'>
                    <label>Nulo:</label>
                    <input
                        type="checkbox"
                        name="is_null"
                        checked={formData['is_null'] ? true : false}
                        onChange={handleChecked}
                    />
                </div>
                <div className='form-control'>
                    <label>Único:</label>
                    <input
                        type="checkbox"
                        name="is_unique"
                        checked={formData['is_unique'] ? true : false}
                        onChange={handleChecked}
                    />
                </div>
            </form>
            {errors && errors.length > 0 && (
                <>
                    <div className='divider'></div>
                    <div className='form-errors'>
                        {errors.map((item) => (
                            <div key={item} className='error'>{item}</div>
                        ))}
                    </div>
                </>
            )}
            <div className='divider'></div>
            <div className='form-items'>
                <footer>
                    <button onClick={() => onClose(false)}>Cancelar</button>
                    <button onClick={handleSubmit}>Alterar Campo</button>
                </footer>
            </div>
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

export default FormStruct;