import React, { useState } from 'react'
import { createCompany } from '../../api/CompanyService'
import { useNavigate } from 'react-router-dom'
import { Typography, TextField, Button, Box } from '@mui/material'

function CreateCompanyPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
    })

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await createCompany(formData)
            navigate('/companies')
        } catch (error) {
            console.error('Error creating company', error)
        }
    }

    return (
        <Box sx={{ maxWidth: 500, margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom>
                Create Company
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary">
                        Create
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default CreateCompanyPage
