import React, { useState } from 'react'
import { createCompany } from '../../api/CompanyService'
import { useNavigate } from 'react-router-dom'
import { Typography, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Paper, Container, IconButton } from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'

function CreateCompanyPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        type: 2, // Default to Supplier (2)
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
            navigate('/admin/companies')
        } catch (error) {
            console.error('Error creating company', error)
        }
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton
                        component={Link}
                        to="/admin/companies"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Yeni Şirket Ekle
                    </Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Şirket Adı"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Adres"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Telefon"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        fullWidth
                    />
                    <FormControl fullWidth required>
                        <InputLabel>Şirket Türü</InputLabel>
                        <Select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            label="Şirket Türü"
                        >
                            <MenuItem value={1}>Destek</MenuItem>
                            <MenuItem value={2}>Tedarikçi</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button 
                            component={Link} 
                            to="/admin/companies" 
                            variant="outlined"
                        >
                            İptal
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                        >
                            Kaydet
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    )
}

export default CreateCompanyPage
