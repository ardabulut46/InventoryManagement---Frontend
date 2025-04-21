import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
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
    useTheme,
    Button,
    Grid,
    Card,
    CardContent,
    Badge,
    Alert,
} from '@mui/material';
import {
    Search as SearchIcon,
    Info as InfoIcon,
    Edit as EditIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon,
    AccessTime as AccessTimeIcon,
    Person as PersonIcon,
    AssignmentInd as AssignmentIndIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    HourglassEmpty as HourglassEmptyIcon,
    TimerOff as TimerOffIcon,
    CheckCircle as CheckCircleIcon,
    Alarm as AlarmIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/httpClient';
import PriorityChip from '../../components/PriorityChip';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getStatusTranslation } from '../../utils/ticketConfig';
import httpClient from '../../api/httpClient';

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
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [problemTypesLoading, setProblemTypesLoading] = useState(true);
    const [problemTypes, setProblemTypes] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        new: 0,
        overdue: 0,
        unassigned: 0
    });
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchCreatedTickets();
        fetchProblemTypes();
    }, []);

    const fetchProblemTypes = async () => {
        try {
            setProblemTypesLoading(true);
            const response = await httpClient.get('/api/ProblemType');
            console.log('Problem types response:', response.data);
            
            const problemTypesMap = {};
            response.data.forEach(type => {
                problemTypesMap[type.id] = type.name;
            });
            
            console.log('Problem types map:', problemTypesMap);
            setProblemTypes(problemTypesMap);
        } catch (err) {
            console.error('Error fetching problem types:', err);
        } finally {
            setProblemTypesLoading(false);
        }
    };
    
    // Helper function to get problem type name
    const getProblemTypeName = (ticket) => {
        // Prioritize problemTypeName directly from the ticket
        if (ticket.problemTypeName) {
            return ticket.problemTypeName;
        }
        
        // Check for problemType object with name
        if (ticket.problemType?.name) {
            return ticket.problemType.name;
        }
        
        // Fall back to lookup by ID if we have problem types loaded
        if (ticket.problemTypeId && problemTypes && problemTypes[ticket.problemTypeId]) {
            return problemTypes[ticket.problemTypeId];
        }
        
        // Last resort - use problemType directly if it's a string
        if (typeof ticket.problemType === 'string' && ticket.problemType) {
            return ticket.problemType;
        }
        
        // Default fallback
        return "Belirtilmemiş";
    };

    // Add a new useEffect to handle data dependencies
    useEffect(() => {
        if (!problemTypesLoading && Object.keys(problemTypes).length > 0) {
            console.log("Problem types loaded, updating tickets display");
            // Force re-render by creating a new array
            setTickets([...tickets]);
        }
    }, [problemTypes, problemTypesLoading]);

    const fetchCreatedTickets = async () => {
        try {
            setIsRefreshing(true);
            const response = await axios.get('/api/Ticket/created-tickets');
            console.log('Created tickets data:', response.data);
            setTickets(response.data);
            updateStats(response.data);
            setError('');
        } catch (err) {
            setError('Çağrılar yüklenirken bir hata oluştu.');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const updateStats = (ticketData) => {
        const newStats = {
            total: ticketData.length,
            completed: ticketData.filter(t => t.status === 'Completed').length,
            inProgress: ticketData.filter(t => t.status === 'In Progress').length,
            new: ticketData.filter(t => t.status === 'New').length,
            overdue: ticketData.filter(t => t.isSolutionOverdue).length,
            unassigned: ticketData.filter(t => !t.assignedDate || t.assignedDate === "0001-01-01T00:00:00").length
        };
        setStats(newStats);
    };

    const handleRefresh = () => {
            setLoading(true);
            fetchCreatedTickets();
    };

    const filteredTickets = tickets.filter(ticket => {
        // First apply text search
        const matchesSearch = Object.values(ticket).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Then apply category filter
        let matchesFilter = true;
        if (activeFilter === 'completed') {
            matchesFilter = ticket.status === 'Completed';
        } else if (activeFilter === 'inProgress') {
            matchesFilter = ticket.status === 'In Progress';
        } else if (activeFilter === 'new') {
            matchesFilter = ticket.status === 'New';
        } else if (activeFilter === 'overdue') {
            matchesFilter = ticket.isSolutionOverdue;
        } else if (activeFilter === 'unassigned') {
            matchesFilter = !ticket.assignedDate || ticket.assignedDate === "0001-01-01T00:00:00";
        }
        
        return matchesSearch && matchesFilter;
    });

    const handleFilterChange = (filterName) => {
        setActiveFilter(filterName);
    };

    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`, { state: { source: 'myCreatedTickets' } });
    };

    const handleEditClick = (e, ticketId) => {
        e.stopPropagation();
        navigate(`/tickets/edit/${ticketId}`);
    };

    // Helper to render assignment status
    const renderAssignmentStatus = (ticket) => {
        if (!ticket.assignedDate || ticket.assignedDate === "0001-01-01T00:00:00") {
            return (
                <Tooltip title="Henüz Atanmadı">
                    <Chip
                        icon={<HourglassEmptyIcon fontSize="small" />}
                        label="Atanmadı"
                        color="default"
                        size="small"
                        variant="outlined"
                    />
                </Tooltip>
            );
        }

        if (ticket.isAssignmentOverdue) {
            return (
                <Tooltip title={`Atama Süresi Aşıldı (${ticket.timeToAssignDisplay})`}>
                    <Chip
                        icon={<TimerOffIcon fontSize="small" />}
                        label="Atama Geç"
                        color="error"
                        size="small"
                    />
                </Tooltip>
            );
        }
        
        const assignedDate = new Date(ticket.assignedDate);
        return (
            <Tooltip title={`${assignedDate.toLocaleString('tr-TR')}`}>
                <Chip
                    icon={<AssignmentIndIcon fontSize="small" />}
                    label="Atandı"
                    color="success"
                    size="small"
                    variant="outlined"
                />
            </Tooltip>
        );
    };

    // Helper to render solution time
    const renderSolutionTime = (ticket) => {
        if (ticket.status === 'Completed') {
            return (
                <Tooltip title="Çözüldü">
                    <Chip
                        icon={<CheckCircleIcon fontSize="small" />}
                        label="Çözüldü"
                        color="success"
                        size="small"
                    />
                </Tooltip>
            );
        }

        if (ticket.isSolutionOverdue) {
            return (
                <Tooltip title={`Çözüm Süresi Aşıldı (${formatTimeTurkish(ticket.timeToSolveDisplay)})`}>
                    <Chip
                        icon={<TimerOffIcon fontSize="small" />}
                        label="Süre Aşıldı"
                        color="error"
                        size="small"
                        sx={{ 
                            animation: 'pulse 1.5s infinite',
                            '@keyframes pulse': {
                                '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
                                '70%': { boxShadow: '0 0 0 6px rgba(244, 67, 54, 0)' },
                                '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' },
                            },
                        }}
                    />
                </Tooltip>
            );
        }
        
        if (ticket.timeToSolve) {
            return (
                <Tooltip title={`Hedef Çözüm Süresi: ${formatTimeTurkish(ticket.timeToSolveDisplay)}`}>
                    <Chip
                        icon={<AlarmIcon fontSize="small" />}
                        label={formatTimeTurkish(ticket.timeToSolveDisplay)}
                        color="warning"
                        size="small"
                        variant="outlined"
                    />
                </Tooltip>
            );
        }
        
        return (
            <Typography variant="body2" color="text.secondary">
                Belirtilmemiş
            </Typography>
        );
    };

    // Format English time strings to Turkish
    const formatTimeTurkish = (timeString) => {
        if (!timeString) return 'Belirtilmemiş';
        
        // Convert "X hours, Y minutes" format to Turkish
        return timeString
            .replace(/hour(s)?/g, 'saat')
            .replace(/minute(s)?/g, 'dakika')
            .replace(/day(s)?/g, 'gün')
            .replace(/week(s)?/g, 'hafta')
            .replace(/month(s)?/g, 'ay');
    };

    const renderLoadingState = (message) => (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box spacing={2}>
                    <LinearProgress />
                    <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                        {message}
                    </Typography>
                </Box>
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
    if (loading) {
        return renderLoadingState("Çağrılar yükleniyor...");
    }

    // Render error states
    if (error) {
        return renderErrorState(error, handleRefresh);
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
                <Box sx={{ mb: 4 }}>
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
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'medium' }}>
                                {activeFilter === 'all' ? 'Açtığım Çağrılar' : 
                                 activeFilter === 'completed' ? 'Tamamlanan Çağrılarım' :
                                 activeFilter === 'inProgress' ? 'Devam Eden Çağrılarım' :
                                 activeFilter === 'new' ? 'Yeni Çağrılarım' :
                                 activeFilter === 'overdue' ? 'Süresi Aşılan Çağrılarım' :
                                 activeFilter === 'unassigned' ? 'Atanmamış Çağrılarım' : 'Açtığım Çağrılar'}
                                    </Typography>
                                </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {activeFilter !== 'all' && (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleFilterChange('all')}
                                >
                                    Tüm Çağrılara Dön
                                </Button>
                            )}
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
                    </Box>

                    {/* Subtitle */}
                        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                            Oluşturduğunuz tüm çağrıları buradan takip edebilirsiniz
                        </Typography>

                    {/* Stats Cards */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card 
                                sx={{ 
                                    bgcolor: theme.palette.primary.light, 
                                    color: 'white', 
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    ...(activeFilter === 'all' && {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)'
                                    })
                                }}
                                onClick={() => handleFilterChange('all')}
                            >
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                                        Toplam Çağrı
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.total}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card 
                                sx={{ 
                                    bgcolor: theme.palette.success.light, 
                                    color: 'white', 
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    ...(activeFilter === 'completed' && {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.5)'
                                    })
                                }}
                                onClick={() => handleFilterChange('completed')}
                            >
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                                        Tamamlanan
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.completed}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card 
                                sx={{ 
                                    bgcolor: theme.palette.warning.light, 
                                    color: 'white', 
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    ...(activeFilter === 'inProgress' && {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 2px rgba(255, 152, 0, 0.5)'
                                    })
                                }}
                                onClick={() => handleFilterChange('inProgress')}
                            >
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                                        Devam Eden
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.inProgress}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card 
                                sx={{ 
                                    bgcolor: theme.palette.info.light, 
                                    color: 'white', 
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    ...(activeFilter === 'new' && {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 2px rgba(33, 150, 243, 0.5)'
                                    })
                                }}
                                onClick={() => handleFilterChange('new')}
                            >
                                    <CardContent>
                                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                                        Yeni
                                        </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.new}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card 
                                sx={{ 
                                    bgcolor: theme.palette.error.light, 
                                    color: 'white', 
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    ...(activeFilter === 'overdue' && {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 2px rgba(244, 67, 54, 0.5)'
                                    })
                                }}
                                onClick={() => handleFilterChange('overdue')}
                            >
                                    <CardContent>
                                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                                        Süresi Aşılanlar
                                        </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.overdue}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                            <Card 
                                sx={{ 
                                    bgcolor: '#757575', 
                                    color: 'white', 
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 4
                                    },
                                    ...(activeFilter === 'unassigned' && {
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 2px rgba(117, 117, 117, 0.5)'
                                    })
                                }}
                                onClick={() => handleFilterChange('unassigned')}
                            >
                                    <CardContent>
                                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>
                                            Atanmamış
                                        </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {stats.unassigned}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                
                    {/* Overdue Alert */}
                    {activeFilter === 'overdue' && stats.overdue > 0 && (
                        <Alert 
                            severity="warning" 
                            icon={<TimerOffIcon />}
                            sx={{ mb: 3, borderRadius: 2 }}
                        >
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                Dikkat: {stats.overdue} çağrının çözüm süresi aşıldı!
                            </Typography>
                            <Typography variant="body2">
                                Çözüm süresi aşılan çağrılar kırmızı renkle işaretlenmiştir. İlgili birimlerle iletişime geçerek durumu takip ediniz.
                            </Typography>
                        </Alert>
                    )}

                    {/* Search Field */}
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

                    {/* My Created Tickets Table */}
                        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'background.default' }}>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Kayıt No</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Konu</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Problem Tipi</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Grup</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Durum</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Atama Durumu</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Çözüm Durumu</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2 }}>Bekleyen Süre</TableCell>
                                        <TableCell sx={{ fontWeight: 600, py: 2 }}>Öncelik</TableCell>
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
                                            },
                                            ...(ticket.isSolutionOverdue && {
                                                backgroundColor: '#FFEBEE',
                                                border: '1.5px solid',
                                                borderColor: theme => theme.palette.error.main,
                                                boxShadow: '0 2px 8px 0 rgba(244,67,54,0.10)',
                                                '&:hover': {
                                                    backgroundColor: '#FFCDD2',
                                                    opacity: 0.95
                                                },
                                            })
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
                                                    label={getProblemTypeName(ticket)}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                            {ticket.group?.name || 'Belirtilmemiş'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusTranslation(ticket.status)}
                                                    color={statusColors[ticket.status]}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                            {renderAssignmentStatus(ticket)}
                                        </TableCell>
                                        <TableCell>
                                            {renderSolutionTime(ticket)}
                                            </TableCell>
                                            <TableCell>
                                            <Tooltip title="Toplam Bekleyen Süre">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AccessTimeIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {ticket.idleDurationDisplay ? formatTimeTurkish(ticket.idleDurationDisplay) : 'Belirtilmemiş'}
                                                    </Typography>
                                                </Box>
                                                </Tooltip>
                                            </TableCell>
                                        <TableCell>
                                            <PriorityChip priority={ticket.priority} />
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
                                            colSpan={10} 
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
                </Box>
            </Paper>
        </Container>
    );
}

export default MyCreatedTicketsPage; 