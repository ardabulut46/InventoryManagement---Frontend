import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ModelService from '../../api/ModelService';
import BrandService from '../../api/BrandService';

function ModelsPage() {
    const navigate = useNavigate();
    const [models, setModels] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [selectedModel, setSelectedModel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        brandId: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [modelsResponse, brandsResponse] = await Promise.all([
                ModelService.getAllModels(),
                BrandService.getActiveBrands()
            ]);
            setModels(modelsResponse.data);
            setBrands(brandsResponse.data);
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setFormData({
            name: '',
            brandId: '',
            isActive: true
        });
        setDialogMode('create');
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (model) => {
        setSelectedModel(model);
        setFormData({
            name: model.name,
            brandId: model.brandId,
            isActive: model.isActive
        });
        setDialogMode('edit');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedModel(null);
    };

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'isActive' ? checked : value
        });
    };

    const handleSubmit = async () => {
        try {
            // Get the brand name for the selected brandId
            const selectedBrand = brands.find(b => b.id === formData.brandId);
            const brandName = selectedBrand ? selectedBrand.name : '';
            
            // Create the request data with brandName included
            const modelData = {
                ...formData,
                brandName
            };
            
            if (dialogMode === 'create') {
                await ModelService.createModel(modelData);
                setSuccessMessage('Model başarıyla oluşturuldu');
            } else {
                await ModelService.updateModel(selectedModel.id, modelData);
                setSuccessMessage('Model başarıyla güncellendi');
            }
            handleCloseDialog();
            fetchData();
        } catch (err) {
            console.error('Error saving model:', err);
            setError('Model kaydedilirken bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu modeli silmek istediğinizden emin misiniz?')) {
            try {
                await ModelService.deleteModel(id);
                setSuccessMessage('Model başarıyla silindi');
                fetchData();
            } catch (err) {
                console.error('Error deleting model:', err);
                setError('Model silinirken bir hata oluştu');
            }
        }
    };

    const getBrandName = (brandId) => {
        const brand = brands.find(b => b.id === brandId);
        return brand ? brand.name : 'Bilinmeyen Marka';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Button
                    onClick={() => navigate('/admin/inventory-settings')}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        mb: 3,
                        color: 'text.secondary',
                        '&:hover': {
                            bgcolor: 'grey.100',
                        }
                    }}
                >
                    Geri
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #9c27b0, #ce93d8)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Modeller
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                    >
                        Yeni Model Ekle
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Model Adı</TableCell>
                                    <TableCell>Marka</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {models.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Kayıtlı model bulunamadı
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    models.map((model) => (
                                        <TableRow key={model.id}>
                                            <TableCell>{model.id}</TableCell>
                                            <TableCell>{model.name}</TableCell>
                                            <TableCell>{model.brand ? model.brand.name : getBrandName(model.brandId)}</TableCell>
                                            <TableCell>
                                                {model.isActive ? (
                                                    <Typography color="success.main">Aktif</Typography>
                                                ) : (
                                                    <Typography color="error.main">Pasif</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton 
                                                        color="primary" 
                                                        onClick={() => handleOpenEditDialog(model)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton 
                                                        color="error" 
                                                        onClick={() => handleDelete(model.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Create/Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {dialogMode === 'create' ? 'Yeni Model Ekle' : 'Modeli Düzenle'}
                    </DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth margin="dense" sx={{ mb: 2, mt: 1 }}>
                            <InputLabel id="brand-select-label">Marka</InputLabel>
                            <Select
                                labelId="brand-select-label"
                                id="brand-select"
                                name="brandId"
                                value={formData.brandId}
                                label="Marka"
                                onChange={handleInputChange}
                                required
                            >
                                {brands.map((brand) => (
                                    <MenuItem key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            name="name"
                            label="Model Adı"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleInputChange}
                            sx={{ mb: 2 }}
                        />
                        {dialogMode === 'edit' && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        name="isActive"
                                        color="primary"
                                    />
                                }
                                label="Aktif"
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="inherit">
                            İptal
                        </Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained" 
                            color="primary"
                            disabled={!formData.name.trim() || !formData.brandId}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default ModelsPage; 