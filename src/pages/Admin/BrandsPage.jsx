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
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BrandService from '../../api/BrandService';

function BrandsPage() {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        isActive: true
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await BrandService.getAllBrands();
            setBrands(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching brands:', err);
            setError('Markalar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateDialog = () => {
        setFormData({
            name: '',
            isActive: true
        });
        setDialogMode('create');
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (brand) => {
        setSelectedBrand(brand);
        setFormData({
            name: brand.name,
            isActive: brand.isActive
        });
        setDialogMode('edit');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedBrand(null);
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
            if (dialogMode === 'create') {
                await BrandService.createBrand(formData);
                setSuccessMessage('Marka başarıyla oluşturuldu');
            } else {
                await BrandService.updateBrand(selectedBrand.id, formData);
                setSuccessMessage('Marka başarıyla güncellendi');
            }
            handleCloseDialog();
            fetchBrands();
        } catch (err) {
            console.error('Error saving brand:', err);
            setError('Marka kaydedilirken bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
            try {
                await BrandService.deleteBrand(id);
                setSuccessMessage('Marka başarıyla silindi');
                fetchBrands();
            } catch (err) {
                console.error('Error deleting brand:', err);
                setError('Marka silinirken bir hata oluştu');
            }
        }
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
                            background: 'linear-gradient(45deg, #ed6c02, #ffb74d)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Markalar
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                    >
                        Yeni Marka Ekle
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
                                    <TableCell>Marka Adı</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {brands.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Kayıtlı marka bulunamadı
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    brands.map((brand) => (
                                        <TableRow key={brand.id}>
                                            <TableCell>{brand.id}</TableCell>
                                            <TableCell>{brand.name}</TableCell>
                                            <TableCell>
                                                {brand.isActive ? (
                                                    <Typography color="success.main">Aktif</Typography>
                                                ) : (
                                                    <Typography color="error.main">Pasif</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton 
                                                        color="primary" 
                                                        onClick={() => handleOpenEditDialog(brand)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton 
                                                        color="error" 
                                                        onClick={() => handleDelete(brand.id)}
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
                        {dialogMode === 'create' ? 'Yeni Marka Ekle' : 'Markayı Düzenle'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Marka Adı"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleInputChange}
                            sx={{ mb: 2, mt: 1 }}
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
                            disabled={!formData.name.trim()}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default BrandsPage; 