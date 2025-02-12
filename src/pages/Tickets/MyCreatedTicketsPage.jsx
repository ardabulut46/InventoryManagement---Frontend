import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Alert,
    Fade,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tooltip,
    LinearProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    Info as InfoIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/httpClient';
import PriorityChip from '../../components/PriorityChip';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors = {
    'New': 'info',
    'In Progress': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
};

function MyCreatedTicketsPage() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCreatedTickets();
    }, []);

    const fetchCreatedTickets = async () => {
        try {
            const response = await axios.get('/api/Ticket/created-tickets');
            setTickets(response.data);
            setError('');
        } catch (err) {
            setError('Çağrılar yüklenirken bir hata oluştu.');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket =>
        Object.values(ticket).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`);
    };

    const handleEditClick = (e, ticketId) => {
        e.stopPropagation();
        navigate(`/tickets/edit/${ticketId}`);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Benim Açtığım Çağrılar
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Oluşturduğunuz tüm çağrıları buradan takip edebilirsiniz
                    </Typography>
                </Box>

                {error && (
                    <Fade in={true}>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                <Box sx={{ mb: 4 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Çağrılarda ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            maxWidth: 500,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>

                {loading ? (
                    <LinearProgress sx={{ mb: 3 }} />
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Kayıt No</TableCell>
                                    <TableCell>Konu</TableCell>
                                    <TableCell>Problem Tipi</TableCell>
                                    <TableCell>Grup</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell>Öncelik</TableCell>
                                    <TableCell>Oluşturulma Tarihi</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTickets.map((ticket) => (
                                    <TableRow
                                        key={ticket.id}
                                        hover
                                        onClick={() => handleTicketClick(ticket.id)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:last-child td, &:last-child th': { border: 0 }
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                #{ticket.registrationNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{ticket.subject}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ticket.problemType}
                                                variant="outlined"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {ticket.group?.name}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={ticket.status}
                                                color={statusColors[ticket.status]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <PriorityChip priority={ticket.priority} />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title={new Date(ticket.createdDate).toLocaleString('tr-TR')}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDistanceToNow(new Date(ticket.createdDate), { addSuffix: true, locale: tr })}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Detaylar">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleTicketClick(ticket.id)}
                                                >
                                                    <InfoIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Düzenle">
                                                <IconButton 
                                                    size="small"
                                                    onClick={(e) => handleEditClick(e, ticket.id)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTickets.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography variant="h6" color="text.secondary">
                                                Henüz bir çağrı oluşturmadınız
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Yeni bir çağrı oluşturmak için "Çağrı Oluştur" butonunu kullanabilirsiniz
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
}

export default MyCreatedTicketsPage; 