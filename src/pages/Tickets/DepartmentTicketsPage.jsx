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
    Avatar,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Info as InfoIcon,
    Group as GroupIcon,
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    NewReleases as NewIcon,
    PriorityHigh as PriorityIcon,
    Assignment as AssignmentIcon,
    AccessTime as AccessTimeIcon,
    ArrowBack as ArrowBackIcon,
    Bolt as BoltIcon,
    Alarm as AlarmIcon,
    WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDepartmentTickets, getHighPriorityTickets } from '../../api/TicketService';
import { TICKET_PRIORITIES, TICKET_STATUS_COLORS, getStatusTranslation } from '../../utils/ticketConfig';
import PriorityChip from '../../components/PriorityChip';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import httpClient from '../../api/httpClient';

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

// Helper function to extract just the time part from the timeToAssignDisplay
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

// Helper function to safely get the timeToAssignDisplay and convert it to Turkish
const getTimeToAssignDisplay = (ticket) => {
  if (!ticket || !ticket.timeToAssignDisplay) return '';
  return extractTimeDisplay(ticket.timeToAssignDisplay);
};

// Helper function to convert English time expressions to Turkish (kept for backward compatibility)
const translateTimeDisplay = (timeDisplayEnglish) => {
  return extractTimeDisplay(timeDisplayEnglish);
};

function DepartmentTicketsPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const [tickets, setTickets] = useState([]);
    const [highPriorityTickets, setHighPriorityTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [problemTypesLoading, setProblemTypesLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [viewingHighPriorityOnly, setViewingHighPriorityOnly] = useState(false);
    const [problemTypes, setProblemTypes] = useState({});
    const [viewingOverdueOnly, setViewingOverdueOnly] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchTickets(),
                fetchHighPriorityTickets(),
                fetchProblemTypes()
            ]);
        };
        
        loadData();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await getDepartmentTickets();
            console.log('Department tickets:', response.data);
            setTickets(response.data);
            setError('');
        } catch (err) {
            setError('Grup çağrıları yüklenirken bir hata oluştu.');
            console.error('Error fetching department tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHighPriorityTickets = async () => {
        try {
            const response = await getHighPriorityTickets();
            console.log('High priority tickets:', response.data);
            setHighPriorityTickets(response.data);
        } catch (err) {
            console.error('Error fetching high priority tickets:', err);
        }
    };

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

    // Add a new useEffect to handle data dependencies
    useEffect(() => {
        if (!problemTypesLoading && Object.keys(problemTypes).length > 0) {
            console.log("Problem types loaded, updating tickets display");
            // Force re-render by creating a new array
            setTickets([...tickets]);
            setHighPriorityTickets([...highPriorityTickets]);
        }
    }, [problemTypes, problemTypesLoading]);

    const handleStatusCardClick = (status) => {
        setSelectedStatus(status);
        setViewingHighPriorityOnly(false);
    };

    const handleHighPriorityCardClick = () => {
        setViewingHighPriorityOnly(true);
        setSelectedStatus('all');
        setViewingOverdueOnly(false);
    };

    const handleOverdueCardClick = () => {
        setViewingOverdueOnly(true);
        setViewingHighPriorityOnly(false);
        setSelectedStatus('all');
    };

    const handleResetHighPriorityView = () => {
        setViewingHighPriorityOnly(false);
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

    const filteredTickets = (() => {
        let ticketsToFilter;
        
        if (viewingHighPriorityOnly) {
            ticketsToFilter = highPriorityTickets;
        } else if (viewingOverdueOnly) {
            ticketsToFilter = tickets.filter(t => !t.userId && t.timeToAssign && t.isAssignmentOverdue);
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

    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`, { state: { source: 'departmentTickets' } });
    };

    const handleEditClick = (e, ticketId) => {
        e.stopPropagation();
        navigate(`/tickets/edit/${ticketId}`, { state: { source: 'departmentTickets' } });
    };

    // Helper function to get problem type name
    const getProblemTypeName = (ticket) => {
        console.log('Getting problem type for ticket:', ticket.id, 'problemTypeId:', ticket.problemTypeId, 'problemTypes:', problemTypes);

        // Case 3: If we have a problemTypeId and we've loaded the problem types mapping
        if (ticket.problemTypeId !== undefined && ticket.problemTypeId !== null && 
            problemTypes && problemTypes[ticket.problemTypeId]) {
            console.log('Case 3: Found problemTypeId lookup:', problemTypes[ticket.problemTypeId]);
            return problemTypes[ticket.problemTypeId];
        }
        
        // Case 1: If the full problemType object with name exists
        if (ticket.problemType?.name) {
            console.log('Case 1: Found problemType.name:', ticket.problemType.name);
            return ticket.problemType.name;
        }
        
        // Case 2: If there's a direct problemTypeName property
        if (ticket.problemTypeName) {
            console.log('Case 2: Found problemTypeName:', ticket.problemTypeName);
            return ticket.problemTypeName;
        }
        
        console.log('No problem type found, using default');
        // Default fallback
        return "Belirtilmemiş";
    };

    // Helper function to render assignment time chip without the "0" issue
    const renderAssignmentTimeChip = (ticket) => {
        if (!ticket.userId && ticket.timeToAssign) {
            const translatedTime = getTimeToAssignDisplay(ticket);
            
            if (ticket.isAssignmentOverdue) {
                return (
                    <Chip
                        icon={<WarningAmberIcon fontSize="small" />}
                        label={translatedTime}
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
            } else {
                return (
                    <Chip
                        icon={<AlarmIcon fontSize="small" />}
                        label={translatedTime}
                        color="info"
                        size="small"
                        variant="outlined"
                    />
                );
            }
        } else if (ticket.userId) {
            return (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Atanmış
                </Typography>
            );
        } else {
            return (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Belirtilmemiş
                </Typography>
            );
        }
    };

    if (loading || problemTypesLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <LinearProgress />
                        <Typography align="center" color="text.secondary">
                            {loading ? 'Grup çağrıları yükleniyor...' : 'Problem tipleri yükleniyor...'}
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
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            Grubumun Çağrıları
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Grubunuza atanmış tüm çağrıları buradan takip edebilirsiniz
                    </Typography>
                </Box>

                {/* Summary Cards */}
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
                            <CardContent 
                                sx={{ 
                                    position: 'relative', 
                                    zIndex: 1, 
                                    p: 3,
                                    height: '100%',
                                }}
                            >
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
                                        Gruptaki tüm çağrılar
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
                                    {tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}
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
                                    height: '100%',
                                    cursor: 'pointer',
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
                                        Atama Süresi Geçen
                                    </Typography>
                                    <WarningAmberIcon sx={{ color: '#fff', opacity: 0.8, fontSize: 30 }} />
                                </Box>
                                <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                                    {tickets.filter(t => !t.userId && t.timeToAssign && t.isAssignmentOverdue).length}
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
                                        Acilen atanmalı
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
                </Grid>

                {/* View Toggle for High Priority */}
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

                {/* View Toggle for Overdue Assignments */}
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

                {error && (
                    <Fade in={true}>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    </Fade>
                )}

                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    {!viewingHighPriorityOnly && !viewingOverdueOnly && (
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

                {viewingOverdueOnly && (
                    <Alert 
                        severity="warning" 
                        icon={<WarningAmberIcon />}
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
                            Atama Süresi Aşılmış Çağrılar ({filteredTickets.length})
                        </Typography>
                        <Typography variant="body2">
                            Bu çağrılar acilen atanmalıdır. Atama süresi aşılmış çağrılar hizmet kalitesi standartlarınızı etkileyebilir.
                        </Typography>
                    </Alert>
                )}

                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Kayıt No</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Konu</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Problem Tipi</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Kalan Süre</TableCell>
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
                                        height: '60px',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                        ...((!ticket.userId && ticket.timeToAssign && ticket.isAssignmentOverdue) && {
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
                                                label={getProblemTypeName(ticket)}
                                                variant="outlined"
                                                size="small"
                                                sx={{ minWidth: '80px' }}
                                            />
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
                                        <Box 
                                            sx={{ 
                                                height: 32, 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                // Prevent any unwanted text from showing
                                                '& > *': { whiteSpace: 'nowrap' },
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {renderAssignmentTimeChip(ticket)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                            <PriorityChip priority={ticket.priority} />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2">
                                                {`${ticket.createdBy?.name || ''} ${ticket.createdBy?.surname || ''}`}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ height: 32, display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2">
                                                {`${ticket.user?.name || ''} ${ticket.user?.surname || ''}`}
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