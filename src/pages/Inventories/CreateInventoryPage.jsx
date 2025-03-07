import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createInventory } from '../../api/InventoryService'
import { getUsers } from '../../api/UserService'
import { getCompanies } from '../../api/CompanyService'
import FamilyService from '../../api/FamilyService'
import InventoryTypeService from '../../api/InventoryTypeService'
import BrandService from '../../api/BrandService'
import ModelService from '../../api/ModelService'
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
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Help as HelpIcon,
    AttachFile as AttachFileIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon,
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
        familyId: null,
        typeId: null,
        brandId: null,
        modelId: null,
        location: '',
        status: 'Kullanılabilir',
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
    })

    // New state for file uploads
    const [files, setFiles] = useState([])
    const [fileDescription, setFileDescription] = useState('')
    
    const [users, setUsers] = useState([])
    const [companies, setCompanies] = useState([])
    const [families, setFamilies] = useState([])
    const [types, setTypes] = useState([])
    const [brands, setBrands] = useState([])
    const [models, setModels] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedCompany, setSelectedCompany] = useState(null)
    const [errors, setErrors] = useState({})
    const [submitError, setSubmitError] = useState('')

    // Add loading state
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadUsers()
        loadCompanies()
        loadFamilies()
        loadTypes()
        loadBrands()
    }, [])

    // Add useEffect to load models when brand changes
    useEffect(() => {
        if (formData.brandId) {
            loadModelsByBrand(formData.brandId)
        } else {
            setModels([])
        }
    }, [formData.brandId])

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

    const loadFamilies = async () => {
        try {
            const response = await FamilyService.getActiveFamilies()
            setFamilies(response.data)
        } catch (err) {
            console.error('Error fetching families', err)
        }
    }

    const loadTypes = async () => {
        try {
            const response = await InventoryTypeService.getActiveTypes()
            setTypes(response.data)
        } catch (err) {
            console.error('Error fetching inventory types', err)
        }
    }

    const loadBrands = async () => {
        try {
            const response = await BrandService.getActiveBrands()
            setBrands(response.data)
        } catch (err) {
            console.error('Error fetching brands', err)
        }
    }

    const loadModelsByBrand = async (brandId) => {
        try {
            const response = await ModelService.getModelsByBrand(brandId)
            setModels(response.data)
        } catch (err) {
            console.error('Error fetching models', err)
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
        if (!formData.familyId) newErrors.familyId = 'Aile bilgisi zorunludur'
        if (!formData.typeId) newErrors.typeId = 'Tip bilgisi zorunludur'
        if (!formData.brandId) newErrors.brandId = 'Marka bilgisi zorunludur'
        if (!formData.modelId) newErrors.modelId = 'Model bilgisi zorunludur'
        
        // Validate dates
        if (formData.warrantyStartDate && formData.warrantyEndDate) {
            if (new Date(formData.warrantyStartDate) > new Date(formData.warrantyEndDate)) {
                newErrors.warrantyEndDate = 'Garanti bitiş tarihi başlangıç tarihinden önce olamaz'
            }
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles(prevFiles => [...prevFiles, ...newFiles])
        }
    }

    // Remove a file from the list
    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
    }

    // Handle file description change
    const handleFileDescriptionChange = (e) => {
        setFileDescription(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError('')
        
        if (!validateForm()) return

        try {
            setIsSubmitting(true)
            
            // Get the selected objects for reference
            const selectedFamily = families.find(f => f.id === formData.familyId) || null;
            const selectedType = types.find(t => t.id === formData.typeId) || null;
            const selectedBrand = brands.find(b => b.id === formData.brandId) || null;
            const selectedModel = models.find(m => m.id === formData.modelId) || null;
            
            const inventoryData = {
                ...formData,
                purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
                purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
                purchaseCurrency: formData.purchaseCurrency,
                warrantyStartDate: formData.warrantyStartDate ? new Date(formData.warrantyStartDate).toISOString() : null,
                warrantyEndDate: formData.warrantyEndDate ? new Date(formData.warrantyEndDate).toISOString() : null,
                assignedUserId: selectedUser?.id || null,
                supportCompanyId: selectedCompany?.id || null,
                // Include names for reference
                familyName: selectedFamily?.name,
                typeName: selectedType?.name,
                brandName: selectedBrand?.name,
                modelName: selectedModel?.name
            }

            // Create FormData for multipart/form-data submission
            const formDataToSend = new FormData()
            
            // Append all inventory data fields
            Object.keys(inventoryData).forEach(key => {
                if (inventoryData[key] !== null && inventoryData[key] !== undefined) {
                    formDataToSend.append(key, inventoryData[key])
                }
            })
            
            // Append files
            files.forEach(file => {
                formDataToSend.append('files', file)
            })
            
            // Append file description if provided
            if (fileDescription) {
                formDataToSend.append('fileDescription', fileDescription)
            }

            await createInventory(formDataToSend)
            navigate('/inventories')
        } catch (err) {
            console.error('Error creating inventory', err)
            setSubmitError('Envanter oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.')
        } finally {
            setIsSubmitting(false)
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
                                    select
                                    label="Aile"
                                    name="familyId"
                                    value={formData.familyId || ''}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.familyId}
                                    helperText={errors.familyId}
                                >
                                    <MenuItem value="">
                                        <em>Seçiniz</em>
                                    </MenuItem>
                                    {families.map((family) => (
                                        <MenuItem key={family.id} value={family.id}>
                                            {family.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Tip"
                                    name="typeId"
                                    value={formData.typeId || ''}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.typeId}
                                    helperText={errors.typeId}
                                >
                                    <MenuItem value="">
                                        <em>Seçiniz</em>
                                    </MenuItem>
                                    {types.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Marka"
                                    name="brandId"
                                    value={formData.brandId || ''}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.brandId}
                                    helperText={errors.brandId}
                                >
                                    <MenuItem value="">
                                        <em>Seçiniz</em>
                                    </MenuItem>
                                    {brands.map((brand) => (
                                        <MenuItem key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Model"
                                    name="modelId"
                                    value={formData.modelId || ''}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.modelId}
                                    helperText={errors.modelId || (formData.brandId ? '' : 'Önce marka seçiniz')}
                                    disabled={!formData.brandId}
                                >
                                    <MenuItem value="">
                                        <em>Seçiniz</em>
                                    </MenuItem>
                                    {models.map((model) => (
                                        <MenuItem key={model.id} value={model.id}>
                                            {model.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
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
                                    type="text"
                                    label="Satın Alma Fiyatı"
                                    name="purchasePrice"
                                    value={formData.purchasePrice ? Number(formData.purchasePrice).toLocaleString('tr-TR') : ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\./g, '');
                                        if (value === '' || /^\d+$/.test(value)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                purchasePrice: value
                                            }));
                                        }
                                    }}
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

                        <Divider sx={{ my: 3 }} />

                        {/* File Upload Section */}
                        <Typography variant="h6" sx={{ mb: 2, mt: 3, color: theme.palette.primary.main }}>
                            Dosya Ekleri
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Dosya Açıklaması"
                                    name="fileDescription"
                                    value={fileDescription}
                                    onChange={handleFileDescriptionChange}
                                    placeholder="Tüm dosyalar için ortak açıklama"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<AttachFileIcon />}
                                    sx={{ mb: 2 }}
                                >
                                    Dosya Ekle
                                    <input
                                        type="file"
                                        multiple
                                        hidden
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                    />
                                </Button>
                                <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
                                    İzin verilen dosya türleri: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG
                                </Typography>
                                
                                {files.length > 0 && (
                                    <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            Yüklenecek Dosyalar ({files.length})
                                        </Typography>
                                        <List dense>
                                            {files.map((file, index) => (
                                                <ListItem key={index}>
                                                    <ListItemIcon>
                                                        <DescriptionIcon />
                                                    </ListItemIcon>
                                                    <ListItemText 
                                                        primary={file.name}
                                                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                                    />
                                                    <ListItemSecondaryAction>
                                                        <IconButton 
                                                            edge="end" 
                                                            aria-label="delete"
                                                            onClick={() => handleRemoveFile(index)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                        <Button
                            onClick={() => navigate('/inventories')}
                            variant="outlined"
                            disabled={isSubmitting}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Oluşturuluyor...' : 'Envanter Oluştur'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Container>
    )
}

export default CreateInventoryPage
