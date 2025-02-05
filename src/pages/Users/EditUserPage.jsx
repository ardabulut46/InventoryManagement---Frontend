import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserById, updateUser } from '../../api/UserService'
import {
    Typography,
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Box
} from '@mui/material'

function EditUserPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        location: '',
        department: '',
        isActive: true
    })

    useEffect(() => {
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const res = await getUserById(id)
            const u = res.data
            setFormData({
                name: u.name || '',
                surname: u.surname || '',
                email: u.email || '',
                location: u.location || '',
                department: u.department || '',
                isActive: u.isActive
            })
        } catch (err) {
            console.error('Error fetching user:', err)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await updateUser(id, formData)
            navigate('/admin')
        } catch (err) {
            console.error('Error updating user:', err)
        }
    }

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom>
                Edit User
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column' }}
            >
                <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <TextField
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    margin="normal"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                        />
                    }
                    label="Active"
                />
                <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained">
                        Update
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default EditUserPage
