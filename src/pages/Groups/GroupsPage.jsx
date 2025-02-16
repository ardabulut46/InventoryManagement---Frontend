import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Autocomplete,
    Snackbar,
    Tooltip,
    TablePagination,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../../api/GroupService';
import { getDepartments } from '../../api/DepartmentService';

function GroupsPage() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        departmentId: null,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroups();
        fetchDepartments();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await getGroups();
            setGroups(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Gruplar yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Departmanlar yüklenirken bir hata oluştu');
        }
    };

    const handleOpenDialog = (group = null) => {
        if (group) {
            setSelectedGroup(group);
            setFormData({
                name: group.name,
                departmentId: group.departmentId,
            });
            setSelectedDepartment(departments.find(d => d.id === group.departmentId));
        } else {
            setSelectedGroup(null);
            setFormData({
                name: '',
                departmentId: null,
            });
            setSelectedDepartment(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedGroup(null);
        setFormData({
            name: '',
            departmentId: null,
        });
        setSelectedDepartment(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.departmentId) {
            setError('Lütfen tüm gerekli alanları doldurun');
            return;
        }

        try {
            if (selectedGroup) {
                await updateGroup(selectedGroup.id, {
                    id: selectedGroup.id,
                    ...formData
                });
                setSuccess('Grup başarıyla güncellendi');
            } else {
                await createGroup(formData);
                setSuccess('Grup başarıyla oluşturuldu');
            }
            fetchGroups();
            handleCloseDialog();
        } catch (err) {
            console.error('Error saving group:', err);
            setError('Grup kaydedilemedi');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu grubu silmek istediğinizden emin misiniz?')) {
            try {
                await deleteGroup(id);
                setSuccess('Grup başarıyla silindi');
                fetchGroups();
            } catch (err) {
                console.error('Error deleting group:', err);
                setError('Grup silinemedi');
            }
        }
    };

    const handleDepartmentChange = (event, newValue) => {
        setSelectedDepartment(newValue);
        setFormData(prev => ({
            ...prev,
            departmentId: newValue?.id || null
        }));
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        departments.find(d => d.id === group.departmentId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        Grup Yönetimi
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                            }
                        }}
                    >
                        Yeni Grup
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Grup veya departman ara..."
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
                                <TableCell>Grup Adı</TableCell>
                                <TableCell>Departman</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredGroups
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((group) => (
                                    <TableRow key={group.id}>
                                        <TableCell>{group.name}</TableCell>
                                        <TableCell>
                                            {departments.find(d => d.id === group.departmentId)?.name || '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Düzenle">
                                                <IconButton
                                                    onClick={() => handleOpenDialog(group)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Sil">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(group.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {filteredGroups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        {loading ? 'Yükleniyor...' : 'Grup bulunamadı'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredGroups.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                />
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">
                            {selectedGroup ? 'Grubu Düzenle' : 'Yeni Grup'}
                        </Typography>
                        <IconButton onClick={handleCloseDialog} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Grup Adı"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                required
                                error={!formData.name.trim()}
                                helperText={!formData.name.trim() ? 'Grup adı gereklidir' : ''}
                            />
                            <Autocomplete
                                options={departments}
                                getOptionLabel={(department) => department.name}
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Departman"
                                        required
                                        error={!formData.departmentId}
                                        helperText={!formData.departmentId ? 'Departman seçimi gereklidir' : ''}
                                    />
                                )}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, gap: 1 }}>
                        <Button 
                            onClick={handleCloseDialog}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                            }}
                        >
                            İptal
                        </Button>
                        <Button 
                            type="submit"
                            variant="contained"
                            disabled={!formData.name.trim() || !formData.departmentId}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3,
                                background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                                }
                            }}
                        >
                            {selectedGroup ? 'Güncelle' : 'Kaydet'}
                        </Button>
                    </DialogActions>
                </form>
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
        </Container>
    );
}

export default GroupsPage; 