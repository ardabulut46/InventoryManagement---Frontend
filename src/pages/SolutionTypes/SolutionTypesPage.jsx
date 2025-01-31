import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Switch,
    Container,
    useTheme,
    FormControlLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import SolutionTypeService from '../../api/SolutionTypeService';

function SolutionTypesPage() {
    const theme = useTheme();
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSolutionType, setSelectedSolutionType] = useState(null);
    const [formData, setFormData] = useState({ name: '', isActive: true });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSolutionTypes();
    }, []);

    const fetchSolutionTypes = async () => {
        try {
            const response = await SolutionTypeService.getSolutionTypes();
            setSolutionTypes(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch solution types.');
        }
    };

    const handleOpenDialog = (solutionType = null) => {
        if (solutionType) {
            setSelectedSolutionType(solutionType);
            setFormData({ name: solutionType.name, isActive: solutionType.isActive });
        } else {
            setSelectedSolutionType(null);
            setFormData({ name: '', isActive: true });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSolutionType(null);
        setFormData({ name: '', isActive: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedSolutionType) {
                await SolutionTypeService.updateSolutionType(selectedSolutionType.id, {
                    ...selectedSolutionType,
                    ...formData
                });
            } else {
                await SolutionTypeService.createSolutionType(formData);
            }
            fetchSolutionTypes();
            handleCloseDialog();
        } catch (err) {
            setError(selectedSolutionType 
                ? 'Failed to update solution type.' 
                : 'Failed to create solution type.'
            );
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 24px rgba(0,0,0,0.2)' 
                        : '0 4px 24px rgba(0,0,0,0.05)',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Solution Types
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                            }
                        }}
                    >
                        Add Solution Type
                    </Button>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                color: 'error.main'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <TableContainer sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {solutionTypes.map((solutionType) => (
                                <TableRow key={solutionType.id}>
                                    <TableCell>{solutionType.name}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={solutionType.isActive}
                                            onChange={async () => {
                                                try {
                                                    await SolutionTypeService.updateSolutionType(solutionType.id, {
                                                        ...solutionType,
                                                        isActive: !solutionType.isActive
                                                    });
                                                    fetchSolutionTypes();
                                                } catch (err) {
                                                    setError('Failed to update solution type status.');
                                                }
                                            }}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleOpenDialog(solutionType)}
                                            color="primary"
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'primary.50',
                                                '&:hover': {
                                                    bgcolor: 'primary.100',
                                                }
                                            }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {solutionTypes.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={3} 
                                        align="center"
                                        sx={{ 
                                            py: 4,
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No solution types found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Create/Edit Dialog */}
                <Dialog 
                    open={openDialog} 
                    onClose={handleCloseDialog}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6">
                                {selectedSolutionType ? 'Edit Solution Type' : 'Add Solution Type'}
                            </Typography>
                            <IconButton onClick={handleCloseDialog} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent sx={{ minWidth: 400 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                sx={{ mb: 2 }}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        color="primary"
                                    />
                                }
                                label="Active"
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5 }}>
                            <Button 
                                onClick={handleCloseDialog}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                variant="contained"
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                }}
                            >
                                {selectedSolutionType ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default SolutionTypesPage; 