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
    Container,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import SolutionTimeService from '../../api/SolutionTimeService';
import { getProblemTypes } from '../../api/ProblemTypeService';

function SolutionTimesPage() {
    const theme = useTheme();
    const [solutionTimes, setSolutionTimes] = useState([]);
    const [problemTypes, setProblemTypes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedSolutionTime, setSelectedSolutionTime] = useState(null);
    const [formData, setFormData] = useState({
        problemTypeId: '',
        hours: 0,
        minutes: 0
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSolutionTimes();
        fetchProblemTypes();
    }, []);

    const fetchSolutionTimes = async () => {
        try {
            const response = await SolutionTimeService.getAllSolutionTimes();
            setSolutionTimes(response);
            setError('');
        } catch (err) {
            setError('Failed to fetch solution times.');
        }
    };

    const fetchProblemTypes = async () => {
        try {
            const response = await getProblemTypes();
            setProblemTypes(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch problem types.');
        }
    };

    const handleOpenDialog = (solutionTime = null) => {
        if (solutionTime) {
            const [hours, minutes] = solutionTime.timeToSolve.split(':').map(Number);
            setSelectedSolutionTime(solutionTime);
            setFormData({
                problemTypeId: solutionTime.problemTypeId,
                hours,
                minutes
            });
        } else {
            setSelectedSolutionTime(null);
            setFormData({
                problemTypeId: '',
                hours: 0,
                minutes: 0
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedSolutionTime(null);
        setFormData({
            problemTypeId: '',
            hours: 0,
            minutes: 0
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const timeToSolve = `${formData.hours.toString().padStart(2, '0')}:${formData.minutes.toString().padStart(2, '0')}:00`;
            const submitData = {
                problemTypeId: formData.problemTypeId,
                timeToSolve
            };

            if (selectedSolutionTime) {
                await SolutionTimeService.updateSolutionTime(selectedSolutionTime.id, submitData);
            } else {
                await SolutionTimeService.createSolutionTime(submitData);
            }
            fetchSolutionTimes();
            handleCloseDialog();
        } catch (err) {
            setError(selectedSolutionTime 
                ? 'Failed to update solution time.' 
                : 'Failed to create solution time.'
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
                        Çözüm Süreleri
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
                        Çözüm Süresi Ekle
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
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Problem Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Time to Solve</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {solutionTimes.map((solutionTime) => (
                                <TableRow key={solutionTime.id}>
                                    <TableCell>
                                        {problemTypes.find(t => t.id === solutionTime.problemTypeId)?.name || 'Unknown'}
                                    </TableCell>
                                    <TableCell>{`${solutionTime.timeToSolve.split(':')[0]}h ${solutionTime.timeToSolve.split(':')[1]}m`}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleOpenDialog(solutionTime)}
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
                            {solutionTimes.length === 0 && (
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
                                        No solution times found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

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
                                {selectedSolutionTime ? 'Edit Solution Time' : 'Add Solution Time'}
                            </Typography>
                            <IconButton onClick={handleCloseDialog} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent sx={{ minWidth: 400 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Problem Type</InputLabel>
                                <Select
                                    value={formData.problemTypeId}
                                    onChange={(e) => setFormData({ ...formData, problemTypeId: e.target.value })}
                                    label="Problem Type"
                                    required
                                >
                                    {problemTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Hours"
                                    type="number"
                                    value={formData.hours}
                                    onChange={(e) => setFormData({ ...formData, hours: Math.max(0, Math.min(23, parseInt(e.target.value) || 0)) })}
                                    required
                                    InputProps={{ inputProps: { min: 0, max: 23 } }}
                                    sx={{ flex: 1 }}
                                />
                                <TextField
                                    label="Minutes"
                                    type="number"
                                    value={formData.minutes}
                                    onChange={(e) => setFormData({ ...formData, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
                                    required
                                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                                    sx={{ flex: 1 }}
                                />
                            </Box>
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
                                {selectedSolutionTime ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default SolutionTimesPage; 