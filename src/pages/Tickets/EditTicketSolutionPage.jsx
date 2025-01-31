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
import { useNavigate, useParams } from 'react-router-dom';
import { getTicketSolutionById, updateTicketSolution } from '../../api/TicketSolutionService';
import SolutionTypeService from '../../api/SolutionTypeService';

function EditTicketSolutionPage() {
    const navigate = useNavigate();
    const { ticketId, solutionId } = useParams();
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        solutionTypeId: '',
    });
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSolutionTypes();
        fetchSolution();
    }, [solutionId]);

    const fetchSolutionTypes = async () => {
        try {
            const response = await SolutionTypeService.getSolutionTypes();
            setSolutionTypes(response.data);
        } catch (error) {
            console.error('Error fetching solution types:', error);
            setError('Failed to fetch solution types');
        }
    };

    const fetchSolution = async () => {
        try {
            const response = await getTicketSolutionById(solutionId);
            const solution = response.data;
            setFormData({
                subject: solution.subject,
                description: solution.description,
                solutionTypeId: solution.solutionTypeId,
            });
        } catch (error) {
            console.error('Error fetching solution:', error);
            setError('Failed to fetch solution');
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
            await updateTicketSolution(solutionId, formData);
            navigate(`/tickets/${ticketId}/solutions`);
        } catch (error) {
            console.error('Error updating solution:', error);
            setError(error.response?.data || 'Failed to update solution');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Edit Solution
            </Typography>

            <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
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
                            onClick={() => navigate(`/tickets/${ticketId}/solutions`)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Updating Solution...' : 'Update Solution'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}

export default EditTicketSolutionPage; 