import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
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
    Chip,
    Autocomplete,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { getProblemTypes, createProblemType, updateProblemType, deleteProblemType } from '../../api/ProblemTypeService';
import { getDepartments } from '../../api/DepartmentService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function ProblemTypesPage() {
    const [problemTypes, setProblemTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProblemType, setSelectedProblemType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        departmentId: '',
        isActive: true
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminRole();
        fetchData();
    }, []);

    const checkAdminRole = () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = jwtDecode(token);
                if (!decodedToken.role || decodedToken.role !== 'Admin') {
                    navigate('/');
                }
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            navigate('/login');
        }
    };

    const fetchData = async () => {
        try {
            const [problemTypesResponse, departmentsResponse] = await Promise.all([
                getProblemTypes(),
                getDepartments()
            ]);
            setProblemTypes(problemTypesResponse.data);
            setDepartments(departmentsResponse.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch data');
            console.error('Error fetching data:', err);
        }
    };

    const handleOpenDialog = (problemType = null) => {
        if (problemType) {
            setSelectedProblemType(problemType);
            setFormData({
                name: problemType.name,
                departmentId: problemType.departmentId,
                isActive: problemType.isActive
            });
        } else {
            setSelectedProblemType(null);
            setFormData({
                name: '',
                departmentId: '',
                isActive: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProblemType(null);
        setFormData({
            name: '',
            departmentId: '',
            isActive: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedProblemType) {
                await updateProblemType(selectedProblemType.id, formData);
            } else {
                await createProblemType(formData);
            }
            fetchData();
            handleCloseDialog();
            setError('');
        } catch (err) {
            setError('Failed to save problem type');
            console.error('Error saving problem type:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this problem type?')) {
            try {
                await deleteProblemType(id);
                fetchData();
                setError('');
            } catch (err) {
                setError('Failed to delete problem type');
                console.error('Error deleting problem type:', err);
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Problem Types
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Problem Type
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {problemTypes.map((problemType) => (
                            <TableRow key={problemType.id}>
                                <TableCell>{problemType.name}</TableCell>
                                <TableCell>{problemType.departmentName}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={problemType.isActive ? 'Active' : 'Inactive'}
                                        color={problemType.isActive ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOpenDialog(problemType)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleDelete(problemType.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {problemTypes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No problem types found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedProblemType ? 'Edit Problem Type' : 'Add Problem Type'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Autocomplete
                            options={departments}
                            getOptionLabel={(department) => department.name}
                            value={departments.find(dept => dept.id === formData.departmentId) || null}
                            onChange={(event, newValue) => {
                                setFormData({ ...formData, departmentId: newValue?.id || '' });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Department"
                                    required
                                    sx={{ mb: 2 }}
                                />
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedProblemType ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ProblemTypesPage; 