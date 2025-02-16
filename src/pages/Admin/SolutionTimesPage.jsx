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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SolutionTimeService from '../../api/SolutionTimeService';
import { getProblemTypes } from '../../api/ProblemTypeService';

function SolutionTimesPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [solutionTimes, setSolutionTimes] = useState([]);
    const [problemTypes, setProblemTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSolutionTime, setSelectedSolutionTime] = useState(null);
    const [solutionTimeForm, setSolutionTimeForm] = useState({
        problemTypeId: '',
        hours: 0,
        minutes: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [solutionTimesRes, problemTypesRes] = await Promise.all([
                SolutionTimeService.getAllSolutionTimes(),
                getProblemTypes()
            ]);
            setSolutionTimes(solutionTimesRes.data);
            setProblemTypes(problemTypesRes.data);
            setError('');
        } catch (err) {
            setError('Veriler yüklenirken bir hata oluştu');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedSolutionTime(null);
        setSolutionTimeForm({
            problemTypeId: '',
            hours: 0,
            minutes: 0
        });
    };

    const handleSubmit = async () => {
        try {
            const timeToSolve = `${solutionTimeForm.hours.toString().padStart(2, '0')}:${solutionTimeForm.minutes.toString().padStart(2, '0')}:00`;
            
            if (selectedSolutionTime) {
                await SolutionTimeService.updateSolutionTime(selectedSolutionTime.id, {
                    ...solutionTimeForm,
                    timeToSolve
                });
                setSuccess('Çözüm süresi başarıyla güncellendi');
            } else {
                await SolutionTimeService.createSolutionTime({
                    ...solutionTimeForm,
                    timeToSolve
                });
                setSuccess('Çözüm süresi başarıyla oluşturuldu');
            }
            handleDialogClose();
            fetchData();
        } catch (err) {
            setError('Çözüm süresi kaydedilemedi');
            console.error('Error saving solution time:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu çözüm süresini silmek istediğinizden emin misiniz?')) {
            try {
                await SolutionTimeService.deleteSolutionTime(id);
                setSuccess('Çözüm süresi başarıyla silindi');
                fetchData();
            } catch (err) {
                setError('Çözüm süresi silinemedi');
                console.error('Error deleting solution time:', err);
            }
        }
    };

    const filteredSolutionTimes = solutionTimes.filter(solutionTime => {
        const problemType = problemTypes.find(pt => pt.id === solutionTime.problemTypeId);
        return problemType?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

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
                        Çözüm Süreleri
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedSolutionTime(null);
                            setSolutionTimeForm({
                                problemTypeId: '',
                                hours: 0,
                                minutes: 0
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
                        Yeni Çözüm Süresi
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Problem tipine göre ara..."
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
                                <TableCell>Problem Tipi</TableCell>
                                <TableCell>Çözüm Süresi</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSolutionTimes
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((solutionTime) => {
                                    const problemType = problemTypes.find(pt => pt.id === solutionTime.problemTypeId);
                                    const [hours, minutes] = solutionTime.timeToSolve.split(':');
                                    return (
                                        <TableRow key={solutionTime.id}>
                                            <TableCell>{problemType?.name || '-'}</TableCell>
                                            <TableCell>{`${hours} saat ${minutes} dakika`}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton
                                                        onClick={() => {
                                                            setSelectedSolutionTime(solutionTime);
                                                            setSolutionTimeForm({
                                                                problemTypeId: solutionTime.problemTypeId,
                                                                hours: parseInt(hours),
                                                                minutes: parseInt(minutes)
                                                            });
                                                            setDialogOpen(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        onClick={() => handleDelete(solutionTime.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            {filteredSolutionTimes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        {loading ? 'Yükleniyor...' : 'Çözüm süresi bulunamadı'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredSolutionTimes.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                />

                {/* Solution Time Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {selectedSolutionTime ? 'Çözüm Süresini Düzenle' : 'Yeni Çözüm Süresi'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Problem Tipi</InputLabel>
                                <Select
                                    value={solutionTimeForm.problemTypeId}
                                    onChange={(e) => setSolutionTimeForm(prev => ({
                                        ...prev,
                                        problemTypeId: e.target.value
                                    }))}
                                    label="Problem Tipi"
                                >
                                    {problemTypes.map(type => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Saat"
                                    type="number"
                                    value={solutionTimeForm.hours}
                                    onChange={(e) => setSolutionTimeForm(prev => ({
                                        ...prev,
                                        hours: parseInt(e.target.value)
                                    }))}
                                    inputProps={{ min: 0, max: 23 }}
                                    fullWidth
                                />
                                <TextField
                                    label="Dakika"
                                    type="number"
                                    value={solutionTimeForm.minutes}
                                    onChange={(e) => setSolutionTimeForm(prev => ({
                                        ...prev,
                                        minutes: parseInt(e.target.value)
                                    }))}
                                    inputProps={{ min: 0, max: 59 }}
                                    fullWidth
                                />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>İptal</Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={!solutionTimeForm.problemTypeId}
                        >
                            {selectedSolutionTime ? 'Güncelle' : 'Kaydet'}
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

export default SolutionTimesPage; 