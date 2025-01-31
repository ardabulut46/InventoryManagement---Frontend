import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Chip,
} from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../config';

function TicketHistoryPage() {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTicketHistories();
    }, []);

    const fetchTicketHistories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/TicketHistory`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Ticket History Response:', response.data);
            setHistories(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ticket histories:', error);
            setError('Failed to fetch ticket histories');
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Çağrı Geçmişi
            </Typography>

            <TableContainer 
                component={Paper} 
                sx={{ 
                    maxHeight: 600,
                    '& .MuiTableHead-root': {
                        position: 'sticky',
                        top: 0,
                        bgcolor: 'background.paper',
                        zIndex: 1,
                    }
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket No</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>To User</TableCell>
                            <TableCell>To Group</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {histories.map((history) => (
                            <TableRow key={history.id}>
                                <TableCell>#{history.ticketRegistrationNumber}</TableCell>
                                <TableCell>{history.userEmail || '-'}</TableCell>
                                <TableCell>{history.toUserEmail || '-'}</TableCell>
                                <TableCell>{history.groupName || '-'}</TableCell>
                                <TableCell>{history.subject}</TableCell>
                                <TableCell>{history.description}</TableCell>
                            </TableRow>
                        ))}
                        {histories.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No ticket history found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default TicketHistoryPage; 