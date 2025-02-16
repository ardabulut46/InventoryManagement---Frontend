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
import { getAssignmentTimes, createAssignmentTime, updateAssignmentTime, deleteAssignmentTime } from '../../api/AssignmentTimeService';
import { getProblemTypes } from '../../api/ProblemTypeService';

function AssignmentTimesPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [assignmentTimes, setAssignmentTimes] = useState([]);
    const [problemTypes, setProblemTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedAssignmentTime, setSelectedAssignmentTime] = useState(null);
    const [assignmentTimeForm, setAssignmentTimeForm] = useState({
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
            const [assignmentTimesRes, problemTypesRes] = await Promise.all([
                getAssignmentTimes(),
                getProblemTypes()
            ]);
            setAssignmentTimes(assignmentTimesRes.data);
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
        setSelectedAssignmentTime(null);
        setAssignmentTimeForm({
            problemTypeId: '',
            hours: 0,
            minutes: 0
        });
    };

    const handleSubmit = async () => {
        try {
            // Validate time span is not over 24 hours
            if (assignmentTimeForm.hours >= 24) {
                setError('Atama süresi 24 saat veya daha fazla olamaz. Lütfen 24 saatten az bir süre girin.');
                return;
            }

            const timeToAssign = `${assignmentTimeForm.hours.toString().padStart(2, '0')}:${assignmentTimeForm.minutes.toString().padStart(2, '0')}:00`;
            const submitData = {
                problemTypeId: assignmentTimeForm.problemTypeId,
                timeToAssign
            };

            if (selectedAssignmentTime) {
                await updateAssignmentTime(selectedAssignmentTime.id, submitData);
                setSuccess('Atama süresi başarıyla güncellendi');
            } else {
                await createAssignmentTime(submitData);
                setSuccess('Atama süresi başarıyla oluşturuldu');
            }
            handleDialogClose();
            fetchData();
        } catch (err) {
            if (err.response?.status === 400) {
                setError('Geçersiz zaman formatı. Lütfen 24 saatten az bir zaman girin.');
            } else {
                setError(err.message || 'Atama süresi kaydedilemedi');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu atama süresini silmek istediğinizden emin misiniz?')) {
            try {
                await deleteAssignmentTime(id);
                setSuccess('Atama süresi başarıyla silindi');
                fetchData();
            } catch (err) {
                setError('Atama süresi silinemedi');
                console.error('Error deleting assignment time:', err);
            }
        }
    };

    const filteredAssignmentTimes = assignmentTimes.filter(assignmentTime => {
        const problemType = problemTypes.find(pt => pt.id === assignmentTime.problemTypeId);
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
                        Atama Süreleri
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedAssignmentTime(null);
                            setAssignmentTimeForm({
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
                        Yeni Atama Süresi
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
                                <TableCell>Atama Süresi</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAssignmentTimes
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((assignmentTime) => {
                                    const problemType = problemTypes.find(pt => pt.id === assignmentTime.problemTypeId);
                                    const [hours, minutes] = assignmentTime.timeToAssign.split(':');
                                    return (
                                        <TableRow key={assignmentTime.id}>
                                            <TableCell>{problemType?.name || '-'}</TableCell>
                                            <TableCell>{`${hours} saat ${minutes} dakika`}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton
                                                        onClick={() => {
                                                            setSelectedAssignmentTime(assignmentTime);
                                                            setAssignmentTimeForm({
                                                                problemTypeId: assignmentTime.problemTypeId,
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
                                                        onClick={() => handleDelete(assignmentTime.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            {filteredAssignmentTimes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        {loading ? 'Yükleniyor...' : 'Atama süresi bulunamadı'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredAssignmentTimes.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                />

                {/* Assignment Time Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {selectedAssignmentTime ? 'Atama Süresini Düzenle' : 'Yeni Atama Süresi'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Problem Tipi</InputLabel>
                                <Select
                                    value={assignmentTimeForm.problemTypeId}
                                    onChange={(e) => setAssignmentTimeForm(prev => ({
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
                                    value={assignmentTimeForm.hours}
                                    onChange={(e) => setAssignmentTimeForm(prev => ({
                                        ...prev,
                                        hours: parseInt(e.target.value)
                                    }))}
                                    inputProps={{ min: 0, max: 23 }}
                                    fullWidth
                                />
                                <TextField
                                    label="Dakika"
                                    type="number"
                                    value={assignmentTimeForm.minutes}
                                    onChange={(e) => setAssignmentTimeForm(prev => ({
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
                            disabled={!assignmentTimeForm.problemTypeId}
                        >
                            {selectedAssignmentTime ? 'Güncelle' : 'Kaydet'}
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

export default AssignmentTimesPage; 