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
import SolutionTypeService from '../../api/SolutionTypeService';

function SolutionTypesPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSolutionType, setSelectedSolutionType] = useState(null);
    const [solutionTypeForm, setSolutionTypeForm] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await SolutionTypeService.getSolutionTypes();
            setSolutionTypes(response.data);
            setError('');
        } catch (err) {
            setError('Veriler yüklenirken bir hata oluştu');
            console.error('Error fetching solution types:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedSolutionType(null);
        setSolutionTypeForm({
            name: '',
            description: ''
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedSolutionType) {
                await SolutionTypeService.updateSolutionType(selectedSolutionType.id, solutionTypeForm);
                setSuccess('Çözüm tipi başarıyla güncellendi');
            } else {
                await SolutionTypeService.createSolutionType(solutionTypeForm);
                setSuccess('Çözüm tipi başarıyla oluşturuldu');
            }
            handleDialogClose();
            fetchData();
        } catch (err) {
            setError('Çözüm tipi kaydedilemedi');
            console.error('Error saving solution type:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu çözüm tipini silmek istediğinizden emin misiniz?')) {
            try {
                await SolutionTypeService.deleteSolutionType(id);
                setSuccess('Çözüm tipi başarıyla silindi');
                fetchData();
            } catch (err) {
                setError('Çözüm tipi silinemedi');
                console.error('Error deleting solution type:', err);
            }
        }
    };

    const filteredSolutionTypes = solutionTypes.filter(solutionType =>
        solutionType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        solutionType.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
                    <Typography variant="h4" sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}>
                        Çözüm Tipleri
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedSolutionType(null);
                            setSolutionTypeForm({
                                name: '',
                                description: ''
                            });
                            setDialogOpen(true);
                        }}
                        sx={{
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                            }
                        }}
                    >
                        Yeni Çözüm Tipi
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Çözüm tipi ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ maxWidth: 500 }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Çözüm Tipi</TableCell>
                                <TableCell>Açıklama</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSolutionTypes
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((solutionType) => (
                                    <TableRow key={solutionType.id}>
                                        <TableCell>{solutionType.name}</TableCell>
                                        <TableCell>{solutionType.description}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedSolutionType(solutionType);
                                                        setSolutionTypeForm({
                                                            name: solutionType.name,
                                                            description: solutionType.description
                                                        });
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton
                                                    onClick={() => handleDelete(solutionType.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredSolutionTypes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        {loading ? 'Yükleniyor...' : 'Çözüm tipi bulunamadı'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredSolutionTypes.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                />

                {/* Solution Type Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {selectedSolutionType ? 'Çözüm Tipini Düzenle' : 'Yeni Çözüm Tipi'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <TextField
                                label="Çözüm Tipi Adı"
                                value={solutionTypeForm.name}
                                onChange={(e) => setSolutionTypeForm(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Açıklama"
                                value={solutionTypeForm.description}
                                onChange={(e) => setSolutionTypeForm(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>İptal</Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={!solutionTypeForm.name.trim()}
                        >
                            {selectedSolutionType ? 'Güncelle' : 'Kaydet'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for success/error messages */}
                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
                        {success}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError('')}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                </Snackbar>
            </Paper>
        </Container>
    );
}

export default SolutionTypesPage; 