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
import DelayReasonService from '../../../api/DelayReasonService';

function DelayReasonsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [delayReasons, setDelayReasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDelayReason, setSelectedDelayReason] = useState(null);
    const [delayReasonForm, setDelayReasonForm] = useState({
        name: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await DelayReasonService.getAllDelayReasons();
            setDelayReasons(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching delay reasons:', err);
            setError('Gecikme sebepleri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (delayReason = null) => {
        if (delayReason) {
            setSelectedDelayReason(delayReason);
            setDelayReasonForm({
                name: delayReason.name,
                isActive: delayReason.isActive
            });
        } else {
            setSelectedDelayReason(null);
            setDelayReasonForm({
                name: '',
                isActive: true
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedDelayReason(null);
    };

    const handleInputChange = (e) => {
        const { name, value, checked } = e.target;
        setDelayReasonForm({
            ...delayReasonForm,
            [name]: name === 'isActive' ? checked : value
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedDelayReason) {
                // Update existing delay reason
                await DelayReasonService.updateDelayReason(selectedDelayReason.id, delayReasonForm);
                setSuccess('Gecikme sebebi başarıyla güncellendi');
            } else {
                // Create new delay reason
                await DelayReasonService.createDelayReason(delayReasonForm);
                setSuccess('Gecikme sebebi başarıyla oluşturuldu');
            }
            handleCloseDialog();
            fetchData();
        } catch (err) {
            console.error('Error saving delay reason:', err);
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError('Gecikme sebebi kaydedilirken bir hata oluştu');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu gecikme sebebini silmek istediğinizden emin misiniz?')) {
            try {
                const response = await DelayReasonService.deleteDelayReason(id);
                if (response.data && response.data.message) {
                    setSuccess(response.data.message);
                } else {
                    setSuccess('Gecikme sebebi başarıyla silindi');
                }
                fetchData();
            } catch (err) {
                console.error('Error deleting delay reason:', err);
                setError('Gecikme sebebi silinirken bir hata oluştu');
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

    const filteredDelayReasons = delayReasons.filter(
        (delayReason) => delayReason.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const paginatedDelayReasons = filteredDelayReasons.slice(
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
                            background: 'linear-gradient(45deg, #f44336, #ff7961)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Gecikme Sebepleri
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
                        placeholder="Gecikme sebebi ara..."
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
                            ) : paginatedDelayReasons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        {searchQuery ? 'Arama kriterlerine uygun gecikme sebebi bulunamadı' : 'Henüz gecikme sebebi eklenmemiş'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDelayReasons.map((delayReason) => (
                                    <TableRow key={delayReason.id}>
                                        <TableCell>{delayReason.id}</TableCell>
                                        <TableCell>{delayReason.name}</TableCell>
                                        <TableCell>
                                            {delayReason.isActive ? (
                                                <Typography sx={{ color: 'success.main' }}>Aktif</Typography>
                                            ) : (
                                                <Typography sx={{ color: 'error.main' }}>Pasif</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(delayReason)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(delayReason.id)}
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
                    count={filteredDelayReasons.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="Sayfa başına satır:"
                />

                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        {selectedDelayReason ? 'Gecikme Sebebi Düzenle' : 'Yeni Gecikme Sebebi Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Gecikme Sebebi Adı"
                            type="text"
                            fullWidth
                            value={delayReasonForm.name}
                            onChange={handleInputChange}
                            sx={{ mb: 3, mt: 1 }}
                        />
                        {selectedDelayReason && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={delayReasonForm.isActive}
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
                            disabled={!delayReasonForm.name.trim()}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default DelayReasonsPage; 