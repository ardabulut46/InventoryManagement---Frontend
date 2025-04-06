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
    Button,
    Tabs,
    Tab,
    Fade,
} from '@mui/material';
import {
    Search as SearchIcon,
    Info as InfoIcon,
    Edit as EditIcon,
    Warning as WarningIcon,
    AccessTime as AccessTimeIcon,
    Refresh as RefreshIcon,
    AssignmentLate as AssignmentLateIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/httpClient';
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

function MyCreatedTicketsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [idleBreachTickets, setIdleBreachTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [idleBreachLoading, setIdleBreachLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [idleBreachError, setIdleBreachError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchCreatedTickets();
        fetchIdleBreachTickets();
    }, []);

    const fetchCreatedTickets = async () => {
        try {
            setIsRefreshing(true);
            const response = await axios.get('/api/Ticket/created-tickets');
            setTickets(response.data);
            setError('');
        } catch (err) {
            setError('Çağrılar yüklenirken bir hata oluştu.');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchIdleBreachTickets = async () => {
        try {
            setIdleBreachLoading(true);
            const response = await getIdleBreachTickets();
            console.log('Idle Breach API Response:', response);
            setIdleBreachTickets(response.data || []);
            setIdleBreachError('');
        } catch (err) {
            console.error('Error details:', err.response || err);
            setIdleBreachError('Süresi aşılan talepler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin veya sistem yöneticinizle iletişime geçin.');
            console.error('Error fetching idle breach tickets:', err);
        } finally {
            setIdleBreachLoading(false);
        }
    };

    const handleRefresh = () => {
        if (activeTab === 0) {
            setLoading(true);
            fetchCreatedTickets();
        } else {
            setIdleBreachLoading(true);
            fetchIdleBreachTickets();
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setSearchTerm('');
    };

    const filteredTickets = tickets.filter(ticket =>
        Object.values(ticket).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const filteredIdleBreachTickets = idleBreachTickets.filter(ticket =>
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

    const renderLoadingState = (message) => (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <LinearProgress />
                    <Typography align="center" color="text.secondary">
                        {message}
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );

    const renderErrorState = (errorMessage, onRetry) => (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 4, 
                    borderRadius: 2,
                    textAlign: 'center' 
                }}
            >
                <WarningIcon 
                    sx={{ 
                        fontSize: 64, 
                        color: theme.palette.warning.main,
                        mb: 2
                    }} 
                />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Bağlantı Hatası
                </Typography>
                <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
                >
                    {errorMessage}
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<RefreshIcon />}
                    onClick={onRetry}
                    sx={{ mt: 2 }}
                >
                    Yeniden Dene
                </Button>
            </Paper>
        </Container>
    );

    // Render loading states
    if (activeTab === 0 && loading) {
        return renderLoadingState("Çağrılar yükleniyor...");
    }

    if (activeTab === 1 && idleBreachLoading) {
        return renderLoadingState("Süresi aşılan talepler yükleniyor...");
    }

    // Render error states
    if (activeTab === 0 && error) {
        return renderErrorState(error, handleRefresh);
    }

    if (activeTab === 1 && idleBreachError) {
        return renderErrorState(idleBreachError, handleRefresh);
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
                {/* Tabs */}
                <Box sx={{ mb: 4 }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        sx={{ 
                            borderBottom: 1, 
                            borderColor: 'divider',
                            mb: 3 
                        }}
                    >
                        <Tab 
                            label="Açtığım Çağrılar" 
                            sx={{ fontWeight: activeTab === 0 ? 'bold' : 'normal' }}
                        />
                        <Tab 
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>Süresi Aşılan Talepler</span>
                                    {idleBreachTickets.length > 0 && (
                                        <Chip 
                                            label={idleBreachTickets.length} 
                                            color="warning" 
                                            size="small"
                                        />
                                    )}
                                </Box>
                            } 
                            sx={{ fontWeight: activeTab === 1 ? 'bold' : 'normal' }}
                        />
                    </Tabs>

                    {/* Header Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2, 
                        mb: 3 
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {activeTab === 0 ? (
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'medium' }}>
                                    Açtığım Çağrılar
                                </Typography>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            )}
                        </Box>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            sx={{ height: 40 }}
                        >
                            {isRefreshing ? 'Yenileniyor...' : 'Yenile'}
                        </Button>
                    </Box>

                    {/* Subtitle */}
                    {activeTab === 0 && (
                        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                            Oluşturduğunuz tüm çağrıları buradan takip edebilirsiniz
                        </Typography>
                    )}

                    {/* Summary Cards for Idle Breach */}
                    {activeTab === 1 && (
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card sx={{ bgcolor: theme.palette.warning.light, color: theme.palette.warning.contrastText }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Toplam Süresi Aşılan
                                        </Typography>
                                        <Typography variant="h3">
                                            {idleBreachTickets.length}
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
                                            {idleBreachTickets.filter(t => t.priority === 1).length}
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
                                            {idleBreachTickets.filter(t => !t.assignedDate || t.assignedDate === "0001-01-01T00:00:00").length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}

                    {/* Search Field */}
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder={activeTab === 0 ? "Çağrılarda ara..." : "Taleplerde ara..."}
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

                    {/* Empty State for Idle Breach Tickets */}
                    {activeTab === 1 && idleBreachTickets.length === 0 && (
                        <Box 
                            sx={{ 
                                py: 8, 
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                border: '1px dashed',
                                borderColor: 'divider',
                            }}
                        >
                            <AssignmentIcon 
                                sx={{ 
                                    fontSize: 70, 
                                    color: theme.palette.success.light,
                                    mb: 2 
                                }} 
                            />
                            <Typography variant="h5" gutterBottom fontWeight="medium">
                                Tüm talepler zamanında cevaplanıyor
                            </Typography>
                            <Typography 
                                variant="body1" 
                                color="text.secondary"
                                sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
                            >
                                Şu anda süresi aşılan herhangi bir talep bulunmamaktadır. Tüm talepler belirlenen süre içinde cevaplanmaktadır.
                            </Typography>
                        </Box>
                    )}

                    {/* My Created Tickets Table */}
                    {activeTab === 0 && (
                        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'background.default' }}>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Kayıt No</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Konu</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Problem Tipi</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Grup</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Durum</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Öncelik</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Oluşturulma Tarihi</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }} align="right">İşlemler</TableCell>
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
                                                        sx={{ 
                                                            color: theme.palette.primary.main,
                                                            '&:hover': {
                                                                bgcolor: theme.palette.primary.lighter,
                                                            }
                                                        }}
                                                    >
                                                        <InfoIcon fontSize="small" />
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
                                                        <EditIcon fontSize="small" />
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
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    {searchTerm ? (
                                                        <>
                                                            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                                            <Typography variant="h6" gutterBottom>
                                                                Arama sonucu bulunamadı
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                "{searchTerm}" aramanıza uygun çağrı bulunamadı.
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Typography variant="h6" color="text.secondary">
                                                                Henüz bir çağrı oluşturmadınız
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Yeni bir çağrı oluşturmak için "Çağrı Oluştur" butonunu kullanabilirsiniz
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Idle Breach Tickets Table */}
                    {activeTab === 1 && idleBreachTickets.length > 0 && (
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
                                    {filteredIdleBreachTickets.map((ticket) => (
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
                                    {filteredIdleBreachTickets.length === 0 && (
                                        <TableRow>
                                            <TableCell 
                                                colSpan={8} 
                                                align="center" 
                                                sx={{ 
                                                    py: 4,
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                                    <Typography variant="h6" gutterBottom>
                                                        Arama sonucu bulunamadı
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        "{searchTerm}" aramanıza uygun talep bulunamadı.
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default MyCreatedTicketsPage; 