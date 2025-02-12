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
    Alert,
    Container,
    IconButton,
    Tooltip,
    useTheme,
    Divider,
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Help as HelpIcon,
} from '@mui/icons-material'

const STATUS_OPTIONS = [
    'Kullanılabilir',
    'Kullanımda',
    'Bakımda',
    'Emekli',
    'Kayıp',
]

const CURRENCY_OPTIONS = [
    { value: 1, label: 'TL' },
    { value: 2, label: 'USD' },
    { value: 3, label: 'EUR' },
];

function CreateInventoryPage() {
    const theme = useTheme()
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
        purchasePrice: '',
        purchaseCurrency: 1,
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
                purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
                purchaseCurrency: formData.purchaseCurrency,
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/inventories')}
                        sx={{ mr: 2 }}
                    >
                        Geri
                    </Button>
                    <Typography variant="h4" sx={{ flexGrow: 1, color: theme.palette.primary.main }}>
                        Yeni Envanter Öğesi Oluştur
                    </Typography>
                </Box>

                {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {submitError}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            backgroundColor: theme.palette.grey[50],
                            borderRadius: 2
                        }}
                    >
                        {/* Basic Information Section */}
                        <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                            Temel Bilgiler
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Tooltip title="Envanter öğesi için benzersiz tanımlayıcı" arrow placement="top">
                                    <TextField
                                        fullWidth
                                        label="Barkod"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        required
                                        error={!!errors.barcode}
                                        helperText={errors.barcode}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton size="small">
                                                    <HelpIcon fontSize="small" color="action" />
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Tooltip>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Seri Numarası"
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
                                    label="Durum"
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

                        <Divider sx={{ my: 3 }} />

                        {/* Product Details Section */}
                        <Typography variant="h6" sx={{ mb: 2, mt: 3, color: theme.palette.primary.main }}>
                            Ürün Detayları
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Aile"
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
                                    label="Tip"
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
                                    label="Marka"
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

                        <Divider sx={{ my: 3 }} />

                        {/* Purchase and Warranty Section */}
                        <Typography variant="h6" sx={{ mb: 2, mt: 3, color: theme.palette.primary.main }}>
                            Satın Alma ve Garanti Bilgileri
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Satın Alma Tarihi"
                                    name="purchaseDate"
                                    value={formData.purchaseDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Satın Alma Fiyatı"
                                    name="purchasePrice"
                                    value={formData.purchasePrice}
                                    onChange={handleChange}
                                    InputProps={{
                                        inputProps: { min: 0 }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Para Birimi"
                                    name="purchaseCurrency"
                                    value={formData.purchaseCurrency}
                                    onChange={handleChange}
                                >
                                    {CURRENCY_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Garanti Başlangıç Tarihi"
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
                                    label="Garanti Bitiş Tarihi"
                                    name="warrantyEndDate"
                                    value={formData.warrantyEndDate}
                                    onChange={handleChange}
                                    error={!!errors.warrantyEndDate}
                                    helperText={errors.warrantyEndDate}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Tedarikçi"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Location and Assignment Section */}
                        <Typography variant="h6" sx={{ mb: 2, mt: 3, color: theme.palette.primary.main }}>
                            Konum ve Atama Bilgileri
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Konum"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Departman"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Oda"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Kat"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Blok"
                                    name="block"
                                    value={formData.block}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={users}
                                    getOptionLabel={(user) => user.email}
                                    value={selectedUser}
                                    onChange={(e, newValue) => setSelectedUser(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Atanan Kullanıcı"
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
                                            label="Destek Şirketi"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                        <Button
                            onClick={() => navigate('/inventories')}
                            variant="outlined"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Envanter Oluştur
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Container>
    )
}

export default CreateInventoryPage
