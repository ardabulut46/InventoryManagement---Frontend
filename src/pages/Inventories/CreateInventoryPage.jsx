import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createInventory } from '../../api/InventoryService'
import { getUsers } from '../../api/UserService'
import { getCompanies } from '../../api/CompanyService'
import {
    Typography,
    TextField,
    Button,
    Box,
    Autocomplete,
    Grid,
    MenuItem,
    Paper,
    Divider,
    Alert,
    Container,
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'

const STATUS_OPTIONS = [
    'Available',
    'In Use',
    'Under Maintenance',
    'Retired',
    'Lost',
]

function CreateInventoryPage() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        barcode: '',
        serialNumber: '',
        family: '',
        type: '',
        brand: '',
        model: '',
        location: '',
        status: 'Available',
        room: '',
        floor: '',
        block: '',
        department: '',
        purchaseDate: '',
        warrantyStartDate: '',
        warrantyEndDate: '',
        supplier: '',
        assignedUserId: null,
        supportCompanyId: null,
        invoiceAttachmentPath: null
    })

    const [users, setUsers] = useState([])
    const [companies, setCompanies] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [errors, setErrors] = useState({})
    const [submitError, setSubmitError] = useState('')

    useEffect(() => {
        loadUsers()
        loadCompanies()
    }, [])

    const loadUsers = async () => {
        try {
            const response = await getUsers()
            setUsers(response.data)
        } catch (err) {
            console.error('Error fetching users', err)
        }
    }

    const loadCompanies = async () => {
        try {
            const response = await getCompanies()
            setCompanies(response.data)
        } catch (err) {
            console.error('Error fetching companies', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.barcode) newErrors.barcode = 'Barkod alanı zorunludur'
        if (!formData.serialNumber) newErrors.serialNumber = 'Seri numarası zorunludur'
        if (!formData.family) newErrors.family = 'Aile bilgisi zorunludur'
        if (!formData.type) newErrors.type = 'Tip bilgisi zorunludur'
        if (!formData.brand) newErrors.brand = 'Marka bilgisi zorunludur'
        if (!formData.model) newErrors.model = 'Model bilgisi zorunludur'
        
        // Validate dates
        if (formData.warrantyStartDate && formData.warrantyEndDate) {
            if (new Date(formData.warrantyStartDate) > new Date(formData.warrantyEndDate)) {
                newErrors.warrantyEndDate = 'Garanti bitiş tarihi başlangıç tarihinden önce olamaz'
            }
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError('')
        
        if (!validateForm()) return

        try {
            const inventoryData = {
                ...formData,
                purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
                warrantyStartDate: formData.warrantyStartDate ? new Date(formData.warrantyStartDate).toISOString() : null,
                warrantyEndDate: formData.warrantyEndDate ? new Date(formData.warrantyEndDate).toISOString() : null,
                assignedUserId: selectedUser?.id || null,
                supportCompanyId: selectedCompany?.id || null,
            }

            await createInventory(inventoryData)
            navigate('/inventories')
        } catch (err) {
            console.error('Error creating inventory', err)
            setSubmitError('Envanter oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
        }
    }

    return (
        <Container maxWidth="lg">
            <Box component={Paper} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/inventories')}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>
                        Create New Inventory Item
                    </Typography>
                </Box>
                <Divider sx={{ mb: 4 }} />

                {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {submitError}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Basic Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Barcode"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.barcode}
                                        helperText={errors.barcode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Serial Number"
                                        name="serialNumber"
                                        value={formData.serialNumber}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.serialNumber}
                                        helperText={errors.serialNumber}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {STATUS_OPTIONS.map(option => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Product Details */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Product Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Family"
                                        name="family"
                                        value={formData.family}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.family}
                                        helperText={errors.family}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.type}
                                        helperText={errors.type}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.brand}
                                        helperText={errors.brand}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Model"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.model}
                                        helperText={errors.model}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Purchase and Warranty */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Purchase and Warranty
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Purchase Date"
                                        name="purchaseDate"
                                        value={formData.purchaseDate}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Warranty Start Date"
                                        name="warrantyStartDate"
                                        value={formData.warrantyStartDate}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Warranty End Date"
                                        name="warrantyEndDate"
                                        value={formData.warrantyEndDate}
                                        onChange={handleChange}
                                        error={!!errors.warrantyEndDate}
                                        helperText={errors.warrantyEndDate}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Supplier"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Location Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Location Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Room"
                                        name="room"
                                        value={formData.room}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Floor"
                                        name="floor"
                                        value={formData.floor}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Block"
                                        name="block"
                                        value={formData.block}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Assignment */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Assignment
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={users}
                                        getOptionLabel={(user) => user.email}
                                        value={selectedUser}
                                        onChange={(e, newValue) => setSelectedUser(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Assigned User"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={companies}
                                        getOptionLabel={(company) => company.name}
                                        value={selectedCompany}
                                        onChange={(e, newValue) => setSelectedCompany(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Support Company"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/inventories')}
                            sx={{ px: 4 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{ px: 4 }}
                        >
                            Create Inventory
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Container>
    )
}

export default CreateInventoryPage
