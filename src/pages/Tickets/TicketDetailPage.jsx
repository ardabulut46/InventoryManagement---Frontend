import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip,
    Button,
    Divider,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Build as BuildIcon, CheckCircle as CheckCircleIcon, AttachFile as AttachmentIcon, Download as DownloadIcon } from '@mui/icons-material';
import { getTicketById } from '../../api/TicketService';
import { getUserById } from '../../api/UserService';
import { API_URL } from '../../config';

const statusColors = {
    'New': 'info',
    'In Progress': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
};

function TicketDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [creator, setCreator] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        if (ticket?.createdById) {
            fetchCreator(ticket.createdById);
        }
    }, [ticket?.createdById]);

    const fetchTicket = async () => {
        try {
            const response = await getTicketById(id);
            setTicket(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching ticket:', err);
            setError('Failed to fetch ticket details.');
        }
    };

    const fetchCreator = async (creatorId) => {
        try {
            const response = await getUserById(creatorId);
            setCreator(response.data);
        } catch (err) {
            console.error('Error fetching creator details:', err);
        }
    };

    const handleCloseTicket = () => {
        navigate(`/tickets/${id}/solutions/create`, { state: { isClosing: true } });
    };

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!ticket) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/tickets')}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>
                        Ticket Details
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<BuildIcon />}
                        onClick={() => navigate(`/tickets/${id}/solutions`)}
                        sx={{ mr: 2 }}
                    >
                        Solutions
                    </Button>
                    {ticket?.status !== 'Completed' && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleCloseTicket}
                            sx={{ mr: 2 }}
                        >
                            Çağrıyı Kapat
                        </Button>
                    )}
                    <Chip
                        label={ticket.status}
                        color={statusColors[ticket.status] || 'default'}
                        sx={{ ml: 2 }}
                    />
                </Box>
                <Divider sx={{ mb: 4 }} />

                {/* Basic Information */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Registration Number
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.registrationNumber}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Created Date
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(ticket.createdDate).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Subject
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.subject}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Description
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {ticket.description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Location Information */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Location Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Location
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.location}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Room
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.room || '-'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Floor
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.floor || '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Department and Assignment */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Department and Assignment
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Department
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.department?.name || '-'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Assigned To
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.user
                                        ? `${ticket.user.name} ${ticket.user.surname} (${ticket.user.email})`
                                        : 'Not assigned'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Created By
                                </Typography>
                                <Typography variant="body1">
                                    {creator
                                        ? `${creator.name} ${creator.surname} (${creator.email})`
                                        : 'Loading...'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Priority
                                </Typography>
                                <Typography variant="body1">
                                    {ticket.priorityLabel || 'Not set'}
                                </Typography>
                            </Grid>
                            {ticket.assignedBy && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Assigned By
                                    </Typography>
                                    <Typography variant="body1">
                                        {`${ticket.assignedBy.name} ${ticket.assignedBy.surname} (${ticket.assignedBy.email})`}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Attachments */}
                {ticket.attachmentPath && (
                    <Card variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AttachmentIcon sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    Attachments
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1">
                                    {ticket.attachmentPath.split('/').pop()}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<DownloadIcon />}
                                    href={`${API_URL}/${ticket.attachmentPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Paper>
        </Box>
    );
}

export default TicketDetailPage; 