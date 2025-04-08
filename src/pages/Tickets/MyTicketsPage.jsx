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
    IconButton,
    Tooltip,
    LinearProgress,
    Divider,
    useTheme,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Fade,
} from '@mui/material';
import {
    Search as SearchIcon,
    AccessTime as AccessTimeIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    NewReleases as NewIcon,
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    Description as DescriptionIcon,
    ArrowForward as ArrowForwardIcon,
    Bolt as BoltIcon,
    Info as InfoIcon,
    Edit as EditIcon,
    WarningAmber as WarningAmberIcon,
    HourglassEmpty as HourglassEmptyIcon,
    Alarm as AlarmIcon,
    TimerOff as TimerOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMyTickets, getHighPriorityTickets } from '../../api/TicketService';
import PriorityChip from '../../components/PriorityChip';
import { TICKET_PRIORITIES, TICKET_STATUS_COLORS, getStatusTranslation } from '../../utils/ticketConfig';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// Use MUI theme color names for status colors
const statusColors = {
    'Open': 'info',
    'InProgress': 'warning',
    'UnderReview': 'secondary',
    'ReadyForTesting': 'primary',
    'Testing': 'primary',
    'Resolved': 'success',
    'Closed': 'success',
    'Reopened': 'warning',
    'Cancelled': 'error',
};

const statusTranslations = {
    'Open': 'Yeni',
    'InProgress': 'Devam Eden',
    'UnderReview': 'İnceleme',
    'ReadyForTesting': 'Test için Hazır',
    'Testing': 'Test',
    'Resolved': 'Tamamlanan',
    'Closed': 'Kapalı',
    'Reopened': 'Yeniden Açılan',
    'Cancelled': 'İptal Edilen'
};

const statusIcons = {
    'Open': <NewIcon />,
    'InProgress': <WarningIcon />,
    'UnderReview': <WarningIcon />,
    'ReadyForTesting': <WarningIcon />,
    'Testing': <WarningIcon />,
    'Resolved': <CheckCircleIcon />,
    'Closed': <CheckCircleIcon />,
    'Reopened': <WarningIcon />,
    'Cancelled': <ErrorIcon />,
};

// Helper function to extract time display into Turkish format
const extractTimeDisplay = (timeDisplay) => {
  if (!timeDisplay) return '';
  
  // Clean the string by removing any trailing numbers at the end
  timeDisplay = timeDisplay.replace(/\s+\d+$/, '');
  
  // Handle edge cases that might cause rendering issues
  if (timeDisplay === '0' || timeDisplay === 0 || !timeDisplay.trim()) {
    return '';
  }
  
  // Handle "1 minute" pattern
  if (timeDisplay.includes('minute')) {
    const match = timeDisplay.match(/(\d+)\s+minute/);
    if (match && match[1]) {
      return `${match[1]} dakika`;
    }
  }
  
  // Handle "1 hour" pattern
  if (timeDisplay.includes('hour')) {
    const match = timeDisplay.match(/(\d+)\s+hour/);
    if (match && match[1]) {
      return `${match[1]} saat`;
    }
  }
  
  // Handle "1 day" pattern
  if (timeDisplay.includes('day')) {
    const match = timeDisplay.match(/(\d+)\s+day/);
    if (match && match[1]) {
      return `${match[1]} gün`;
    }
  }
  
  // Handle "1 week" pattern
  if (timeDisplay.includes('week')) {
    const match = timeDisplay.match(/(\d+)\s+week/);
    if (match && match[1]) {
      return `${match[1]} hafta`;
    }
  }
  
  // Handle combined "1 hour 30 minutes" patterns
  if (timeDisplay.includes('hour') && timeDisplay.includes('minute')) {
    const hourMatch = timeDisplay.match(/(\d+)\s+hour/);
    const minuteMatch = timeDisplay.match(/(\d+)\s+minute/);
    
    let result = '';
    if (hourMatch && hourMatch[1]) {
      result += `${hourMatch[1]} saat`;
    }
    
    if (minuteMatch && minuteMatch[1]) {
      if (result) result += ' ';
      result += `${minuteMatch[1]} dakika`;
    }
    
    return result;
  }
  
  return timeDisplay;
};

// Helper function to get the solution time display in Turkish
const getTimeToSolveDisplay = (ticket) => {
  if (!ticket || !ticket.timeToSolveDisplay) return '';
  return extractTimeDisplay(ticket.timeToSolveDisplay);
};

function MyTicketsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [highPriorityTickets, setHighPriorityTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [viewingHighPriorityOnly, setViewingHighPriorityOnly] = useState(false);
    const [viewingOverdueOnly, setViewingOverdueOnly] = useState(false);

    useEffect(() => {
        fetchMyTickets();
        fetchHighPriorityTickets();
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

    const fetchHighPriorityTickets = async () => {
        try {
            const response = await getHighPriorityTickets();
            setHighPriorityTickets(response.data);
        } catch (err) {
            console.error('Error fetching high priority tickets:', err);
        }
    };

    const handleHighPriorityCardClick = () => {
        setViewingHighPriorityOnly(true);
        setSelectedStatus('all');
        setViewingOverdueOnly(false);
    };

    const handleResetHighPriorityView = () => {
        setViewingHighPriorityOnly(false);
    };
    
    const handleOverdueCardClick = () => {
        setViewingOverdueOnly(true);
        setViewingHighPriorityOnly(false);
        setSelectedStatus('all');
    };
    
    const handleResetOverdueView = () => {
        setViewingOverdueOnly(false);
    };

    const handleAllTicketsCardClick = () => {
        setViewingHighPriorityOnly(false);
        setViewingOverdueOnly(false);
        setSelectedStatus('all');
        setSearchTerm('');
    };

    const getStatusStats = () => {
        return tickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
        }, {});
    };

    const handleStatusCardClick = (status) => {
        setSelectedStatus(status);
        setViewingHighPriorityOnly(false);
    };

    const filteredTickets = (() => {
        let ticketsToFilter;
        
        if (viewingHighPriorityOnly) {
            ticketsToFilter = highPriorityTickets;
        } else if (viewingOverdueOnly) {
            ticketsToFilter = tickets.filter(t => t.status === 'InProgress' && t.isSolutionOverdue);
        } else {
            ticketsToFilter = tickets;
        }
        
        return ticketsToFilter.filter(ticket => {
            const matchesSearch = Object.values(ticket).some(value =>
                value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
            const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    })();

    const statusStats = getStatusStats();

    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`, { state: { source: 'myTickets' } });
    };

    const handleEditClick = (e, ticketId) => {
        e.stopPropagation();
        navigate(`/tickets/edit/${ticketId}`, { state: { source: 'myTickets' } });
    };

    // Helper function to render solution time chip
    const renderSolutionTimeChip = (ticket) => {
        if (ticket.status === 'InProgress' && ticket.timeToSolve) {
            const translatedTime = getTimeToSolveDisplay(ticket);
            
            // If solution time is overdue
            if (ticket.isSolutionOverdue) {
                return (
                    <Chip
                        icon={<TimerOffIcon fontSize="small" />}
                        label={`${translatedTime} (Aşıldı)`}
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
                );
            } 
            // Check if we're nearing the solution time (50% of time has passed)
            else {
                return (
                    <Chip
                        icon={<AlarmIcon fontSize="small" />}
                        label={translatedTime}
                        color="warning"
                        size="small"
                        variant="outlined"
                    />
                );
            }
        } else if (ticket.status !== 'InProgress') {
            return null; // Don't show timer for non-in-progress tickets
        } else {
            return (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Belirtilmemiş
                </Typography>
            );
        }
    };

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
                    {viewingHighPriorityOnly ? 'Kritik Öncelikli Çağrılar' : 'Üzerimdeki Çağrılar'}
                </Typography>
            </Box>

            {/* Stats Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 28px rgba(25, 118, 210, 0.25)',
                            },
                            cursor: 'pointer'
                        }}
                        onClick={handleAllTicketsCardClick}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                opacity: 0.9,
                                zIndex: 0,
                            }} 
                        />
                        <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                    Toplam Çağrı
                                </Typography>
                                <AssignmentIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 30 }} />
                            </Box>
                            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                {tickets.length}
                            </Typography>
                            <Box sx={{ 
                                width: '40px', 
                                height: '4px', 
                                bgcolor: '#fff', 
                                borderRadius: '2px',
                                mb: 2,
                                opacity: 0.7
                            }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                                    Atanan tüm çağrıların sayısı
                                </Typography>
                                <ArrowForwardIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 16 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(255, 152, 0, 0.15)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 28px rgba(255, 152, 0, 0.25)',
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
                                opacity: 0.9,
                                zIndex: 0,
                            }} 
                        />
                        <CardContent 
                            onClick={() => handleStatusCardClick('InProgress')} 
                            sx={{ 
                                position: 'relative', 
                                zIndex: 1, 
                                p: 3, 
                                cursor: 'pointer',
                                height: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                    Devam Eden
                                </Typography>
                                <WarningIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 30 }} />
                            </Box>
                            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                {tickets.filter(t => t.status === 'InProgress').length}
                            </Typography>
                            <Box sx={{ 
                                width: '40px', 
                                height: '4px', 
                                bgcolor: '#fff', 
                                borderRadius: '2px',
                                mb: 2,
                                opacity: 0.7
                            }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                                    Çalışma devam ediyor
                                </Typography>
                                <ArrowForwardIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 16 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.15)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 28px rgba(76, 175, 80, 0.25)',
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                                opacity: 0.9,
                                zIndex: 0,
                            }} 
                        />
                        <CardContent 
                            onClick={() => handleStatusCardClick('Resolved')} 
                            sx={{ 
                                position: 'relative', 
                                zIndex: 1, 
                                p: 3, 
                                cursor: 'pointer',
                                height: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                    Tamamlanan
                                </Typography>
                                <CheckCircleIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 30 }} />
                            </Box>
                            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                {tickets.filter(t => t.status === 'Resolved').length}
                            </Typography>
                            <Box sx={{ 
                                width: '40px', 
                                height: '4px', 
                                bgcolor: '#fff', 
                                borderRadius: '2px',
                                mb: 2,
                                opacity: 0.7
                            }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                                    Tamamlanmış çağrılar
                                </Typography>
                                <ArrowForwardIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 16 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(244, 67, 54, 0.15)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 28px rgba(244, 67, 54, 0.25)',
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                                opacity: 0.9,
                                zIndex: 0,
                            }} 
                        />
                        <CardContent 
                            onClick={handleHighPriorityCardClick} 
                            sx={{ 
                                position: 'relative', 
                                zIndex: 1, 
                                p: 3, 
                                cursor: 'pointer',
                                height: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                    Kritik Öncelikli
                                </Typography>
                                <BoltIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 30 }} />
                            </Box>
                            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                {highPriorityTickets.length}
                            </Typography>
                            <Box sx={{ 
                                width: '40px', 
                                height: '4px', 
                                bgcolor: '#fff', 
                                borderRadius: '2px',
                                mb: 2,
                                opacity: 0.7
                            }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                                    Hemen ilgilenilmeli
                                </Typography>
                                <ArrowForwardIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 16 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(158, 158, 158, 0.15)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 28px rgba(158, 158, 158, 0.25)',
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #757575 0%, #424242 100%)',
                                opacity: 0.9,
                                zIndex: 0,
                            }} 
                        />
                        <CardContent 
                            onClick={() => handleStatusCardClick('Cancelled')} 
                            sx={{ 
                                position: 'relative', 
                                zIndex: 1, 
                                p: 3, 
                                cursor: 'pointer',
                                height: '100%',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                    İptal Edilen
                                </Typography>
                                <ErrorIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 30 }} />
                            </Box>
                            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                {tickets.filter(t => t.status === 'Cancelled').length}
                            </Typography>
                            <Box sx={{ 
                                width: '40px', 
                                height: '4px', 
                                bgcolor: '#fff', 
                                borderRadius: '2px',
                                mb: 2,
                                opacity: 0.7
                            }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                                    İptal edilmiş çağrılar
                                </Typography>
                                <ArrowForwardIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 16 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 12px 28px rgba(233, 30, 99, 0.25)',
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                background: 'linear-gradient(135deg, #EC407A 0%, #E91E63 100%)',
                                opacity: 0.9,
                                zIndex: 0,
                            }} 
                        />
                        <CardContent 
                            onClick={handleOverdueCardClick}
                            sx={{ 
                                position: 'relative', 
                                zIndex: 1, 
                                p: 3,
                                height: '100%',
                                cursor: 'pointer',
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                                    Çözüm Süresi Aşılan
                                </Typography>
                                <TimerOffIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 30 }} />
                            </Box>
                            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                {tickets.filter(t => t.status === 'InProgress' && t.isSolutionOverdue).length}
                            </Typography>
                            <Box sx={{ 
                                width: '40px', 
                                height: '4px', 
                                bgcolor: '#fff', 
                                borderRadius: '2px',
                                mb: 2,
                                opacity: 0.7
                            }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#fff', opacity: 0.9 }}>
                                    Acilen tamamlanmalı
                                </Typography>
                                <ArrowForwardIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 16 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* View Toggle */}
            {viewingHighPriorityOnly && (
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleResetHighPriorityView}
                        color="primary"
                        sx={{ borderRadius: 2 }}
                    >
                        Tüm Çağrılara Dön
                    </Button>
                </Box>
            )}
            
            {/* View Toggle for Overdue Solution Time */}
            {viewingOverdueOnly && (
                <Box sx={{ mb: 3 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleResetOverdueView}
                        color="secondary"
                        sx={{ borderRadius: 2 }}
                    >
                        Tüm Çağrılara Dön
                    </Button>
                </Box>
            )}

            {/* Status Filter Cards */}
            {!viewingHighPriorityOnly && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {Object.entries(statusStats)
                        .filter(([status]) => status !== 'InProgress' && status !== 'Cancelled')
                        .map(([status, count]) => (
                        <Grid item xs={12} sm={6} md={3} key={status}>
                            <Paper
                                elevation={0}
                                onClick={() => setSelectedStatus(status)}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: selectedStatus === status ? 'rgba(0,0,0,0.05)' : 'background.paper',
                                    border: 1,
                                    borderColor: selectedStatus === status ? statusColors[status] : 'divider',
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
                                            bgcolor: statusColors[status],
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        {statusIcons[status]}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: 'bold', 
                                            color: selectedStatus === status ? statusColors[status] : 'text.primary'
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
            )}

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
                {!viewingHighPriorityOnly && (
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
                )}
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
            
            {viewingOverdueOnly && (
                <Alert 
                    severity="error" 
                    icon={<TimerOffIcon />}
                    sx={{ 
                        mb: 3,
                        backgroundColor: 'rgba(233, 30, 99, 0.12)',
                        '.MuiAlert-icon': {
                            color: '#E91E63',
                        },
                        '.MuiAlert-message': {
                            color: '#E91E63',
                        }
                    }}
                >
                    <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                        Çözüm Süresi Aşılmış Çağrılar ({filteredTickets.length})
                    </Typography>
                    <Typography variant="body2">
                        Bu çağrıların çözüm süresi aşılmıştır. Acilen tamamlanmalı veya süre uzatımı talep edilmelidir. Çözüm süresi aşılan çağrılar hizmet kalitesi standartlarınızı etkileyebilir.
                    </Typography>
                </Alert>
            )}

            {/* Tickets Table */}
            <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Kayıt No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Konu</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Lokasyon</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Departman</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Öncelik</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Çözüm Süresi</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Oluşturulma</TableCell>
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
                                    height: '60px',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                    ...(ticket.status === 'InProgress' && ticket.isSolutionOverdue && {
                                        borderLeft: '4px solid',
                                        borderColor: 'error.main',
                                        bgcolor: 'error.lighter',
                                        '&:hover': {
                                            bgcolor: 'error.light',
                                        },
                                    })
                                }}
                            >
                                <TableCell>
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            #{ticket.registrationNumber}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {ticket.subject}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                        <Chip
                                            label={getStatusTranslation(ticket.status)}
                                            color={statusColors[ticket.status]}
                                            size="small"
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2">
                                            {ticket.location}
                                            {ticket.room && ` (Oda: ${ticket.room})`}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2">
                                            {ticket.department?.name || 'Belirtilmemiş'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                        <PriorityChip priority={ticket.priority} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ 
                                        height: 32, 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        // Prevent any unwanted text from showing
                                        '& > *': { whiteSpace: 'nowrap' },
                                        overflow: 'hidden'
                                    }}>
                                        {renderSolutionTimeChip(ticket)}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDistanceToNow(new Date(ticket.createdDate), { 
                                                addSuffix: true,
                                                locale: tr 
                                            })}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
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
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredTickets.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
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
        </Container>
    );
}

export default MyTicketsPage; 