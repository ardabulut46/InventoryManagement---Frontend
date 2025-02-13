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
  Avatar
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
import { TICKET_PRIORITIES } from '../../utils/ticketConfig';

const statusColors = {
  'New': 'info',
  'In Progress': 'warning',
  'Completed': 'success',
  'Cancelled': 'error',
};

const statusIcons = {
  'New': <NewIcon />,
  'In Progress': <WarningIcon />,
  'Completed': <CheckCircleIcon />,
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
                bgcolor: `${statusColors[status]}.50`,
                border: 1,
                borderColor: `${statusColors[status]}.200`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: `${statusColors[status]}.main` }}>
                  {statusIcons[status]}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: `${statusColors[status]}.main` }}>
                    {count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {status}
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
      <Grid container spacing={3}>
        {filteredTickets.map((ticket) => (
          <Grid item xs={12} sm={6} md={4} key={ticket.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              <CardActionArea 
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      {ticket.subject}
                    </Typography>
                    <Chip
                      label={ticket.status}
                      color={statusColors[ticket.status]}
                      size="small"
                      icon={statusIcons[ticket.status]}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" />
                    #{ticket.registrationNumber}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {ticket.location}
                        {ticket.room && ` (Oda: ${ticket.room})`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {ticket.department?.name || 'Departman Belirtilmemiş'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip 
                        label={ticket.problemType}
                        variant="outlined"
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriorityChip priority={ticket.priority} />
                        <IconButton 
                          size="small" 
                          onClick={(e) => handlePriorityClick(e, ticket)}
                          sx={{ 
                            ml: 0.5,
                            bgcolor: 'background.default',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                        >
                          <ArrowDownIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        {filteredTickets.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography color="textSecondary">
                {searchTerm ? 'Arama kriterlerine uygun çağrı bulunamadı.' : 'Atanmış çağrı bulunmamaktadır.'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

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