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
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/DepartmentService';

function DepartmentsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [departmentForm, setDepartmentForm] = useState({
        name: ''
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await getDepartments();
            setDepartments(response.data);
            setError('');
        } catch (err) {
            setError('Departmanlar yüklenirken bir hata oluştu');
            console.error('Error fetching departments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedDepartment(null);
        setDepartmentForm({ name: '' });
    };

    const handleSubmit = async () => {
        try {
            if (selectedDepartment) {
                await updateDepartment(selectedDepartment.id, departmentForm);
                setSuccess('Departman başarıyla güncellendi');
            } else {
                await createDepartment(departmentForm);
                setSuccess('Departman başarıyla oluşturuldu');
            }
            handleDialogClose();
            fetchDepartments();
        } catch (err) {
            setError('Departman kaydedilirken bir hata oluştu');
            console.error('Error saving department:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu departmanı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteDepartment(id);
                setSuccess('Departman başarıyla silindi');
                fetchDepartments();
            } catch (err) {
                setError('Departman silinirken bir hata oluştu');
                console.error('Error deleting department:', err);
            }
        }
    };

    const filteredDepartments = departments.filter(department =>
        department.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    onClick={() => navigate('/admin')}
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
                        Departman Yönetimi
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedDepartment(null);
                            setDepartmentForm({ name: '' });
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
                        Yeni Departman
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Departman ara..."
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
                                <TableCell>Departman Adı</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDepartments
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((department) => (
                                    <TableRow key={department.id}>
                                        <TableCell>{department.name}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedDepartment(department);
                                                        setDepartmentForm({ name: department.name });
                                                        setDialogOpen(true);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton
                                                    onClick={() => handleDelete(department.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredDepartments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        {loading ? 'Yükleniyor...' : 'Departman bulunamadı'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredDepartments.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                />

                {/* Department Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {selectedDepartment ? 'Departmanı Düzenle' : 'Yeni Departman'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Departman Adı"
                            fullWidth
                            value={departmentForm.name}
                            onChange={(e) => setDepartmentForm({ name: e.target.value })}
                            required
                            error={!departmentForm.name.trim()}
                            helperText={!departmentForm.name.trim() ? 'Departman adı gereklidir' : ''}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>İptal</Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={!departmentForm.name.trim()}
                        >
                            {selectedDepartment ? 'Güncelle' : 'Kaydet'}
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

export default DepartmentsPage; 