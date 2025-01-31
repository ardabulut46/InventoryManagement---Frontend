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
    Tabs,
    Tab,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import SolutionTimeService from '../../api/SolutionTimeService';
import { getProblemTypes, createProblemType, updateProblemType, deleteProblemType } from '../../api/ProblemTypeService';
import SolutionTypeService from '../../api/SolutionTypeService';

// TabPanel component for tab content
function TabPanel({ children, value, index }) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
            {value === index && children}
        </Box>
    );
}

function AdminPage() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    
    // Solution Times state
    const [solutionTimes, setSolutionTimes] = useState([]);
    const [solutionTimeDialog, setSolutionTimeDialog] = useState(false);
    const [selectedSolutionTime, setSelectedSolutionTime] = useState(null);
    const [solutionTimeForm, setSolutionTimeForm] = useState({
        problemTypeId: '',
        hours: 0,
        minutes: 0
    });

    // Problem Types state
    const [problemTypes, setProblemTypes] = useState([]);
    const [problemTypeDialog, setProblemTypeDialog] = useState(false);
    const [selectedProblemType, setSelectedProblemType] = useState(null);
    const [problemTypeForm, setProblemTypeForm] = useState({
        name: '',
        description: ''
    });

    // Solution Types state
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [solutionTypeDialog, setSolutionTypeDialog] = useState(false);
    const [selectedSolutionType, setSelectedSolutionType] = useState(null);
    const [solutionTypeForm, setSolutionTypeForm] = useState({
        name: '',
        description: ''
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [solutionTimesRes, problemTypesRes, solutionTypesRes] = await Promise.all([
                SolutionTimeService.getAllSolutionTimes(),
                getProblemTypes(),
                SolutionTypeService.getSolutionTypes()
            ]);
            setSolutionTimes(solutionTimesRes.data);
            setProblemTypes(problemTypesRes.data);
            setSolutionTypes(solutionTypesRes.data);
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            // Get detailed error information
            const errorDetail = err.response?.data?.detail || err.response?.data || err.message;
            const errorStatus = err.response?.status;
            const errorMessage = `Failed to fetch data (${errorStatus}): ${errorDetail}`;
            
            setError(errorMessage);
            
            // Try fetching each endpoint separately to identify which one is failing
            try {
                const solutionTimes = await SolutionTimeService.getAllSolutionTimes();
                setSolutionTimes(solutionTimes.data);
            } catch (stError) {
                console.error('SolutionTime fetch failed:', stError);
                setSolutionTimes([]);
            }

            try {
                const problemTypes = await getProblemTypes();
                setProblemTypes(problemTypes.data);
            } catch (ptError) {
                console.error('ProblemType fetch failed:', ptError);
                setProblemTypes([]);
            }

            try {
                const solutionTypes = await SolutionTypeService.getSolutionTypes();
                setSolutionTypes(solutionTypes.data);
            } catch (solError) {
                console.error('SolutionType fetch failed:', solError);
                setSolutionTypes([]);
            }
        }
    };

    // Solution Times handlers
    const handleSolutionTimeSubmit = async () => {
        try {
            const timeToSolve = `${solutionTimeForm.hours.toString().padStart(2, '0')}:${solutionTimeForm.minutes.toString().padStart(2, '0')}:00`;
            if (selectedSolutionTime) {
                await SolutionTimeService.updateSolutionTime(selectedSolutionTime.id, {
                    ...solutionTimeForm,
                    timeToSolve
                });
            } else {
                await SolutionTimeService.createSolutionTime({
                    ...solutionTimeForm,
                    timeToSolve
                });
            }
            setSolutionTimeDialog(false);
            fetchAllData();
            setSuccessMessage('Solution time saved successfully');
        } catch (err) {
            setError('Failed to save solution time');
        }
    };

    // Problem Types handlers
    const handleProblemTypeSubmit = async () => {
        try {
            if (selectedProblemType) {
                await updateProblemType(selectedProblemType.id, problemTypeForm);
            } else {
                await createProblemType(problemTypeForm);
            }
            setProblemTypeDialog(false);
            fetchAllData();
            setSuccessMessage('Problem type saved successfully');
        } catch (err) {
            setError('Failed to save problem type');
        }
    };

    const handleDeleteProblemType = async (id) => {
        if (window.confirm('Are you sure you want to delete this problem type?')) {
            try {
                await deleteProblemType(id);
                fetchAllData();
                setSuccessMessage('Problem type deleted successfully');
            } catch (err) {
                setError('Failed to delete problem type');
            }
        }
    };

    // Solution Types handlers
    const handleSolutionTypeSubmit = async () => {
        try {
            if (selectedSolutionType) {
                await SolutionTypeService.updateSolutionType(selectedSolutionType.id, solutionTypeForm);
            } else {
                await SolutionTypeService.createSolutionType(solutionTypeForm);
            }
            setSolutionTypeDialog(false);
            fetchAllData();
            setSuccessMessage('Solution type saved successfully');
        } catch (err) {
            setError('Failed to save solution type');
        }
    };

    const handleDeleteSolutionType = async (id) => {
        if (window.confirm('Are you sure you want to delete this solution type?')) {
            try {
                await SolutionTypeService.deleteSolutionType(id);
                fetchAllData();
                setSuccessMessage('Solution type deleted successfully');
            } catch (err) {
                setError('Failed to delete solution type');
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Admin Panel
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                        {successMessage}
                    </Alert>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="Solution Times" />
                        <Tab label="Problem Types" />
                        <Tab label="Solution Types" />
                    </Tabs>
                </Box>

                {/* Solution Times Tab */}
                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedSolutionTime(null);
                                setSolutionTimeForm({ problemTypeId: '', hours: 0, minutes: 0 });
                                setSolutionTimeDialog(true);
                            }}
                        >
                            Add Solution Time
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Problem Type</TableCell>
                                    <TableCell>Time to Solve</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {solutionTimes.map((time) => (
                                    <TableRow key={time.id}>
                                        <TableCell>
                                            {problemTypes.find(pt => pt.id === time.problemTypeId)?.name}
                                        </TableCell>
                                        <TableCell>{time.timeToSolve}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => {
                                                    const [hours, minutes] = time.timeToSolve.split(':');
                                                    setSelectedSolutionTime(time);
                                                    setSolutionTimeForm({
                                                        problemTypeId: time.problemTypeId,
                                                        hours: parseInt(hours),
                                                        minutes: parseInt(minutes)
                                                    });
                                                    setSolutionTimeDialog(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Problem Types Tab */}
                <TabPanel value={activeTab} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedProblemType(null);
                                setProblemTypeForm({ name: '', description: '' });
                                setProblemTypeDialog(true);
                            }}
                        >
                            Add Problem Type
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {problemTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell>{type.name}</TableCell>
                                        <TableCell>{type.description}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedProblemType(type);
                                                    setProblemTypeForm({
                                                        name: type.name,
                                                        description: type.description
                                                    });
                                                    setProblemTypeDialog(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteProblemType(type.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Solution Types Tab */}
                <TabPanel value={activeTab} index={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedSolutionType(null);
                                setSolutionTypeForm({ name: '', description: '' });
                                setSolutionTypeDialog(true);
                            }}
                        >
                            Add Solution Type
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {solutionTypes.map((type) => (
                                    <TableRow key={type.id}>
                                        <TableCell>{type.name}</TableCell>
                                        <TableCell>{type.description}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedSolutionType(type);
                                                    setSolutionTypeForm({
                                                        name: type.name,
                                                        description: type.description
                                                    });
                                                    setSolutionTypeDialog(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteSolutionType(type.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Solution Times Dialog */}
                <Dialog open={solutionTimeDialog} onClose={() => setSolutionTimeDialog(false)}>
                    <DialogTitle>
                        {selectedSolutionTime ? 'Edit Solution Time' : 'Add Solution Time'}
                    </DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Problem Type</InputLabel>
                            <Select
                                value={solutionTimeForm.problemTypeId}
                                onChange={(e) => setSolutionTimeForm({
                                    ...solutionTimeForm,
                                    problemTypeId: e.target.value
                                })}
                            >
                                {problemTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField
                                label="Hours"
                                type="number"
                                value={solutionTimeForm.hours}
                                onChange={(e) => setSolutionTimeForm({
                                    ...solutionTimeForm,
                                    hours: parseInt(e.target.value) || 0
                                })}
                            />
                            <TextField
                                label="Minutes"
                                type="number"
                                value={solutionTimeForm.minutes}
                                onChange={(e) => setSolutionTimeForm({
                                    ...solutionTimeForm,
                                    minutes: parseInt(e.target.value) || 0
                                })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSolutionTimeDialog(false)}>Cancel</Button>
                        <Button onClick={handleSolutionTimeSubmit} variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Problem Types Dialog */}
                <Dialog open={problemTypeDialog} onClose={() => setProblemTypeDialog(false)}>
                    <DialogTitle>
                        {selectedProblemType ? 'Edit Problem Type' : 'Add Problem Type'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Name"
                            value={problemTypeForm.name}
                            onChange={(e) => setProblemTypeForm({
                                ...problemTypeForm,
                                name: e.target.value
                            })}
                            sx={{ mt: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={problemTypeForm.description}
                            onChange={(e) => setProblemTypeForm({
                                ...problemTypeForm,
                                description: e.target.value
                            })}
                            sx={{ mt: 2 }}
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setProblemTypeDialog(false)}>Cancel</Button>
                        <Button onClick={handleProblemTypeSubmit} variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Solution Types Dialog */}
                <Dialog open={solutionTypeDialog} onClose={() => setSolutionTypeDialog(false)}>
                    <DialogTitle>
                        {selectedSolutionType ? 'Edit Solution Type' : 'Add Solution Type'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Name"
                            value={solutionTypeForm.name}
                            onChange={(e) => setSolutionTypeForm({
                                ...solutionTypeForm,
                                name: e.target.value
                            })}
                            sx={{ mt: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={solutionTypeForm.description}
                            onChange={(e) => setSolutionTypeForm({
                                ...solutionTypeForm,
                                description: e.target.value
                            })}
                            sx={{ mt: 2 }}
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSolutionTypeDialog(false)}>Cancel</Button>
                        <Button onClick={handleSolutionTypeSubmit} variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default AdminPage; 
