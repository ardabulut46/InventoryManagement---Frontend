import React, { useState, useEffect } from 'react';
import {
    Typography,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Box,
    Avatar
} from '@mui/material';
import { PeopleAlt as PeopleAltIcon } from '@mui/icons-material';
import { getMostAssignedTicketsToUser } from '../api/TicketService'; // Import the service function

function TicketReports() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await getMostAssignedTicketsToUser();
                setData(response.data); // Assuming the data is in response.data
                setError(null);
            } catch (err) {
                setError(err.message || 'Bir hata oluştu.');
                console.error("Error fetching most assigned tickets:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper 
                sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5 }}>
                        <PeopleAltIcon />
                    </Avatar>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                        En Çok Çağrı Üstlenen Kullanıcılar (Top 5)
                    </Typography>
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && data.length === 0 && (
                    <Typography sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
                        Gösterilecek veri bulunamadı.
                    </Typography>
                )}

                {!loading && !error && data.length > 0 && (
                    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid rgba(224, 224, 224, 1)', borderRadius: 1.5 }}>
                        <Table aria-label="en çok çağrı üstlenen kullanıcılar tablosu">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Kullanıcı Adı</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Üstlenilen Çağrı Sayısı</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row) => (
                                    <TableRow 
                                        key={row.userId}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {row.userId}
                                        </TableCell>
                                        <TableCell>{row.userName}</TableCell>
                                        <TableCell align="right">{row.ticketCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
}

export default TicketReports; 