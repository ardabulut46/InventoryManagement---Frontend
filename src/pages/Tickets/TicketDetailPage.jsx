import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  Card,
  CardContent,
  Avatar,
  Stack,
  LinearProgress,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Fade,
  Slide,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  AttachFile as AttachmentIcon,
  Download as DownloadIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityHighIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  Description as DescriptionIcon,
  SwapHoriz as SwapHorizIcon,
  Cancel as CancelIcon,
  Alarm as AlarmIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { getTicketById, assignTicket, transferTicket } from '../../api/TicketService';
import { API_URL } from '../../config';
import { getCurrentUser } from '../../api/auth';
import TicketNotes from '../../components/TicketNotes';
import CancelReasonService from '../../api/CancelReasonService';
import httpClient from '../../api/httpClient';
import { TICKET_STATUS_TRANSLATIONS, getStatusTranslation, TICKET_STATUS_PROGRESS } from '../../utils/ticketConfig';

const HEX_STATUS_COLORS = {
  'Open': '#2196f3',
  'InProgress': '#ff9800',
  'UnderReview': '#9c27b0',
  'ReadyForTesting': '#3f51b5',
  'Testing': '#2196f3',
  'Resolved': '#4caf50',
  'Closed': '#4caf50',
  'Reopened': '#ff9800',
  'Cancelled': '#f44336',
};

const priorityColors = {
  1: '#f44336', // Critical
  2: '#ff9800', // High
  3: '#ffeb3b', // Medium
  4: '#4caf50', // Low
};

const priorityLabels = {
  1: 'Kritik',
  2: 'Yüksek',
  3: 'Orta',
  4: 'Düşük',
};

function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`ticket-tabpanel-${index}`}
      aria-labelledby={`ticket-tab-${index}`}
      sx={{ mt: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

// Helper function to convert English time expressions to Turkish
const translateTimeDisplay = (timeDisplayEnglish) => {
  if (!timeDisplayEnglish) return '';
  
  let translatedText = timeDisplayEnglish;
  
  // Handle compound time expressions (e.g., "1 hour 30 minutes")
  if (timeDisplayEnglish.includes('hour') && timeDisplayEnglish.includes('minute')) {
    translatedText = timeDisplayEnglish
      .replace('1 hour', '1 saat')
      .replace(/(\d+) hours/, '$1 saat')
      .replace('1 minute', '1 dakika')
      .replace(/(\d+) minutes/, '$1 dakika');
    return translatedText;
  }
  
  // Handle minutes
  if (timeDisplayEnglish.includes('minute')) {
    translatedText = timeDisplayEnglish
      .replace('1 minute', '1 dakika')
      .replace(/(\d+) minutes/, '$1 dakika');
    return translatedText;
  }
  
  // Handle hours
  if (timeDisplayEnglish.includes('hour')) {
    translatedText = timeDisplayEnglish
      .replace('1 hour', '1 saat')
      .replace(/(\d+) hours/, '$1 saat');
    return translatedText;
  }
  
  // Handle days
  if (timeDisplayEnglish.includes('day')) {
    translatedText = timeDisplayEnglish
      .replace('1 day', '1 gün')
      .replace(/(\d+) days/, '$1 gün');
    return translatedText;
  }
  
  // Handle weeks
  if (timeDisplayEnglish.includes('week')) {
    translatedText = timeDisplayEnglish
      .replace('1 week', '1 hafta')
      .replace(/(\d+) weeks/, '$1 hafta');
    return translatedText;
  }
  
  // Handle months
  if (timeDisplayEnglish.includes('month')) {
    translatedText = timeDisplayEnglish
      .replace('1 month', '1 ay')
      .replace(/(\d+) months/, '$1 ay');
    return translatedText;
  }
  
  // Return original if no match
  return translatedText;
};

function TicketDetailPage() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const currentUser = getCurrentUser();
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    groupId: '',
    subject: '',
    description: '',
  });
  const [groups, setGroups] = useState([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReasons, setCancelReasons] = useState([]);
  const [cancelData, setCancelData] = useState({
    cancelReasonId: '',
    notes: ''
  });

  const statusColors = HEX_STATUS_COLORS;

  // Determine the source of navigation (where user came from)
  const source = location.state?.source || 'default';

  // Function to handle back button click based on source
  const handleBackButtonClick = () => {
    switch(source) {
      case 'myTickets':
        navigate('/tickets/my-tickets');
        break;
      case 'departmentTickets':
        navigate('/tickets/department');
        break;
      case 'myCreatedTickets':
        navigate('/tickets/my-created-tickets');
        break;
      default:
        navigate('/tickets');
        break;
    }
  };

  // Function to get back button text based on source
  const getBackButtonText = () => {
    switch(source) {
      case 'myTickets':
        return 'Üzerimdeki Çağrılara Dön';
      case 'departmentTickets':
        return 'Grubumun Çağrılarına Dön';
      case 'myCreatedTickets':
        return 'Oluşturduğum Çağrılara Dön';
      default:
        return 'Çağrılara Dön';
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchGroups();
    fetchCancelReasons();
  }, [id]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/api/Group`);
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchCancelReasons = async () => {
    try {
      const response = await CancelReasonService.getActiveCancelReasons();
      setCancelReasons(response.data);
    } catch (err) {
      console.error('Error fetching cancel reasons:', err);
    }
  };

  const fetchTicket = async () => {
    try {
      const response = await getTicketById(id);
      console.log('Ticket data:', response.data);
      setTicket(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Çağrı detayları yüklenirken bir hata oluştu.');
    }
  };

  const handleCloseTicket = () => {
    navigate(`/tickets/${id}/solutions/create`, { state: { isClosing: true } });
  };

  const handleAssignConfirmOpen = () => {
    setAssignDialogOpen(true);
  };

  const handleAssignConfirmClose = () => {
    setAssignDialogOpen(false);
  };

  const handleAssignTicket = async () => {
    try {
      await assignTicket(id);
      handleAssignConfirmClose();
      setSuccessMessage('Çağrı başarıyla üzerinize atandı!');
      await fetchTicket(); // Refresh ticket data
    } catch (err) {
      console.error('Error assigning ticket:', err);
      setError('Çağrı atanırken bir hata oluştu.');
    }
  };

  const getStatusProgress = () => {
    return TICKET_STATUS_PROGRESS[ticket?.status] || 0;
  };

  const getStatusColor = () => {
    return statusColors[ticket?.status] || theme.palette.primary.main;
  };

  const handleTransferDialogOpen = () => {
    setTransferDialogOpen(true);
  };

  const handleTransferDialogClose = () => {
    setTransferDialogOpen(false);
    setTransferData({
      groupId: '',
      subject: '',
      description: '',
    });
  };

  const handleTransferDataChange = (e) => {
    const { name, value } = e.target;
    setTransferData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransferTicket = async () => {
    try {
      await transferTicket(id, transferData);
      handleTransferDialogClose();
      await fetchTicket();
    } catch (err) {
      console.error('Error transferring ticket:', err);
      setError('Çağrı transfer edilirken bir hata oluştu.');
    }
  };

  const handleCancelDialogOpen = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setCancelData({
      cancelReasonId: '',
      notes: ''
    });
  };

  const handleCancelDataChange = (e) => {
    const { name, value } = e.target;
    setCancelData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelTicket = async () => {
    try {
      await httpClient.post(`/api/Ticket/${id}/cancel`, cancelData);
      handleCancelDialogClose();
      setSuccessMessage('Çağrı başarıyla iptal edildi!');
      await fetchTicket(); // Refresh ticket data
    } catch (err) {
      console.error('Error cancelling ticket:', err);
      setError('Çağrı iptal edilirken bir hata oluştu.');
    }
  };

  // Add a new function to handle file downloads
  const handleDownloadAttachment = async () => {
    try {
      // Get the filename from the path
      const fileName = ticket.attachmentPath.split('/').pop();
      
      // Fetch the file
      const response = await fetch(`${API_URL}/${ticket.attachmentPath}`);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName; // Set the filename for download
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      setError('Dosya indirilirken bir hata oluştu.');
    }
  };

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error" variant="filled">Çağrı detayları yüklenirken bir hata oluştu.</Alert>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={2}>
            <LinearProgress />
            <Typography align="center" color="text.secondary">Çağrı detayları yükleniyor...</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const isAssignedToCurrentUser = ticket.userId === currentUser?.id;
  const isCreatedByCurrentUser = ticket.createdById === currentUser?.id;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackButtonClick}
          sx={{ mb: 2 }}
        >
          {getBackButtonText()}
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Main Information */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 280 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {ticket.subject}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon fontSize="small" />
                  Çağrı #{ticket.registrationNumber}
                </Typography>
                <Chip
                  label={getStatusTranslation(ticket.status)}
                  color="primary"
                  size="medium"
                  sx={{
                    mt: 1,
                    fontWeight: 'bold',
                    bgcolor: getStatusColor(),
                    '& .MuiChip-label': { px: 2 }
                  }}
                />
              </Box>
              <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
                {!ticket.userId && !isCreatedByCurrentUser && (
                  <Button
                    variant="contained"
                    color={ticket.isAssignmentOverdue ? "error" : "primary"}
                    startIcon={ticket.isAssignmentOverdue ? <WarningAmberIcon /> : <PersonIcon />}
                    onClick={handleAssignConfirmOpen}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none',
                      animation: ticket.isAssignmentOverdue ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': {
                          boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.7)',
                        },
                        '70%': {
                          boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)',
                        },
                        '100%': {
                          boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)',
                        },
                      },
                    }}
                  >
                    {ticket.isAssignmentOverdue ? 'Acilen Üstlen!' : 'Çağrıyı Üstlen'}
                  </Button>
                )}
                {isCreatedByCurrentUser && !ticket.userId && (
                  <Chip
                    label="Kendine ait çağrıyı üstlenemezsiniz"
                    color="warning"
                    variant="outlined"
                    sx={{ borderRadius: 2, p: 1 }}
                  />
                )}
                {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && ticket.status !== 'Cancelled' && isAssignedToCurrentUser && (
                  <>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<SwapHorizIcon />}
                      onClick={handleTransferDialogOpen}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Çağrıyı Transfer Et
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelDialogOpen}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      İptal Et
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={handleCloseTicket}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Çağrıyı Kapat
                    </Button>
                  </>
                )}
              </Stack>
            </Box>

            {/* Enhanced Progress Bar */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1,
                    color: getStatusColor(),
                    fontWeight: 'bold'
                  }}
                >
                  Çağrı Durumu
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getStatusProgress()}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: `${getStatusColor()}20`,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          backgroundColor: getStatusColor(),
                          backgroundImage: `linear-gradient(45deg, 
                            rgba(255,255,255,0.15) 25%, 
                            transparent 25%, 
                            transparent 50%, 
                            rgba(255,255,255,0.15) 50%, 
                            rgba(255,255,255,0.15) 75%, 
                            transparent 75%, 
                            transparent)`,
                          backgroundSize: '40px 40px',
                          animation: 'progress-animation 2s linear infinite',
                        },
                        '@keyframes progress-animation': {
                          '0%': {
                            backgroundPosition: '40px 0',
                          },
                          '100%': {
                            backgroundPosition: '0 0',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      minWidth: 35,
                      color: getStatusColor(),
                      fontWeight: 'bold'
                    }}
                  >
                    {getStatusProgress()}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip
                    label="Açık"
                    size="small"
                    sx={{
                      bgcolor: getStatusProgress() >= 25 ? getStatusColor() : 'grey.300',
                      color: getStatusProgress() >= 25 ? 'white' : 'text.secondary',
                      fontWeight: 'bold',
                    }}
                  />
                  <Chip
                    label="İşlemde"
                    size="small"
                    sx={{
                      bgcolor: getStatusProgress() >= 50 ? getStatusColor() : 'grey.300',
                      color: getStatusProgress() >= 50 ? 'white' : 'text.secondary',
                      fontWeight: 'bold',
                    }}
                  />
                  <Chip
                    label="Tamamlandı"
                    size="small"
                    sx={{
                      bgcolor: getStatusProgress() >= 100 ? getStatusColor() : 'grey.300',
                      color: getStatusProgress() >= 100 ? 'white' : 'text.secondary',
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Quick Info Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Öncelik
                  </Typography>
                  <Chip
                    label={priorityLabels[ticket.priority]}
                    sx={{
                      bgcolor: `${priorityColors[ticket.priority]}15`,
                      color: priorityColors[ticket.priority],
                      fontWeight: 'medium',
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Departman
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>{ticket.group?.department?.name || '-'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Grup
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>{ticket.group?.name || '-'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Problem Tipi
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>{ticket.problemType}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Assignment Time Alert - Only show for unassigned tickets */}
            {!ticket.userId && ticket.timeToAssign && (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 2,
                  background: ticket.isAssignmentOverdue 
                    ? `linear-gradient(45deg, ${theme.palette.error.light}20 0%, ${theme.palette.error.light}30 100%)`
                    : `linear-gradient(45deg, ${theme.palette.info.light}20 0%, ${theme.palette.info.light}30 100%)`,
                  border: '1px solid',
                  borderColor: ticket.isAssignmentOverdue ? theme.palette.error.main : theme.palette.info.main,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {ticket.isAssignmentOverdue ? (
                    <WarningAmberIcon color="error" fontSize="large" />
                  ) : (
                    <AlarmIcon color="info" fontSize="large" />
                  )}
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: ticket.isAssignmentOverdue ? theme.palette.error.main : theme.palette.info.main,
                      }}
                    >
                      {ticket.isAssignmentOverdue 
                        ? 'Atama Süresi Doldu!'
                        : 'Atama İçin Kalan Süre'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bu çağrı <strong>{translateTimeDisplay(ticket.timeToAssignDisplay)}</strong> içerisinde atanmalıdır.
                      {ticket.isAssignmentOverdue && ' Bu süre dolmuştur.'}
                    </Typography>
                  </Box>
                  {!ticket.isAssignmentOverdue && (
                    <Chip
                      label={translateTimeDisplay(ticket.timeToAssignDisplay)}
                      color="info"
                      sx={{ 
                        ml: 'auto',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                  {ticket.isAssignmentOverdue && !isCreatedByCurrentUser && (
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<PersonIcon />}
                      onClick={handleAssignConfirmOpen}
                      sx={{ ml: 'auto', borderRadius: 2, textTransform: 'none' }}
                    >
                      Hemen Üstlen
                    </Button>
                  )}
                  {ticket.isAssignmentOverdue && isCreatedByCurrentUser && (
                    <Chip
                      label="Kendine ait çağrıyı üstlenemezsiniz"
                      color="warning"
                      variant="outlined"
                      size="small"
                      sx={{ ml: 'auto', borderRadius: 2 }}
                    />
                  )}
                </Box>
              </Paper>
            )}

            {/* Tabs Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="çağrı detayları sekmeleri">
                <Tab 
                  icon={<DescriptionIcon />} 
                  label="Açıklama" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<LocationIcon />} 
                  label="Konum" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<InfoIcon />} 
                  label="Notlar" 
                  iconPosition="start"
                />
                {ticket.attachmentPath && (
                  <Tab 
                    icon={<AttachmentIcon />} 
                    label="Ekler" 
                    iconPosition="start"
                  />
                )}
              </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={activeTab} index={0}>
              <Typography variant="body1" sx={{ 
                whiteSpace: 'pre-wrap', 
                color: 'text.secondary',
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                {ticket.description}
              </Typography>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Bina/Konum
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{ticket.location}</Typography>
                  </Paper>
                </Grid>
                {ticket.room && (
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Oda
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{ticket.room}</Typography>
                    </Paper>
                  </Grid>
                )}
                {ticket.floor && (
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Kat
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{ticket.floor}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {ticket && <TicketNotes ticketId={ticket.id} ticket={ticket} />}
            </TabPanel>

            {ticket.attachmentPath && (
              <TabPanel value={activeTab} index={3}>
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <AttachmentIcon color="action" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticket.attachmentPath.split('/').pop()}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadAttachment}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    İndir
                  </Button>
                </Paper>
              </TabPanel>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Timeline and Assignment */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Assignment Details Card */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                <PersonIcon />
                Atama Detayları
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Atanan Kişi
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {ticket.user ? ticket.user.name[0] : '?'}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500 }}>
                      {ticket.user ? `${ticket.user.name} ${ticket.user.surname}` : 'Atanmamış'}
                    </Typography>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Oluşturan
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      {ticket.createdBy?.name ? ticket.createdBy.name[0] : (ticket.createdBy?.groupName ? ticket.createdBy.groupName[0] : '?')}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500 }}>
                      {ticket.createdBy?.name
                        ? `${ticket.createdBy.name} ${ticket.createdBy.surname}`
                        : ticket.createdBy?.groupName || 'Grup Bilgisi Yok'}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </Paper>

            {/* Timeline Card */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                <AccessTimeIcon />
                Zaman Çizelgesi
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {/* Assignment Time Information */}
              {ticket.timeToAssign && !ticket.userId && (
                <Box sx={{ mb: 3 }}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: ticket.isAssignmentOverdue ? 'error.light' : 'info.light',
                      color: ticket.isAssignmentOverdue ? 'error.contrastText' : 'info.contrastText',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2
                    }}
                  >
                    {ticket.isAssignmentOverdue ? <WarningAmberIcon /> : <AlarmIcon />}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {ticket.isAssignmentOverdue ? 'Atama Süresi Doldu!' : 'Atama Süresi:'}
                    </Typography>
                  </Paper>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Çağrı Açılma:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {new Date(ticket.createdDate).toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Atama Süresi:
                    </Typography>
                    <Chip 
                      label={translateTimeDisplay(ticket.timeToAssignDisplay)} 
                      size="small" 
                      color={ticket.isAssignmentOverdue ? "error" : "info"}
                      sx={{ fontWeight: 'bold' }} 
                    />
                  </Box>
                  {ticket.isAssignmentOverdue && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Bu çağrı en kısa sürede atanmalıdır!
                    </Alert>
                  )}
                </Box>
              )}

              <Timeline sx={{ m: 0, p: 0 }}>
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.5 }}>
                    {new Date(ticket.createdDate).toLocaleString('tr-TR')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">Oluşturuldu</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getStatusTranslation('Open')}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
                {ticket.updatedDate && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.5 }}>
                      {new Date(ticket.updatedDate).toLocaleString('tr-TR')}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="warning" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">Güncellendi</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getStatusTranslation(ticket.status)}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
                {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.5 }}>
                      {ticket.completedDate ? new Date(ticket.completedDate).toLocaleString('tr-TR') : '-'}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success" />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">Tamamlandı</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getStatusTranslation(ticket.status)}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={handleTransferDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Çağrıyı Transfer Et</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="group-select-label">Grup</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                name="groupId"
                value={transferData.groupId}
                label="Grup"
                onChange={handleTransferDataChange}
              >
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Konu"
              name="subject"
              value={transferData.subject}
              onChange={handleTransferDataChange}
            />
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={transferData.description}
              onChange={handleTransferDataChange}
              multiline
              rows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransferDialogClose}>İptal</Button>
          <Button 
            onClick={handleTransferTicket} 
            variant="contained" 
            color="primary"
            disabled={!transferData.groupId || !transferData.subject || !transferData.description}
          >
            Transfer Et
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Confirmation Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleAssignConfirmClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.primary.main,
          fontWeight: 'bold'
        }}>
          <AssignmentIcon />
          Çağrı Üstlenme Onayı
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bu çağrıyı üstlenmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Çağrıyı üstlendiğinizde, çağrı sizin sorumluluğunuza atanacak ve durumu "İşlemde" olarak güncellenecektir.
          </Typography>
          
          {ticket.timeToAssign && (
            <Alert 
              severity={ticket.isAssignmentOverdue ? "error" : "info"}
              icon={ticket.isAssignmentOverdue ? <WarningAmberIcon /> : <AlarmIcon />}
              sx={{ 
                mb: 2,
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {ticket.isAssignmentOverdue ? "Atama Süresi Aşılmış!" : "Atama Süresi Bilgisi"}
              </Typography>
              <Typography variant="body2">
                Bu çağrı için belirlenen atama süresi: <strong>{translateTimeDisplay(ticket.timeToAssignDisplay)}</strong>
                {ticket.isAssignmentOverdue && (
                  <Typography component="span" sx={{ display: 'block', color: 'error.main', mt: 1, fontWeight: 'bold' }}>
                    Bu süre aşılmıştır. Lütfen en kısa sürede çağrıyı üstleniniz!
                  </Typography>
                )}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleAssignConfirmClose}
            variant="outlined"
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleAssignTicket}
            variant="contained"
            color={ticket.isAssignmentOverdue ? "error" : "primary"}
            startIcon={ticket.isAssignmentOverdue ? <WarningAmberIcon /> : <AssignmentIcon />}
          >
            {ticket.isAssignmentOverdue ? "Acilen Üstlen" : "Evet, Üstlen"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCancelDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.error.main,
          fontWeight: 'bold'
        }}>
          <CancelIcon />
          Çağrıyı İptal Et
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Bu çağrıyı iptal etmek istediğinizden emin misiniz? İptal edilen çağrılar tekrar açılamaz.
            </Typography>
            <FormControl fullWidth required>
              <InputLabel id="cancel-reason-select-label">İptal Sebebi</InputLabel>
              <Select
                labelId="cancel-reason-select-label"
                id="cancel-reason-select"
                name="cancelReasonId"
                value={cancelData.cancelReasonId}
                label="İptal Sebebi *"
                onChange={handleCancelDataChange}
              >
                {cancelReasons.map((reason) => (
                  <MenuItem key={reason.id} value={reason.id}>
                    {reason.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Açıklama"
              name="notes"
              value={cancelData.notes}
              onChange={handleCancelDataChange}
              multiline
              rows={4}
              placeholder="İptal etme sebebinizi detaylandırın..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleCancelDialogClose}
            variant="outlined"
            color="inherit"
          >
            Vazgeç
          </Button>
          <Button 
            onClick={handleCancelTicket}
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            disabled={!cancelData.cancelReasonId}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={() => setSuccessMessage('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TicketDetailPage;