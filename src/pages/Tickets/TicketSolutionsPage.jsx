import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getSolutionsByTicket, deleteTicketSolution } from '../../api/TicketSolutionService';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function TicketSolutionsPage() {
    const navigate = useNavigate();
    const { ticketId } = useParams();
    const [solutions, setSolutions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSolutions();
    }, [ticketId]);

    const fetchSolutions = async () => {
        try {
            const response = await getSolutionsByTicket(ticketId);
            setSolutions(response.data);
        } catch (error) {
            console.error('Error fetching solutions:', error);
            setError('Failed to fetch solutions');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (solutionId) => {
        if (window.confirm('Are you sure you want to delete this solution?')) {
            try {
                await deleteTicketSolution(solutionId);
                await fetchSolutions();
            } catch (error) {
                console.error('Error deleting solution:', error);
                setError('Failed to delete solution');
            }
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(`/tickets/${ticketId}`)}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Ticket Solutions
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/tickets/${ticketId}/solutions/create`)}
                >
                    Add Solution
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
                            <TableCell>Subject</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Solution Type</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {solutions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No solutions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            solutions.map((solution) => (
                                <TableRow key={solution.id}>
                                    <TableCell>{solution.subject}</TableCell>
                                    <TableCell>{solution.description}</TableCell>
                                    <TableCell>{solution.solutionType?.name}</TableCell>
                                    <TableCell>{solution.createdByUser?.email}</TableCell>
                                    <TableCell>
                                        {new Date(solution.createdAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                onClick={() => navigate(`/tickets/${ticketId}/solutions/${solution.id}/edit`)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                onClick={() => handleDelete(solution.id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default TicketSolutionsPage; 