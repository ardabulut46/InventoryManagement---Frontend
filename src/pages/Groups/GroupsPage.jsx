import React, { useState, useEffect } from 'react';
import {
    Box,
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
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../../api/GroupService';
import { getDepartments } from '../../api/DepartmentService';

function GroupsPage() {
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

    useEffect(() => {
        fetchGroups();
        fetchDepartments();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await getGroups();
            setGroups(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching groups:', err);
            setError('Failed to fetch groups');
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Failed to fetch departments');
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
            setError('Please fill in all required fields');
            return;
        }

        try {
            if (selectedGroup) {
                await updateGroup(selectedGroup.id, {
                    id: selectedGroup.id,
                    ...formData
                });
                setSuccess('Group updated successfully');
            } else {
                await createGroup(formData);
                setSuccess('Group created successfully');
            }
            fetchGroups();
            handleCloseDialog();
        } catch (err) {
            console.error('Error saving group:', err);
            setError('Failed to save group');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await deleteGroup(id);
                setSuccess('Group deleted successfully');
                fetchGroups();
            } catch (err) {
                console.error('Error deleting group:', err);
                setError('Failed to delete group');
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

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Groups
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Group
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell>{group.name}</TableCell>
                                    <TableCell>
                                        {departments.find(d => d.id === group.departmentId)?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(group)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(group.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {groups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No groups found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
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
                            {selectedGroup ? 'Edit Group' : 'Create Group'}
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
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                required
                            />
                            <Autocomplete
                                options={departments}
                                getOptionLabel={(department) => department.name}
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Department"
                                        required
                                    />
                                )}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {selectedGroup ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

export default GroupsPage; 