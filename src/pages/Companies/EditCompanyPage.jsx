import React, { useState, useEffect } from 'react'
import { getCompanyById, updateCompany } from '../../api/CompanyService'
import { useNavigate, useParams } from 'react-router-dom'

function EditCompanyPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
    })

    useEffect(() => {
        fetchCompany()
    }, [])

    const fetchCompany = async () => {
        try {
            const response = await getCompanyById(id)
            const { name, address, email, phone } = response.data
            setFormData({ name, address, email, phone })
        } catch (error) {
            console.error('Error fetching company', error)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await updateCompany(id, formData)
            navigate('/admin/companies')
        } catch (error) {
            console.error('Error updating company', error)
        }
    }

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Edit Company</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name: </label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Address: </label>
                    <input name="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email: </label>
                    <input name="email" value={formData.email} onChange={handleChange} type="email" required />
                </div>
                <div>
                    <label>Phone: </label>
                    <input name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <br />
                <button type="submit">Update</button>
            </form>
        </div>
    )
}

export default EditCompanyPage
