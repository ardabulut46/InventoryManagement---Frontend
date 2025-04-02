import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  LinearProgress,
  TextField,
  InputAdornment,
  Tooltip,
  useTheme,
  CardActionArea,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  NewReleases as NewIcon
} from '@mui/icons-material';
import { getMyTickets, updateTicketPriority } from '../../api/TicketService';
import PriorityChip from '../../components/PriorityChip';
import { TICKET_PRIORITIES, TICKET_STATUS_COLORS, getStatusTranslation } from '../../utils/ticketConfig';

// Use MUI theme colors for status
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

const AssignedTicketsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);
      const response = await getMyTickets();
      setTickets(response.data);
      setError('');
    } catch (err) {
      setError('Atanmış çağrılar yüklenirken bir hata oluştu.');
      console.error('Error fetching assigned tickets:', err);
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
      fetchAssignedTickets();
    } catch (err) {
      console.error('Error updating priority:', err);
    }
    handlePriorityClose();
  };

  const getStatusStats = () => {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});
  };

  const filteredTickets = tickets.filter(ticket =>
    Object.values(ticket).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const statusStats = getStatusStats();

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={2}>
            <LinearProgress />
            <Typography align="center" color="text.secondary">Üzerimdeki çağrılar yükleniyor...</Typography>
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
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Object.entries(statusStats).map(([status, count]) => (
          <Grid item xs={6} sm={3} key={status}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.05)',
                border: 1,
                borderColor: statusColors[status],
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: statusColors[status] }}>
                  {statusIcons[status]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: statusColors[status] }}>
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getStatusTranslation(status)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search Section */}
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
        sx={{ mb: 4 }}
      />

      {/* Tickets Grid */}
      {filteredTickets.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper', mb: 4 }}>
          {filteredTickets.map((ticket) => (
            <ListItem key={ticket.id} button onClick={() => navigate(`/tickets/${ticket.id}`)}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: statusColors[ticket.status] }}>
                  {statusIcons[ticket.status]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={ticket.subject}
                secondary={
                  <React.Fragment>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <AccessTimeIcon fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        #{ticket.registrationNumber}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" display="inline">
                        {ticket.location}{ticket.room ? ` (Oda: ${ticket.room})` : ''}
                      </Typography>
                      {' - '}
                      <Typography variant="body2" display="inline" color="text.secondary">
                        {ticket.department?.name || 'Departman Belirtilmemiş'}
                      </Typography>
                    </Box>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={(e) => {
                  e.stopPropagation();
                  handlePriorityClick(e, ticket);
                }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PriorityChip priority={ticket.priority} />
                    <ArrowDownIcon fontSize="small" />
                  </Stack>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
          <Typography color="textSecondary">
            {searchTerm ? 'Arama kriterlerine uygun çağrı bulunamadı.' : 'Atanmış çağrı bulunmamaktadır.'}
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
};

export default AssignedTicketsPage; 