import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import { getTicketById, assignTicket, transferTicket } from '../../api/TicketService';
import { API_URL } from '../../config';
import { getCurrentUser } from '../../api/auth';
import TicketNotes from '../../components/TicketNotes';

const statusColors = {
  'New': '#2196f3',
  'In Progress': '#ff9800',
  'Completed': '#4caf50',
  'Solved': '#4caf50',
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

function TicketDetailPage() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchTicket();
    fetchGroups();
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
    const statusMap = {
      'New': 25,
      'In Progress': 50,
      'Completed': 100,
      'Solved': 100,
      'Cancelled': 100,
    };
    return statusMap[ticket?.status] || 0;
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tickets')}
          sx={{ mb: 2 }}
        >
          Çağrılara Dön
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
              </Box>
              <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
                {!ticket.userId && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonIcon />}
                    onClick={handleAssignConfirmOpen}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Çağrıyı Üstlen
                  </Button>
                )}
                {ticket?.status !== 'Completed' && ticket?.status !== 'Solved' && isAssignedToCurrentUser && (
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
                    label="Yeni"
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
                    href={`${API_URL}/${ticket.attachmentPath}`}
                    target="_blank"
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
                      {ticket.createdBy ? ticket.createdBy.name[0] : '?'}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500 }}>
                      {ticket.createdBy ? `${ticket.createdBy.name} ${ticket.createdBy.surname}` : 'Mevcut Değil'}
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
                    </TimelineContent>
                  </TimelineItem>
                )}
                {ticket.status === 'Completed' && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.5 }}>
                      {ticket.completedDate ? new Date(ticket.completedDate).toLocaleString('tr-TR') : '-'}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success" />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">Tamamlandı</Typography>
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
          <Typography variant="body2" color="text.secondary">
            Çağrıyı üstlendiğinizde, çağrı sizin sorumluluğunuza atanacak ve durumu "İşlemde" olarak güncellenecektir.
          </Typography>
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
            color="primary"
            startIcon={<AssignmentIcon />}
          >
            Evet, Üstlen
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