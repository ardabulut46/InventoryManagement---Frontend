import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Stack,
    TextField,
    InputAdornment,
    Chip,
    Button,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    LinearProgress,
    Divider,
    Badge,
    useTheme,
} from '@mui/material';
import {
    Search as SearchIcon,
    AccessTime as AccessTimeIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    PriorityHigh as PriorityIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    NewReleases as NewIcon,
    ArrowBack as ArrowBackIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    Description as DescriptionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMyTickets, updateTicketPriority } from '../../api/TicketService';
import PriorityChip from '../../components/PriorityChip';
import { TICKET_PRIORITIES } from '../../utils/ticketConfig';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors = {
    'New': 'info',
    'In Progress': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
};

const statusTranslations = {
    'New': 'Yeni',
    'In Progress': 'Devam Eden',
    'Completed': 'Tamamlanan',
    'Cancelled': 'İptal Edilen'
};

const statusIcons = {
    'New': <NewIcon />,
    'In Progress': <WarningIcon />,
    'Completed': <CheckCircleIcon />,
    'Cancelled': <ErrorIcon />,
};

function MyTicketsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const fetchMyTickets = async () => {
        try {
            setLoading(true);
            const response = await getMyTickets();
            setTickets(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching my tickets:', err);
            setError('Çağrılar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityClick = (event, ticket) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedTicket(ticket);
    };

    const handlePriorityClose = () => {
        setAnchorEl(null);
        setSelectedTicket(null);
    };

    const handlePriorityChange = async (priority) => {
        try {
            await updateTicketPriority(selectedTicket.id, priority);
            await fetchMyTickets();
        } catch (err) {
            console.error('Error updating priority:', err);
            setError('Öncelik güncellenirken bir hata oluştu.');
        }
        handlePriorityClose();
    };

    const getStatusStats = () => {
        return tickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});
    };

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = Object.values(ticket).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const statusStats = getStatusStats();

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <LinearProgress />
                        <Typography align="center" color="text.secondary">
                            Üzerimdeki çağrılar yükleniyor...
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/tickets')}
                    sx={{ mb: 3 }}
                >
                    Çağrılara Dön
                </Button>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 3
                    }}
                >
                    Üzerimdeki Çağrılar
                </Typography>
            </Box>

            {/* Stats Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                        bgcolor: theme.palette.primary.light,
                        boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                        height: '100%' 
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText, mb: 2 }}>
                                Toplam Çağrı
                            </Typography>
                            <Typography variant="h3" sx={{ color: theme.palette.primary.contrastText }}>
                                {tickets.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                        bgcolor: theme.palette.warning.light,
                        boxShadow: `0 4px 20px ${theme.palette.warning.main}40`,
                        height: '100%'
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: theme.palette.warning.contrastText, mb: 2 }}>
                                Devam Eden
                            </Typography>
                            <Typography variant="h3" sx={{ color: theme.palette.warning.contrastText }}>
                                {tickets.filter(t => t.status === 'In Progress').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                        bgcolor: theme.palette.success.light,
                        boxShadow: `0 4px 20px ${theme.palette.success.main}40`,
                        height: '100%'
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: theme.palette.success.contrastText, mb: 2 }}>
                                Tamamlanan
                            </Typography>
                            <Typography variant="h3" sx={{ color: theme.palette.success.contrastText }}>
                                {tickets.filter(t => t.status === 'Completed').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                        bgcolor: theme.palette.error.light,
                        boxShadow: `0 4px 20px ${theme.palette.error.main}40`,
                        height: '100%'
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ color: theme.palette.error.contrastText, mb: 2 }}>
                                Kritik Öncelikli
                            </Typography>
                            <Typography variant="h3" sx={{ color: theme.palette.error.contrastText }}>
                                {tickets.filter(t => t.priority === 1).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Status Filter Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {Object.entries(statusStats)
                    .filter(([status]) => status !== 'In Progress')
                    .map(([status, count]) => (
                    <Grid item xs={12} sm={6} md={3} key={status}>
                        <Paper
                            elevation={0}
                            onClick={() => setSelectedStatus(status)}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: selectedStatus === status ? `${statusColors[status]}.50` : 'background.paper',
                                border: 1,
                                borderColor: selectedStatus === status ? `${statusColors[status]}.main` : 'divider',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                }
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar 
                                    sx={{ 
                                        bgcolor: selectedStatus === status ? `${statusColors[status]}.main` : 'grey.200',
                                        boxShadow: selectedStatus === status ? `0 4px 12px ${theme.palette[statusColors[status]].main}40` : 'none'
                                    }}
                                >
                                    {statusIcons[status]}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 'bold', 
                                        color: selectedStatus === status ? `${statusColors[status]}.main` : 'text.primary'
                                    }}>
                                        {statusTranslations[status]}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {count} adet
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Search and Filter Section */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Çağrılarda ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                        }
                    }}
                />
                <Button
                    variant="outlined"
                    onClick={() => setSelectedStatus('all')}
                    sx={{ 
                        borderRadius: 2,
                        borderColor: selectedStatus === 'all' ? 'primary.main' : 'divider',
                        color: selectedStatus === 'all' ? 'primary.main' : 'text.secondary',
                    }}
                >
                    Tümü
                </Button>
            </Box>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                            color: 'error.main'
                        }
                    }}
                >
                    {error}
                </Alert>
            )}

            {/* Tickets List */}
            {filteredTickets.length > 0 ? (
                <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                    {filteredTickets.map((ticket) => (
                        <React.Fragment key={ticket.id}>
                            <ListItem 
                                button 
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                sx={{
                                    p: 2,
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: `${statusColors[ticket.status]}.main`,
                                            boxShadow: `0 4px 12px ${theme.palette[statusColors[ticket.status]].main}40`
                                        }}
                                    >
                                        {statusIcons[ticket.status]}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography 
                                            component="div" 
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
                                        >
                                            <Typography 
                                                variant="subtitle1" 
                                                component="span" 
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {ticket.subject}
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                component="span" 
                                                color="text.secondary"
                                            >
                                                #{ticket.registrationNumber}
                                            </Typography>
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography component="div">
                                            <Stack spacing={1}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <LocationIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" component="span">
                                                            {ticket.location}
                                                            {ticket.room && ` (Oda: ${ticket.room})`}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <BusinessIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" component="span">
                                                            {ticket.department?.name || 'Departman Belirtilmemiş'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <PersonIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" component="span">
                                                            {ticket.user?.name} {ticket.user?.surname}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AccessTimeIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" component="span">
                                                            {formatDistanceToNow(new Date(ticket.createdDate), { 
                                                                addSuffix: true,
                                                                locale: tr 
                                                            })}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Stack>
                                        </Typography>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton 
                                        edge="end" 
                                        onClick={(e) => handlePriorityClick(e, ticket)}
                                        sx={{ mr: 1 }}
                                    >
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <PriorityChip priority={ticket.priority} />
                                            <ArrowDownIcon fontSize="small" />
                                        </Stack>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            ) : (
                <Paper 
                    sx={{ 
                        p: 4, 
                        textAlign: 'center', 
                        borderRadius: 2,
                        bgcolor: 'background.default' 
                    }}
                >
                    <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="textSecondary">
                        {searchTerm 
                            ? 'Arama kriterlerine uygun çağrı bulunamadı.' 
                            : 'Üzerinize atanmış çağrı bulunmamaktadır.'}
                    </Typography>
                </Paper>
            )}

            {/* Priority Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handlePriorityClose}
                elevation={3}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        borderRadius: 2,
                    }
                }}
            >
                {Object.entries(TICKET_PRIORITIES).map(([value, { label, color }]) => (
                    <MenuItem
                        key={value}
                        onClick={() => handlePriorityChange(Number(value))}
                        sx={{
                            color: color,
                            fontWeight: 'medium',
                            minWidth: '120px',
                            '&:hover': {
                                bgcolor: `${color}15`,
                            }
                        }}
                    >
                        <PriorityIcon sx={{ mr: 1, color: 'inherit' }} />
                        {label}
                    </MenuItem>
                ))}
            </Menu>
        </Container>
    );
}

export default MyTicketsPage; 