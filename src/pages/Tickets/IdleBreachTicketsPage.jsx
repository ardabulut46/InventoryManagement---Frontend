import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    LinearProgress,
    Card,
    CardContent,
    Grid,
    Stack,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    Warning as WarningIcon,
    AccessTime as AccessTimeIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getIdleBreachTickets } from '../../api/IdleDurationLimitService';
import PriorityChip from '../../components/PriorityChip';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors = {
    'New': 'info',
    'In Progress': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
};

function IdleBreachTicketsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchIdleBreachTickets();
    }, []);

    const fetchIdleBreachTickets = async () => {
        try {
            const response = await getIdleBreachTickets();
            console.log('API Response:', response);
            console.log('Response Data:', response.data);
            setTickets(response.data);
            setError('');
        } catch (err) {
            console.error('Error details:', err.response || err);
            setError('Süresi aşılan talepler yüklenirken bir hata oluştu.');
            console.error('Error fetching idle breach tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket =>
        Object.values(ticket).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    
    console.log('Filtered Tickets:', filteredTickets);
    console.log('All Tickets State:', tickets);

    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`);
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <LinearProgress />
                        <Typography align="center" color="text.secondary">
                            Süresi aşılan talepler yükleniyor...
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                }}
            >
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 'bold',
                                color: theme.palette.warning.main
                            }}
                        >
                            Süresi Aşılan Talepler
                        </Typography>
                    </Box>
                    
                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.contrastText }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Toplam Süresi Aşılan
                                    </Typography>
                                    <Typography variant="h3">
                                        {tickets.length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Kritik Öncelikli
                                    </Typography>
                                    <Typography variant="h3">
                                        {tickets.filter(t => t.priority === 1).length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ bgcolor: theme.palette.info.light, color: theme.palette.info.contrastText }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Atanmamış
                                    </Typography>
                                    <Typography variant="h3">
                                        {tickets.filter(t => !t.assignedDate || t.assignedDate === "0001-01-01T00:00:00").length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Taleplerde ara..."
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
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    bgcolor: 'background.default',
                                }
                            }
                        }}
                    />

                    <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Kayıt No</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Konu</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Departman</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Konum</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Öncelik</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Durum</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Bekleme Süresi</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTickets.map((ticket) => (
                                    <TableRow 
                                        key={ticket.id}
                                        hover
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <TableCell onClick={() => handleTicketClick(ticket.id)}>
                                            <Typography variant="body2" color="text.secondary">
                                                #{ticket.registrationNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell onClick={() => handleTicketClick(ticket.id)}>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {ticket.subject}
                                            </Typography>
                                        </TableCell>
                                        <TableCell onClick={() => handleTicketClick(ticket.id)}>
                                            {ticket.group?.name || '-'}
                                        </TableCell>
                                        <TableCell onClick={() => handleTicketClick(ticket.id)}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Typography variant="body2">{ticket.location}</Typography>
                                                {ticket.room && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Oda: {ticket.room}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell onClick={() => handleTicketClick(ticket.id)}>
                                            <PriorityChip priority={ticket.priority} />
                                        </TableCell>
                                        <TableCell onClick={() => handleTicketClick(ticket.id)}>
                                            <Chip
                                                label={ticket.status}
                                                color={statusColors[ticket.status]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell onClick={() => handleTicketClick(ticket.id)}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTimeIcon 
                                                    fontSize="small" 
                                                    sx={{ 
                                                        color: theme.palette.warning.main 
                                                    }} 
                                                />
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: theme.palette.warning.main,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {formatDistanceToNow(new Date(ticket.createdDate), {
                                                        addSuffix: true,
                                                        locale: tr
                                                    })}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Detayları Görüntüle">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleTicketClick(ticket.id)}
                                                    sx={{ 
                                                        color: theme.palette.primary.main,
                                                        '&:hover': {
                                                            bgcolor: theme.palette.primary.lighter,
                                                        }
                                                    }}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTickets.length === 0 && (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={8} 
                                            align="center" 
                                            sx={{ 
                                                py: 4,
                                                color: 'text.secondary',
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            Süresi aşılan talep bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Paper>
        </Container>
    );
}

export default IdleBreachTicketsPage; 