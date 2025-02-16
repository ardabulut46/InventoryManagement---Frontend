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
import { getProblemTypes, createProblemType, updateProblemType, deleteProblemType } from '../../api/ProblemTypeService';
import { getGroups } from '../../api/GroupService';

function ProblemTypesPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [problemTypes, setProblemTypes] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProblemType, setSelectedProblemType] = useState(null);
    const [problemTypeForm, setProblemTypeForm] = useState({
        name: '',
        groupId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [problemTypesRes, groupsRes] = await Promise.all([
                getProblemTypes(),
                getGroups()
            ]);
            setProblemTypes(problemTypesRes.data);
            setGroups(groupsRes.data);
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
        setSelectedProblemType(null);
        setProblemTypeForm({
            name: '',
            groupId: ''
        });
    };

    const handleSubmit = async () => {
        try {
            if (selectedProblemType) {
                await updateProblemType(selectedProblemType.id, problemTypeForm);
                setSuccess('Problem tipi başarıyla güncellendi');
            } else {
                await createProblemType(problemTypeForm);
                setSuccess('Problem tipi başarıyla oluşturuldu');
            }
            handleDialogClose();
            fetchData();
        } catch (err) {
            setError('Problem tipi kaydedilemedi');
            console.error('Error saving problem type:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu problem tipini silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProblemType(id);
                setSuccess('Problem tipi başarıyla silindi');
                fetchData();
            } catch (err) {
                setError('Problem tipi silinemedi');
                console.error('Error deleting problem type:', err);
            }
        }
    };

    const filteredProblemTypes = problemTypes.filter(problemType =>
        problemType.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        groups.find(g => g.id === problemType.groupId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        Problem Tipleri
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setSelectedProblemType(null);
                            setProblemTypeForm({
                                name: '',
                                groupId: ''
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
                        Yeni Problem Tipi
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Problem tipi veya grup ara..."
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
                                <TableCell>Grup</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProblemTypes
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((problemType) => {
                                    const group = groups.find(g => g.id === problemType.groupId);
                                    return (
                                        <TableRow key={problemType.id}>
                                            <TableCell>{problemType.name}</TableCell>
                                            <TableCell>{group?.name || '-'}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Düzenle">
                                                    <IconButton
                                                        onClick={() => {
                                                            setSelectedProblemType(problemType);
                                                            setProblemTypeForm({
                                                                name: problemType.name,
                                                                groupId: problemType.groupId
                                                            });
                                                            setDialogOpen(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        onClick={() => handleDelete(problemType.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            {filteredProblemTypes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        {loading ? 'Yükleniyor...' : 'Problem tipi bulunamadı'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredProblemTypes.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                />

                {/* Problem Type Dialog */}
                <Dialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {selectedProblemType ? 'Problem Tipini Düzenle' : 'Yeni Problem Tipi'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <TextField
                                label="Problem Tipi Adı"
                                value={problemTypeForm.name}
                                onChange={(e) => setProblemTypeForm(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                fullWidth
                                required
                            />
                            <FormControl fullWidth>
                                <InputLabel>Grup</InputLabel>
                                <Select
                                    value={problemTypeForm.groupId}
                                    onChange={(e) => setProblemTypeForm(prev => ({
                                        ...prev,
                                        groupId: e.target.value
                                    }))}
                                    label="Grup"
                                >
                                    {groups.map(group => (
                                        <MenuItem key={group.id} value={group.id}>
                                            {group.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose}>İptal</Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={!problemTypeForm.name.trim() || !problemTypeForm.groupId}
                        >
                            {selectedProblemType ? 'Güncelle' : 'Kaydet'}
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

export default ProblemTypesPage; 