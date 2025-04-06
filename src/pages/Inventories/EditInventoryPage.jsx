import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getInventoryById,
    updateInventory,
    assignUser,
    getInventoryHistory,
    getAssignmentHistory,
    uploadInvoice
} from '../../api/InventoryService';
import { getUsers } from '../../api/UserService';
import { getCompanies } from '../../api/CompanyService';
import FamilyService from '../../api/FamilyService';
import InventoryTypeService from '../../api/InventoryTypeService';
import BrandService from '../../api/BrandService';
import ModelService from '../../api/ModelService';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const STATUS_OPTIONS = [
    { value: 1, label: 'Müsait' },        // Available
    { value: 2, label: 'Kullanımda' },    // InUse
    { value: 3, label: 'Bakımda' },       // UnderMaintenance
    { value: 4, label: 'Emekli' },        // Retired
    { value: 5, label: 'Kayıp' }          // Lost
];

const CURRENCY_OPTIONS = [
    { value: 1, label: 'TL' },
    { value: 2, label: 'USD' },
    { value: 3, label: 'EUR' },
];

// Map legacy status values or enum values to the correct format
const mapStatusValue = (status) => {
    if (status === null || status === undefined) return 1; // Default to Available (1)
    
    // If status is a number and within valid range (1-5), return it directly
    if (typeof status === 'number' && status >= 1 && status <= 5) {
        return status;
    }
    
    // If status is an object with a numeric value property
    if (typeof status === 'object' && status !== null && 'value' in status) {
        const numValue = Number(status.value);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
            return numValue;
        }
    }
    
    // If status is a string number, convert to number
    if (typeof status === 'string' && !isNaN(Number(status))) {
        const numericStatus = Number(status);
        if (numericStatus >= 1 && numericStatus <= 5) {
            return numericStatus;
        }
    }
    
    // Handle enum string names (case insensitive)
    if (typeof status === 'string') {
        const statusLower = status.toLowerCase();
        
        // Map string values to enum values
        const statusStringMap = {
            'müsait': 1,
            'kullanımda': 2,
            'bakımda': 3,
            'emekli': 4,
            'kayıp': 5,
            'kullanılabilir': 1, // Legacy mapping
            'available': 1,
            'inuse': 2,
            'undermaintenance': 3,
            'retired': 4,
            'lost': 5
        };
        
        return statusStringMap[statusLower] || 1; // Default to Available (1) if no match
    }
    
    console.warn('Unknown status format:', status);
    return 1; // Default to Available (1) for any unknown format
};

function EditInventoryPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState({
        barcode: '',
        serialNumber: '',
        familyId: null,
        typeId: null,
        brandId: null,
        modelId: null,
        location: '',
        status: mapStatusValue('Müsait'),
        room: '',
        floor: '',
        block: '',
        department: '',
        purchasePrice: 0,
        purchaseCurrency: 1,
        warrantyStartDate: '',
        warrantyEndDate: '',
        assignedUserId: null,
        supportCompanyId: null,
        invoiceAttachmentPath: '',
    });

    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [families, setFamilies] = useState([]);
    const [types, setTypes] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [inventoryHistory, setInventoryHistory] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignmentNotes, setAssignmentNotes] = useState('');
    const [invoiceFile, setInvoiceFile] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // First load all the reference data
                const [usersResponse, companiesResponse, familiesResponse, typesResponse, brandsResponse] = 
                    await Promise.all([
                        getUsers(),
                        getCompanies(),
                        FamilyService.getActiveFamilies(),
                        InventoryTypeService.getActiveTypes(),
                        BrandService.getActiveBrands()
                    ]);
                
                // Set the reference data
                setUsers(usersResponse.data);
                setCompanies(companiesResponse.data);
                setFamilies(familiesResponse.data);
                setTypes(typesResponse.data);
                setBrands(brandsResponse.data);
                
                // Now load the inventory data
                const inventoryResponse = await getInventoryById(id);
                const inventory = inventoryResponse.data;

                // Log complete inventory data from API
                console.log('Received inventory data from API:', inventory);
                console.log('PurchaseCurrency type:', typeof inventory.purchaseCurrency, 'value:', inventory.purchaseCurrency);
                console.log('Status type:', typeof inventory.status, 'value:', inventory.status);
                
                // Log the status value we're receiving
                console.log('Received inventory status:', inventory.status);
                
                // Set form data, ensuring status is a number
                const statusValue = typeof inventory.status === 'string' 
                    ? mapStatusValue(inventory.status) 
                    : (typeof inventory.status === 'number' ? inventory.status : 1);
                    
                console.log('Mapped status value:', statusValue);
                
                setFormData({
                    ...inventory,
                    warrantyStartDate: inventory.warrantyStartDate ? new Date(inventory.warrantyStartDate).toISOString().split('T')[0] : '',
                    warrantyEndDate: inventory.warrantyEndDate ? new Date(inventory.warrantyEndDate).toISOString().split('T')[0] : '',
                    status: statusValue,
                    purchasePrice: inventory.purchasePrice || 0,
                    purchaseCurrency: inventory.purchaseCurrency || 1
                });
                
                // Set assigned user
                if (inventory.assignedUser) {
                    setCurrentUser(inventory.assignedUser);
                    setSelectedUser(inventory.assignedUser);
                }
                
                // Set support company
                if (inventory.supportCompany) {
                    setSelectedCompany(inventory.supportCompany);
                }
                
                // Handle family selection - find the family by ID
                if (inventory.familyId) {
                    const family = familiesResponse.data.find(f => f.id === inventory.familyId);
                    if (family) {
                        setSelectedFamily(family);
                    } else {
                        // Create a family object from the inventory data
                        const familyFromInventory = {
                            id: inventory.familyId,
                            name: inventory.familyName || `Family ID: ${inventory.familyId}`
                        };
                        setSelectedFamily(familyFromInventory);
                    }
                }
                
                // Handle type selection - find the type by ID
                if (inventory.typeId) {
                    const type = typesResponse.data.find(t => t.id === inventory.typeId);
                    if (type) {
                        setSelectedType(type);
                    } else {
                        // Create a type object from the inventory data
                        const typeFromInventory = {
                            id: inventory.typeId,
                            name: inventory.typeName || `Type ID: ${inventory.typeId}`
                        };
                        setSelectedType(typeFromInventory);
                    }
                }
                
                // Handle brand selection - find the brand by ID
                if (inventory.brandId) {
                    const brand = brandsResponse.data.find(b => b.id === inventory.brandId);
                    if (brand) {
                        setSelectedBrand(brand);
                    } else {
                        // Create a brand object from the inventory data
                        const brandFromInventory = {
                            id: inventory.brandId,
                            name: inventory.brandName || `Brand ID: ${inventory.brandId}`
                        };
                        setSelectedBrand(brandFromInventory);
                    }
                    
                    // Load models for this brand
                    try {
                        const modelResponse = await ModelService.getModelsByBrand(inventory.brandId);
                        
                        // Always set the models array first
                        setModels(modelResponse.data);
                        
                        // Handle model selection - find the model by ID
                        if (inventory.modelId) {
                            // Create a model object from the inventory data first
                            const modelFromInventory = {
                                id: inventory.modelId,
                                name: inventory.modelName || `Model ID: ${inventory.modelId}`
                            };
                            
                            // Try to find the model in the loaded models
                            const model = modelResponse.data.find(m => m.id === inventory.modelId);
                            
                            if (model) {
                                // Use setTimeout to ensure this happens after the models state is updated
                                setTimeout(() => {
                                    setSelectedModel(model);
                                }, 100);
                            } else {
                                // Use setTimeout to ensure this happens after the models state is updated
                                setTimeout(() => {
                                    setSelectedModel(modelFromInventory);
                                }, 100);
                            }
                        }
                    } catch (err) {
                        console.error('Error loading models for brand:', err);
                        
                        // If we can't load models, still create a model object from inventory data
                        if (inventory.modelId) {
                            const modelFromInventory = {
                                id: inventory.modelId,
                                name: inventory.modelName || `Model ID: ${inventory.modelId}`
                            };
                            
                            // Set an empty array for models to avoid errors
                            setModels([modelFromInventory]);
                            
                            // Use setTimeout to ensure this happens after the models state is updated
                            setTimeout(() => {
                                setSelectedModel(modelFromInventory);
                            }, 100);
                        }
                    }
                }
                
                // Load inventory history
                const historyResponse = await getAssignmentHistory(id);
                setInventoryHistory(historyResponse.data);
                
            } catch (err) {
                console.error('Error loading data:', err);
                setSubmitError('Veri yüklenirken hata oluştu');
            }
        };
        
        fetchAllData();
    }, [id]);

    // This useEffect handles when the user changes the brand in the UI
    useEffect(() => {
        if (selectedBrand && selectedBrand.id) {
            const loadModelsForSelectedBrand = async () => {
                try {
                    const response = await ModelService.getModelsByBrand(selectedBrand.id);
                    
                    // Set the models array
                    setModels(response.data);
                    
                    // If we have a previously selected model and it belongs to this brand, try to keep it selected
                    if (selectedModel && selectedModel.id) {
                        const modelStillExists = response.data.find(m => m.id === selectedModel.id);
                        if (!modelStillExists) {
                            setSelectedModel(null);
                        }
                    } else {
                        // No previously selected model or it's for a different brand
                        setSelectedModel(null);
                    }
                } catch (err) {
                    console.error('Error fetching models for brand', err);
                    setModels([]);
                    setSelectedModel(null);
                }
            };
            
            loadModelsForSelectedBrand();
        } else {
            setModels([]);
            setSelectedModel(null);
        }
    }, [selectedBrand]);

    const loadInventoryHistory = async () => {
        try {
            const response = await getAssignmentHistory(id);
            setInventoryHistory(response.data);
        } catch (err) {
            console.error('Error loading inventory history', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // If the field is status, ensure we're storing the numeric value
        if (name === 'status') {
            const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
            console.log(`Status changed to: ${value} (${typeof value}), converted to: ${numericValue} (${typeof numericValue})`);
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.barcode) newErrors.barcode = 'Barkod alanı zorunludur';
        if (!formData.serialNumber) newErrors.serialNumber = 'Seri numarası zorunludur';
        if (!selectedFamily) newErrors.familyId = 'Aile bilgisi zorunludur';
        if (!selectedType) newErrors.typeId = 'Tip bilgisi zorunludur';
        if (!selectedBrand) newErrors.brandId = 'Marka bilgisi zorunludur';
        if (!selectedModel) newErrors.modelId = 'Model bilgisi zorunludur';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setInvoiceFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        if (!validateForm()) return;

        try {
            let invoicePath = formData.invoiceAttachmentPath;
            if (invoiceFile) {
                const uploadResponse = await uploadInvoice(invoiceFile);
                invoicePath = uploadResponse.data.filePath;
            }

            // Log complete form data for debugging
            console.log('Current form data before submission:', formData);

            const dto = {
                barcode: formData.barcode,
                serialNumber: formData.serialNumber,
                familyId: selectedFamily?.id,
                typeId: selectedType?.id,
                brandId: selectedBrand?.id,
                modelId: selectedModel?.id,
                location: formData.location || '',
                purchasePrice: formData.purchasePrice || 0,
                purchaseCurrency: formData.purchaseCurrency || 1, // Default to 1 (TRY) if not set
                status: parseInt(formData.status, 10),
                room: formData.room || '',
                floor: formData.floor || '',
                block: formData.block || '',
                department: formData.department || '',
                warrantyStartDate: formData.warrantyStartDate ? new Date(formData.warrantyStartDate).toISOString() : null,
                warrantyEndDate: formData.warrantyEndDate ? new Date(formData.warrantyEndDate).toISOString() : null,
                assignedUserId: selectedUser?.id || null,
                supportCompanyId: selectedCompany?.id || null,
                invoiceAttachmentPath: invoicePath
            };

            console.log('Sending update DTO:', dto);
            await updateInventory(id, dto);
            if (selectedUser?.id !== currentUser?.id) {
                setAssignDialogOpen(true);
            } else {
                navigate('/inventories');
            }
        } catch (err) {
            console.error('Error updating inventory', err);
            setSubmitError('Envanter güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleAssignUser = async () => {
        try {
            if (selectedUser?.id) {
                await assignUser(id, selectedUser.id, assignmentNotes);
                setAssignDialogOpen(false);
                navigate('/inventories');
            }
        } catch (err) {
            console.error('Error assigning user', err);
            setSubmitError('Kullanıcı atanırken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    // This useEffect ensures the model is properly selected when the models array changes
    useEffect(() => {
        // If we have a selected model ID but no selected model object, try to find it in the models array
        if (formData.modelId && !selectedModel && models.length > 0) {
            const model = models.find(m => m.id === formData.modelId);
            if (model) {
                setSelectedModel(model);
            } else if (formData.modelName) {
                // If we can't find the model in the array but have a name, create a model object
                const modelFromFormData = {
                    id: formData.modelId,
                    name: formData.modelName
                };
                setSelectedModel(modelFromFormData);
            }
        }
    }, [models, formData.modelId, formData.modelName, selectedModel]);

    return (
        <Box component={Paper} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Envanter Düzenle
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                </Alert>
            )}

            {/* Current Assignment Info */}
            {currentUser && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Mevcut Atama
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography>
                            Şu anda atanan kullanıcı: <strong>{currentUser.email}</strong>
                        </Typography>
                    </Paper>
                </Box>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '100%' }}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Temel Bilgiler</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Barkod"
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
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Ürün Detayları</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    options={families || []}
                                    getOptionLabel={(family) => family?.name || ''}
                                    value={selectedFamily}
                                    onChange={(event, newValue) => setSelectedFamily(newValue)}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Aile"
                                            required
                                            error={!!errors.familyId}
                                            helperText={errors.familyId}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    options={types || []}
                                    getOptionLabel={(type) => type?.name || ''}
                                    value={selectedType}
                                    onChange={(event, newValue) => setSelectedType(newValue)}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Tip"
                                            required
                                            error={!!errors.typeId}
                                            helperText={errors.typeId}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    options={brands || []}
                                    getOptionLabel={(brand) => brand?.name || ''}
                                    value={selectedBrand}
                                    onChange={(event, newValue) => {
                                        setSelectedBrand(newValue);
                                        setSelectedModel(null); // Reset model when brand changes
                                    }}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Marka"
                                            required
                                            error={!!errors.brandId}
                                            helperText={errors.brandId}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    options={models || []}
                                    getOptionLabel={(model) => model?.name || ''}
                                    value={selectedModel}
                                    onChange={(event, newValue) => {
                                        setSelectedModel(newValue);
                                    }}
                                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                    disabled={!selectedBrand}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Model"
                                            required
                                            error={!!errors.modelId}
                                            helperText={errors.modelId || (!selectedBrand ? 'Önce marka seçiniz' : '')}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Location Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Konum Bilgileri</Typography>
                        <Grid container spacing={2}>
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
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Oda"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Kat"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Blok"
                                    name="block"
                                    value={formData.block}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Warranty Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Garanti Bilgileri</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Garanti Bitiş Tarihi"
                                    name="warrantyEndDate"
                                    value={formData.warrantyEndDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Purchase Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Satın Alma Bilgileri</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Satın Alma Fiyatı"
                                    name="purchasePrice"
                                    type="number"
                                    value={formData.purchasePrice || ''}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Para Birimi"
                                    name="purchaseCurrency"
                                    value={formData.purchaseCurrency || 1}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                >
                                    {CURRENCY_OPTIONS.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Invoice */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Fatura Bilgileri</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {formData.invoiceAttachmentPath && (
                                        <Typography variant="body2" color="text.secondary">
                                            Mevcut fatura: {formData.invoiceAttachmentPath}
                                        </Typography>
                                    )}
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{ mt: 1, width: 'fit-content' }}
                                    >
                                        {formData.invoiceAttachmentPath ? 'Faturayı Değiştir' : 'Fatura Yükle'}
                                        <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                    {invoiceFile && (
                                        <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                                            Seçilen dosya: {invoiceFile.name}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Assignment */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Atama</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={users}
                                    getOptionLabel={(user) => user.email || ''}
                                    value={selectedUser}
                                    onChange={(event, newValue) => setSelectedUser(newValue)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Atanan Kullanıcı"
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={companies}
                                    getOptionLabel={(company) => company.name || ''}
                                    value={selectedCompany}
                                    onChange={(event, newValue) => setSelectedCompany(newValue)}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Destek Şirketi"
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                            <Button 
                                type="submit" 
                                variant="contained"
                                color="primary"
                            >
                                Envanteri Güncelle
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate('/inventories')}
                            >
                                İptal
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* User Assignment Dialog */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>Kullanıcı Ataması</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Bu öğeyi şu kullanıcıya atamak üzeresiniz: <strong>{selectedUser?.email}</strong>
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Atama Notları"
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleAssignUser} color="primary" variant="contained">
                        Atamayı Onayla
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditInventoryPage;
