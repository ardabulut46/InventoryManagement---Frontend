import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, updateTicket } from '../../api/TicketService';
import {
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Grid,
    MenuItem,
    Divider,
    Alert,
    IconButton,
    Chip,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationIcon,
    Description as DescriptionIcon,
    Category as CategoryIcon,
    PriorityHigh as PriorityIcon,
} from '@mui/icons-material';
import { TICKET_PRIORITIES } from '../../utils/ticketConfig';

const TICKET_STATUSES = [
    'New',
    'In Progress',
    'Completed',
    'Cancelled',
];

const PROBLEM_TYPES = [
    'Hardware',
    'Software',
    'Network',
    'Other',
];

function EditTicketPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        registrationNumber: '',
        userId: 0,
        inventoryId: null,
        problemType: '',
        location: '',
        room: '',
        subject: '',
        description: '',
        status: '',
        priority: 1,
        attachmentPath: '',
        departmentId: null,
    });

    useEffect(() => {
        fetchTicket();
    }, []);

    const fetchTicket = async () => {
        try {
            const res = await getTicketById(id);
            const t = res.data;
            setFormData({
                registrationNumber: t.registrationNumber || '',
                userId: t.userId || 0,
                inventoryId: t.inventoryId || null,
                problemType: t.problemType || '',
                location: t.location || '',
                room: t.room || '',
                subject: t.subject || '',
                description: t.description || '',
                status: t.status || '',
                priority: t.priority || 1,
                attachmentPath: t.attachmentPath || '',
                departmentId: t.departmentId || null,
            });
            setError('');
        } catch (err) {
            console.error('Error fetching ticket', err);
            setError('Failed to fetch ticket details.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dto = {
                ...formData,
                userId: Number(formData.userId),
                inventoryId: formData.inventoryId ? Number(formData.inventoryId) : null,
                departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                priority: Number(formData.priority)
            };
            await updateTicket(id, dto);
            setSuccess('Ticket updated successfully!');
            setTimeout(() => navigate('/tickets'), 1500);
        } catch (err) {
            console.error('Error updating ticket', err);
            setError('Failed to update ticket. ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton 
                        onClick={() => navigate('/tickets')} 
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Edit Ticket #{formData.registrationNumber}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Left Column */}
                        <Grid item xs={12} md={6}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 2,
                                    bgcolor: 'background.default'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                    <DescriptionIcon sx={{ mr: 1 }} />
                                    Basic Information
                                </Typography>
                                
                                <TextField
                                    label="Subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Problem Type</InputLabel>
                                    <Select
                                        name="problemType"
                                        value={formData.problemType}
                                        onChange={handleChange}
                                        label="Problem Type"
                                        required
                                    >
                                        {PROBLEM_TYPES.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                            </Paper>
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} md={6}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 2,
                                    bgcolor: 'background.default',
                                    mb: 3
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                    <LocationIcon sx={{ mr: 1 }} />
                                    Location Details
                                </Typography>

                                <TextField
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />

                                <TextField
                                    label="Room"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Paper>

                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 2,
                                    bgcolor: 'background.default'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                    <PriorityIcon sx={{ mr: 1 }} />
                                    Status & Priority
                                </Typography>

                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        label="Status"
                                        required
                                    >
                                        {TICKET_STATUSES.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        label="Priority"
                                        required
                                    >
                                        {Object.entries(TICKET_PRIORITIES).map(([value, { label, color }]) => (
                                            <MenuItem 
                                                key={value} 
                                                value={Number(value)}
                                                sx={{ color: color }}
                                            >
                                                {label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/tickets')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

export default EditTicketPage;
