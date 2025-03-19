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
    Snackbar,
    useTheme,
    Tooltip,
    TablePagination,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CancelReasonService from '../../../api/CancelReasonService';

function CancelReasonsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [cancelReasons, setCancelReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCancelReason, setSelectedCancelReason] = useState(null);
    const [cancelReasonForm, setCancelReasonForm] = useState({
        name: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await CancelReasonService.getAllCancelReasons();
            setCancelReasons(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching cancel reasons:', err);
            setError('İptal etme sebepleri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (cancelReason = null) => {
        if (cancelReason) {
            setSelectedCancelReason(cancelReason);
            setCancelReasonForm({
                name: cancelReason.name,
                isActive: cancelReason.isActive
            });
        } else {
            setSelectedCancelReason(null);
            setCancelReasonForm({
                name: '',
                isActive: true
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedCancelReason(null);
    };

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;
        setCancelReasonForm({
            ...cancelReasonForm,
            [name]: name === 'isActive' ? checked : value
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedCancelReason) {
                // Update existing cancel reason
                await CancelReasonService.updateCancelReason(selectedCancelReason.id, cancelReasonForm);
                setSuccess('İptal etme sebebi başarıyla güncellendi');
            } else {
                // Create new cancel reason
                await CancelReasonService.createCancelReason(cancelReasonForm);
                setSuccess('İptal etme sebebi başarıyla oluşturuldu');
            }
            handleCloseDialog();
            fetchData();
        } catch (err) {
            console.error('Error saving cancel reason:', err);
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('İptal etme sebebi kaydedilirken bir hata oluştu');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu iptal etme sebebini silmek istediğinizden emin misiniz?')) {
            try {
                const response = await CancelReasonService.deleteCancelReason(id);
                if (response.data && response.data.message) {
                    setSuccess(response.data.message);
                } else {
                    setSuccess('İptal etme sebebi başarıyla silindi');
                }
                fetchData();
            } catch (err) {
                console.error('Error deleting cancel reason:', err);
                setError('İptal etme sebebi silinirken bir hata oluştu');
            }
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredCancelReasons = cancelReasons.filter(
        (cancelReason) => cancelReason.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedCancelReasons = filteredCancelReasons.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Button
                    onClick={() => navigate('/admin/ticket-settings')}
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
                            background: 'linear-gradient(45deg, #795548, #a1887f)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        İptal Etme Sebepleri
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Yeni Ekle
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess('')}
                    message={success}
                />

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="İptal etme sebebi ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Ad</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedCancelReasons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        {searchQuery ? 'Arama kriterlerine uygun iptal etme sebebi bulunamadı' : 'Henüz iptal etme sebebi eklenmemiş'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedCancelReasons.map((cancelReason) => (
                                    <TableRow key={cancelReason.id}>
                                        <TableCell>{cancelReason.id}</TableCell>
                                        <TableCell>{cancelReason.name}</TableCell>
                                        <TableCell>
                                            {cancelReason.isActive ? (
                                                <Typography sx={{ color: 'success.main' }}>Aktif</Typography>
                                            ) : (
                                                <Typography sx={{ color: 'error.main' }}>Pasif</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(cancelReason)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(cancelReason.id)}
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

                <TablePagination
                    component="div"
                    count={filteredCancelReasons.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Sayfa başına satır:"
                />

                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedCancelReason ? 'İptal Etme Sebebi Düzenle' : 'Yeni İptal Etme Sebebi Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="İptal Etme Sebebi Adı"
                            type="text"
                            fullWidth
                            value={cancelReasonForm.name}
                            onChange={handleInputChange}
                            sx={{ mb: 3, mt: 1 }}
                        />
                        {selectedCancelReason && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={cancelReasonForm.isActive}
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
                            color="primary"
                            variant="contained"
                            disabled={!cancelReasonForm.name.trim()}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default CancelReasonsPage; 