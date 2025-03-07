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
import InventoryTypeService from '../../api/InventoryTypeService';

function InventoryTypesPage() {
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        isActive: true
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            setLoading(true);
            const response = await InventoryTypeService.getAllTypes();
            setTypes(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching inventory types:', err);
            setError('Envanter tipleri yüklenirken bir hata oluştu');
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

    const handleOpenEditDialog = (type) => {
        setSelectedType(type);
        setFormData({
            name: type.name,
            isActive: type.isActive
        });
        setDialogMode('edit');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedType(null);
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
                await InventoryTypeService.createType(formData);
                setSuccessMessage('Envanter tipi başarıyla oluşturuldu');
            } else {
                await InventoryTypeService.updateType(selectedType.id, formData);
                setSuccessMessage('Envanter tipi başarıyla güncellendi');
            }
            handleCloseDialog();
            fetchTypes();
        } catch (err) {
            console.error('Error saving inventory type:', err);
            setError('Envanter tipi kaydedilirken bir hata oluştu');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu envanter tipini silmek istediğinizden emin misiniz?')) {
            try {
                await InventoryTypeService.deleteType(id);
                setSuccessMessage('Envanter tipi başarıyla silindi');
                fetchTypes();
            } catch (err) {
                console.error('Error deleting inventory type:', err);
                setError('Envanter tipi silinirken bir hata oluştu');
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
                            background: 'linear-gradient(45deg, #2e7d32, #81c784)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Envanter Tipleri
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                    >
                        Yeni Tip Ekle
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
                                    <TableCell>Tip Adı</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {types.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            Kayıtlı envanter tipi bulunamadı
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    types.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell>{type.id}</TableCell>
                                            <TableCell>{type.name}</TableCell>
                                            <TableCell>
                                                {type.isActive ? (
                                                    <Typography color="success.main">Aktif</Typography>
                                                ) : (
                                                    <Typography color="error.main">Pasif</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton 
                                                        color="primary" 
                                                        onClick={() => handleOpenEditDialog(type)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton 
                                                        color="error" 
                                                        onClick={() => handleDelete(type.id)}
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
                        {dialogMode === 'create' ? 'Yeni Envanter Tipi Ekle' : 'Envanter Tipini Düzenle'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Tip Adı"
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

export default InventoryTypesPage; 