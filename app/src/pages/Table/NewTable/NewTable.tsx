import { useEffect, useState } from 'react';
import './NewTable.css'
import { SqlServerTypes } from '../../../utils/SqlServerTypes';
import { useNavigate } from 'react-router-dom';
import { globalEventEmitter } from '../../../utils/EventEmitter';

interface SchemaInterface {
    name: string;
    type: string;
    size: string;
    deleted: boolean;
}

function NewTable() {

    const navigate = useNavigate()
    const [tableName, setTableName] = useState('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formData, setFormData] = useState<any>({});
    const [schema, setSchema] = useState<SchemaInterface[]>([])
    const [hasSize, setHasSize] = useState<string[]>([])
    const [errors, setErrors] = useState<string[]>([])
    const apiUrl = import.meta.env.VITE_API_URL;
    const data_base = localStorage.getItem('data_base')

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    function handleChecked(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    }

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = []
        schema.map((item, index) => {
            if (!item.deleted) {
                data.push({
                    name: formData[`name_${index}`],
                    type: formData[`type_${index}`],
                    size: formData[`size_${index}`],
                    is_null: formData[`is_null_${index}`],
                    is_unique: formData[`is_unique_${index}`],
                    is_primary: formData[`is_primary_${index}`],
                    increment: formData[`increment_${index}`],
                    default_value: formData[`default_value_${index}`],
                })
            }
        })
        if (!checkErrors(data)) return
        const response = await fetch(`${apiUrl}/${data_base}/tables/create/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();
        if (json.error) {
            setErrors([json.error])
        } else {
            globalEventEmitter.dispatchEvent(new CustomEvent('reloadTables'))
            navigate(`/data/${tableName}`)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function checkErrors(data: any) {
        const error: string[] = []
        if (!tableName) {
            error.push(`Tabela precisa ter um nome`)
        }
        data.map((item: SchemaInterface, index: number) => {
            if (!item.name) {
                error.push(`Campo ${index + 1} precisa ter um nome`)
            }
            if (!item.type) {
                error.push(`Campo ${index + 1} precisa ter um tipo`)
            }
            if (hasSize.indexOf(item.type) !== -1 && !item.size) {
                error.push(`Campo ${index + 1} precisa ter um tamanho`)
            }
        })
        setErrors(error)
        if (error.length == 0) return true
        return false
    }
    function newField() {
        return {
            name: '',
            type: 'INT',
            size: '',
            is_null: true,
            is_unique: false,
            is_primary: false,
            increment: false,
            deleted: false
        }
    }
    function addField() {
        setSchema([...schema, newField()])
    }

    function removeField(index: number) {
        schema.map((item, i) => {
            if (i == index) {
                item.deleted = true
            }
        })
        setSchema([...schema])
    }

    function countFields(): number {
        return schema.reduce((acc, item) => {
            return acc + (item.deleted ? 0 : 1)
        }, 0)
    }

    useEffect(() => {
        setSchema([newField()])
        const data: string[] = []
        SqlServerTypes.map(item => {
            if (item.size) data.push(item.name)
        })
        setHasSize(data)
    }, [])

    return (
        <>
            <h3>Criar uma Tabela</h3>
            <div className="divider"></div>
            <div className="table-name">
                <h4>Nome da Tabela</h4>
                <input
                    type="text"
                    name='table-name'
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)} />
            </div>
            <div className="divider"></div>
            <div className="columns">
                <table cellPadding={0} cellSpacing={0}>
                    <thead>
                        <tr>
                            <th>Campo</th>
                            <th>Tipo</th>
                            <th>Tamanho</th>
                            <th>Default</th>
                            <th className='center'>Nulo</th>
                            <th className='center'>Único</th>
                            <th className='center'>Primário</th>
                            <th className='center'>Incrementar</th>
                            <th>Remover</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schema && schema.length > 0 && schema.map((item, index) => (
                            <tr key={index}>
                                {!item.deleted && (
                                    <>
                                        <td>
                                            <input
                                                type="text"
                                                name={`name_${index}`}
                                                value={formData[`name_${index}`] || ''}
                                                onChange={handleChange} />
                                        </td>
                                        <td className='md'>
                                            <select
                                                name={`type_${index}`}
                                                value={formData[`type_${index}`] || ''}
                                                onChange={handleChange}>
                                                <option value="">Selecione um tipo</option>
                                                {SqlServerTypes.map(item => (
                                                    <option key={item.name} value={item.name}>{item.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className='md'>
                                            <input
                                                type="text"
                                                name={`size_${index}`}
                                                value={formData[`size_${index}`] || ''}
                                                onChange={handleChange}
                                                disabled={hasSize.indexOf(formData[`type_${index}`]) === -1} />
                                        </td>
                                        <td className='md'>
                                            <input
                                                type="text"
                                                name={`default_value_${index}`}
                                                value={formData[`default_value_${index}`] || ''}
                                                onChange={handleChange} />
                                        </td>
                                        <td className='sm'>
                                            <input
                                                type="checkbox"
                                                name={`is_null_${index}`}
                                                value={formData[`is_null_${index}`] || ''}
                                                onChange={handleChecked}
                                            />
                                        </td>
                                        <td className='sm'>
                                            <input
                                                type="checkbox"
                                                name={`is_unique_${index}`}
                                                value={formData[`is_unique_${index}`] || ''}
                                                onChange={handleChecked}
                                            />
                                        </td>
                                        <td className='sm'>
                                            <input
                                                type="checkbox"
                                                name={`is_primary_${index}`}
                                                value={formData[`is_primary_${index}`] || ''}
                                                onChange={handleChecked}
                                            />
                                        </td>
                                        <td className='sm'>
                                            <input
                                                type="checkbox"
                                                name={`increment_${index}`}
                                                value={formData[`increment_${index}`] || ''}
                                                onChange={handleChecked}
                                            />
                                        </td>
                                        <td>
                                            <button className='sm' onClick={() => removeField(index)} disabled={countFields() < 2}>
                                                Remover
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {errors && errors.length > 0 && (
                            <tr>
                                <th colSpan={8}>
                                    {errors.map((item) => (
                                        <div key={item} className='error'>{item}</div>
                                    ))}
                                </th>
                            </tr>
                        )}
                        <tr>
                            <th colSpan={8}>
                                <div>
                                    <button onClick={addField}>Adicionar Campo</button>
                                    <button onClick={handleSubmit}>Criar Tabela</button>
                                </div>
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    )
}

export default NewTable