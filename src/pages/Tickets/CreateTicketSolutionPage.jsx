import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createTicketSolution } from '../../api/TicketSolutionService';
import SolutionTypeService from '../../api/SolutionTypeService';

function CreateTicketSolutionPage() {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const location = useLocation();
    const isClosing = location.state?.isClosing;

    const [formData, setFormData] = useState({
        ticketId: parseInt(ticketId),
        subject: '',
        description: '',
        solutionTypeId: '',
    });
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSolutionTypes();
    }, []);

    const fetchSolutionTypes = async () => {
        try {
            const response = await SolutionTypeService.getSolutionTypes();
            setSolutionTypes(response.data);
        } catch (error) {
            console.error('Error fetching solution types:', error);
            setError('Failed to fetch solution types');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createTicketSolution(formData);
            navigate(`/tickets/${ticketId}`);
        } catch (error) {
            console.error('Error creating solution:', error);
            setError(error.response?.data || 'Failed to create solution');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                {isClosing ? 'Close Ticket' : 'Add Solution'}
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 2,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                color: 'error.main'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {isClosing && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        You are about to close this ticket. Please provide the solution details below.
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Solution Type</InputLabel>
                        <Select
                            name="solutionTypeId"
                            value={formData.solutionTypeId}
                            onChange={handleChange}
                            required
                            label="Solution Type"
                        >
                            {solutionTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/tickets/${ticketId}`)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color={isClosing ? "success" : "primary"}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isClosing ? 'Close Ticket' : 'Add Solution')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}

export default CreateTicketSolutionPage; 