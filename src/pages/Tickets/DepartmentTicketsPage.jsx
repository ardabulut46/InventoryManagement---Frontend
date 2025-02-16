import React, { useState, useEffect } from 'react';
import {
    Container,
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
    TextField,
    InputAdornment,
    Alert,
    Chip,
    Button,
    useTheme,
    LinearProgress,
    Fade,
    Tooltip,
    Card,
    CardContent,
    Grid,
    Stack,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Info as InfoIcon,
    Group as GroupIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDepartmentTickets } from '../../api/TicketService';
import { TICKET_PRIORITIES } from '../../utils/ticketConfig';
import PriorityChip from '../../components/PriorityChip';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors = {
    'New': 'info',
    'In Progress': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
};

function DepartmentTicketsPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await getDepartmentTickets();
            setTickets(response.data);
            setError('');
        } catch (err) {
            setError('Departman çağrıları yüklenirken bir hata oluştu.');
            console.error('Error fetching department tickets:', err);
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

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <LinearProgress />
                        <Typography align="center" color="text.secondary">
                            Departman çağrıları yükleniyor...
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <GroupIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            Grubumun Çağrıları
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Departmanınıza atanmış tüm çağrıları buradan takip edebilirsiniz
                    </Typography>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: theme.palette.primary.light }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText }}>
                                    Toplam Çağrı
                                </Typography>
                                <Typography variant="h3" sx={{ color: theme.palette.primary.contrastText }}>
                                    {tickets.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: theme.palette.warning.light }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.palette.warning.contrastText }}>
                                    Devam Eden
                                </Typography>
                                <Typography variant="h3" sx={{ color: theme.palette.warning.contrastText }}>
                                    {tickets.filter(t => t.status === 'In Progress').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: theme.palette.success.light }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.palette.success.contrastText }}>
                                    Tamamlanan
                                </Typography>
                                <Typography variant="h3" sx={{ color: theme.palette.success.contrastText }}>
                                    {tickets.filter(t => t.status === 'Completed').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: theme.palette.error.light }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.palette.error.contrastText }}>
                                    Kritik Öncelikli
                                </Typography>
                                <Typography variant="h3" sx={{ color: theme.palette.error.contrastText }}>
                                    {tickets.filter(t => t.priority === 1).length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {error && (
                    <Fade in={true}>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                <Box sx={{ mb: 4 }}>
                    <TextField
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
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />
                </Box>

                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Kayıt No</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Konu</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Problem Tipi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Öncelik</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Oluşturan</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Atanan</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">İşlemler</TableCell>
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
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            #{ticket.registrationNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {ticket.subject}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={ticket.problemType}
                                            variant="outlined"
                                            size="small"
                                        />
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
                                        <Typography variant="body2">
                                            {`${ticket.user?.name || ''} ${ticket.user?.surname || ''}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {`${ticket.assignedTo?.name || ''} ${ticket.assignedTo?.surname || ''}`}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Detayları Görüntüle">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTicketClick(ticket.id);
                                                }}
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
                                        <Tooltip title="Düzenle">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleEditClick(e, ticket.id)}
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    '&:hover': {
                                                        bgcolor: theme.palette.primary.lighter,
                                                    }
                                                }}
                                            >
                                                <EditIcon />
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
                                        <Typography variant="h6" color="text.secondary">
                                            {searchTerm ? 'Arama kriterlerine uygun çağrı bulunamadı.' : 'Henüz çağrı bulunmuyor.'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Yeni bir çağrı oluşturmak için "Yeni Çağrı" butonunu kullanabilirsiniz
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}

export default DepartmentTicketsPage; 