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
} from '@mui/icons-material';
import { getTicketById, assignTicket } from '../../api/TicketService';
import { API_URL } from '../../config';
import { getCurrentUser } from '../../api/auth';

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
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
};

function TicketDetailPage() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await getTicketById(id);
      console.log('Ticket data:', response.data);
      setTicket(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Failed to fetch ticket details.');
    }
  };

  const handleCloseTicket = () => {
    navigate(`/tickets/${id}/solutions/create`, { state: { isClosing: true } });
  };

  const handleAssignTicket = async () => {
    try {
      await assignTicket(id);
      await fetchTicket(); // Refresh ticket data
    } catch (err) {
      console.error('Error assigning ticket:', err);
      setError('Failed to assign ticket.');
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Alert severity="error" variant="filled">{error}</Alert>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={2}>
            <LinearProgress />
            <Typography align="center" color="text.secondary">Loading ticket details...</Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const isAssignedToCurrentUser = ticket.userId === currentUser?.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tickets')}
          sx={{ mb: 3 }}
        >
          Back to Tickets
        </Button>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                {ticket.subject}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon fontSize="small" />
                Ticket #{ticket.registrationNumber}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
              {!ticket.userId && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PersonIcon />}
                  onClick={handleAssignTicket}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Çağrıyı Üstlen
                </Button>
              )}
              {ticket?.status !== 'Completed' && ticket?.status !== 'Solved' && isAssignedToCurrentUser && (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleCloseTicket}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Close Ticket
                </Button>
              )}
            </Stack>
          </Box>

          {/* Status Progress Bar */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Status Progress
              </Typography>
              <Chip
                label={ticket.status}
                sx={{
                  bgcolor: `${statusColors[ticket.status]}15`,
                  color: statusColors[ticket.status],
                  fontWeight: 'medium',
                  borderRadius: '8px',
                  '& .MuiChip-label': { px: 2 },
                }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={getStatusProgress()}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.100',
                '& .MuiLinearProgress-bar': {
                  bgcolor: statusColors[ticket.status],
                  borderRadius: 5,
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Main Information */}
        <Grid item xs={12} md={8}>
          {/* Description Card */}
          <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                <InfoIcon />
                Description
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ 
                whiteSpace: 'pre-wrap', 
                color: 'text.secondary', 
                mt: 2,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                {ticket.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                <LocationIcon />
                Location Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Building/Location
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{ticket.location}</Typography>
                  </Paper>
                </Grid>
                {ticket.room && (
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Room
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{ticket.room}</Typography>
                    </Paper>
                  </Grid>
                )}
                {ticket.floor && (
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Floor
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{ticket.floor}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Attachment Card */}
          {ticket.attachmentPath && (
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                  <AttachmentIcon />
                  Attachments
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    mt: 2,
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
                    Download
                  </Button>
                </Paper>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Timeline and Details */}
        <Grid item xs={12} md={4}>
          {/* Status Timeline Card */}
          <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                <AccessTimeIcon />
                Ticket Timeline
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Timeline sx={{ mt: 2, p: 0 }}>
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.5 }}>
                    {new Date(ticket.createdDate).toLocaleString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">Created</Typography>
                  </TimelineContent>
                </TimelineItem>
                {ticket.updatedDate && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.5 }}>
                      {new Date(ticket.updatedDate).toLocaleString()}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="warning" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">Updated</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
                {ticket.status === 'Completed' && (
                  <TimelineItem>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.5 }}>
                      {ticket.completedDate ? new Date(ticket.completedDate).toLocaleString() : 'N/A'}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color="success" />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle2">Completed</Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </CardContent>
          </Card>

          {/* Assignment Details Card */}
          <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                <PersonIcon />
                Assignment Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Assigned To
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {ticket.user ? ticket.user.name[0] : '?'}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500 }}>
                      {ticket.user ? `${ticket.user.name} ${ticket.user.surname}` : 'Not assigned'}
                    </Typography>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Created By
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      {ticket.createdBy ? ticket.createdBy.name[0] : '?'}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500 }}>
                      {ticket.createdBy ? `${ticket.createdBy.name} ${ticket.createdBy.surname}` : 'Not Available'}
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Additional Details Card */}
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                <FlagIcon />
                Additional Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Problem Type
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 500 }}>{ticket.problemType}</Typography>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Priority
                  </Typography>
                  <Chip
                    label={priorityLabels[ticket.priority]}
                    sx={{
                      mt: 1,
                      bgcolor: `${priorityColors[ticket.priority]}15`,
                      color: priorityColors[ticket.priority],
                      fontWeight: 'medium',
                      borderRadius: '8px',
                      '& .MuiChip-label': { px: 2 },
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Group
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 500 }}>{ticket.group?.name || '-'}</Typography>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Department
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 500 }}>{ticket.group?.department?.name || '-'}</Typography>
                  </Paper>
                </Box>
                {ticket.idleDurationDisplay && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Idle Duration
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 500 }}>{ticket.idleDurationDisplay}</Typography>
                    </Paper>
                  </Box>
                )}
                {ticket.assignedDate && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Assigned Date
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 500 }}>{new Date(ticket.assignedDate).toLocaleString()}</Typography>
                    </Paper>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TicketDetailPage;