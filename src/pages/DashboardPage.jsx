import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Menu,
    MenuItem,
    Paper,
    TableContainer,
    TableHead,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    QrCode as BarcodeIcon,
    LocationOn as LocationIcon,
    Info as InfoIcon,
    Edit as EditIcon,
    Computer as InventoryIcon,
    ConfirmationNumber as TicketIcon,
    Close as CloseIcon,
    PersonAdd as PersonAddIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getAssignedInventories } from '../api/InventoryService';
import { getMyTickets, getTicketById, assignTicket, getDepartmentTickets, updateTicketPriority, getMyAllTickets } from '../api/TicketService';
import { getIdleBreachTickets } from '../api/IdleDurationLimitService';
import PriorityChip from '../components/PriorityChip';
import { TICKET_PRIORITIES } from '../utils/ticketConfig';
import { getCurrentUser } from '../api/auth';
import { API_URL } from '../config';
import { useTheme } from '@mui/material/styles';
const statusColors = {
    'Available': 'success',
    'In Use': 'primary',
    'Under Maintenance': 'warning',
    'Retired': 'error',
    'Lost': 'error',
    'New': 'info',
    'In Progress': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
};

function TicketDetailsDialog({ ticket, onClose, onAssignTicket }) {
    if (!ticket) return null;

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/Ticket/download/${ticket.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = ticket.attachmentPath.split('/').pop(); // Get the filename
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                console.error('Failed to download file');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Ticket Details</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold', width: '30%' }}>Registration Number</TableCell>
                            <TableCell>{ticket.registrationNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                            <TableCell>{ticket.subject}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Problem Type</TableCell>
                            <TableCell>{ticket.problemType}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell>
                                <Chip 
                                    label={ticket.status}
                                    color={statusColors[ticket.status] || 'default'}
                                    size="small"
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Location</TableCell>
                            <TableCell>
                                {ticket.location}
                                {ticket.room && ` (Room: ${ticket.room})`}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Department</TableCell>
                            <TableCell>{ticket.department?.name}</TableCell>
                        </TableRow>
                        {ticket.inventory && (
                            <TableRow>
                                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Related Inventory</TableCell>
                                <TableCell>
                                    {`${ticket.inventory.brand} ${ticket.inventory.model} (${ticket.inventory.serialNumber})`}
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</TableCell>
                        </TableRow>
                        {ticket.attachmentPath && (
                            <TableRow>
                                <TableCell component="th" sx={{ fontWeight: 'bold' }}>Attachment</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="text" 
                                        color="primary"
                                        onClick={handleDownload}
                                    >
                                        View Attachment
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                            <TableCell>{new Date(ticket.createdDate).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                            <TableCell>
                                <PriorityChip priority={ticket.priority} size="medium" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button 
                    component={Link}
                    to={`/tickets/edit/${ticket.id}`}
                    color="primary"
                    variant="contained"
                >
                    Edit Ticket
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function DepartmentTicketsDialog({ open, onClose, tickets, onAssignTicket, onTicketClick }) {
    const currentUser = getCurrentUser();

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Grubumdaki Çağrılar</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        maxHeight: 400,
                        '& .MuiTableHead-root': {
                            position: 'sticky',
                            top: 0,
                            bgcolor: 'background.paper',
                            zIndex: 1,
                        }
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Registration Number</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Problem Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>#{ticket.registrationNumber}</TableCell>
                                    <TableCell>{ticket.subject}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.problemType}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.status}
                                            size="small"
                                            color={statusColors[ticket.status] || 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <PriorityChip priority={ticket.priority} />
                                    </TableCell>
                                    <TableCell align="right">
                                        {!ticket.userId && (
                                            <Button
                                                size="small"
                                                onClick={() => onAssignTicket(ticket.id)}
                                                startIcon={<PersonAddIcon />}
                                                sx={{ mr: 1 }}
                                            >
                                                Üstlen
                                            </Button>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => onTicketClick(ticket)}
                                            color="info"
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tickets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Box sx={{ py: 3 }}>
                                            <TicketIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                No Department Tickets
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
        </Dialog>
    );
}

function AssignedTicketsDialog({ open, onClose, tickets, onTicketUpdate, onTicketClick }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const handlePriorityClick = (event, ticket) => {
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
            onTicketUpdate();
        } catch (err) {
            console.error('Error updating priority:', err);
        }
        handlePriorityClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Üzerimdeki Çağrılar</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        maxHeight: 400,
                        '& .MuiTableHead-root': {
                            position: 'sticky',
                            top: 0,
                            bgcolor: 'background.paper',
                            zIndex: 1,
                        }
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Registration Number</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Problem Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>#{ticket.registrationNumber}</TableCell>
                                    <TableCell>{ticket.subject}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.problemType}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ticket.status}
                                            size="small"
                                            color={statusColors[ticket.status] || 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PriorityChip priority={ticket.priority} />
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handlePriorityClick(e, ticket)}
                                            >
                                                <ArrowDownIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => onTicketClick(ticket)}
                                            color="info"
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tickets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Box sx={{ py: 3 }}>
                                            <TicketIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                            <Typography variant="h6" color="text.secondary">
                                                No Assigned Tickets
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            {/* Priority Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handlePriorityClose}
            >
                {Object.entries(TICKET_PRIORITIES).map(([value, { label, color }]) => (
                    <MenuItem
                        key={value}
                        onClick={() => handlePriorityChange(Number(value))}
                        sx={{
                            color: color,
                            fontWeight: 'medium',
                            minWidth: '120px'
                        }}
                    >
                        {label}
                    </MenuItem>
                ))}
            </Menu>
        </Dialog>
    );
}

function DashboardPage() {
    const [inventories, setInventories] = useState([]);
    const [departmentTickets, setDepartmentTickets] = useState([]);
    const [assignedToMeTickets, setAssignedToMeTickets] = useState([]);
    const [allTickets, setAllTickets] = useState([]);
    const [idleBreachTickets, setIdleBreachTickets] = useState([]);
    const [showDepartmentTickets, setShowDepartmentTickets] = useState(false);
    const [showAssignedTickets, setShowAssignedTickets] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [inventoriesRes, departmentTicketsRes, assignedTicketsRes, allTicketsRes, idleBreachRes] = await Promise.all([
                getAssignedInventories(),
                getDepartmentTickets(),
                getMyTickets(),
                getMyAllTickets(),
                getIdleBreachTickets()
            ]);
            setInventories(inventoriesRes.data);
            setDepartmentTickets(departmentTicketsRes.data);
            setAssignedToMeTickets(assignedTicketsRes.data);
            setAllTickets(allTicketsRes.data);
            setIdleBreachTickets(idleBreachRes.data);
        } catch (err) {
            setError('Veri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleTicketClick = (ticket) => {
        navigate(`/tickets/${ticket.id}`);
    };

    const handleTicketUpdate = () => {
        fetchData();
    };

    const handleAssignTicket = async (ticketId) => {
        try {
            await assignTicket(ticketId);
            fetchData();
        } catch (err) {
            setError('Çağrı atama işlemi başarısız oldu');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
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
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {/* Welcome Section with Stats */}
            <Box 
                sx={{ 
                    mb: 4,
                    p: 4,
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark' 
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                        : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                                Hoş Geldiniz!
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                                Envanter ve çağrı yönetim sistemi kontrol paneli
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            component={Link}
                            to="/tickets/create"
                            startIcon={<AddIcon />}
                            sx={{
                                bgcolor: 'white',
                                color: theme.palette.primary.main,
                                px: 3,
                                py: 1,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                '&:hover': {
                                    bgcolor: 'white',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Çağrı Aç
                        </Button>
                    </Box>

                    {/* Stats Grid */}
                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper 
                                onClick={() => navigate('/tickets/department')}
                                sx={{ 
                                    p: 2, 
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.15)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.3)'
                                        : 'rgba(255, 255, 255, 0.2)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                                            : '0 4px 20px rgba(0, 0, 0, 0.1)',
                                    }
                                }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                    Grubumun Çağrıları
                                </Typography>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {loading ? '...' : departmentTickets.length}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper 
                                onClick={() => navigate('/tickets/assigned')}
                                sx={{ 
                                    p: 2, 
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.15)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.3)'
                                        : 'rgba(255, 255, 255, 0.2)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                                            : '0 4px 20px rgba(0, 0, 0, 0.1)',
                                    }
                                }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                    Üzerimdeki Çağrılar
                                </Typography>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {loading ? '...' : assignedToMeTickets.length}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper 
                                onClick={() => navigate('/tickets')}
                                sx={{ 
                                    p: 2, 
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.15)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.3)'
                                        : 'rgba(255, 255, 255, 0.2)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 4px 20px rgba(0, 0, 0, 0.4)'
                                            : '0 4px 20px rgba(0, 0, 0, 0.1)',
                                    }
                                }}
                            >
                                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                    Tüm Çağrılar
                                </Typography>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {loading ? '...' : allTickets.length}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper 
                                onClick={() => navigate('/tickets/idle-breach')}
                                sx={{ 
                                    p: 2, 
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.15)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: theme.palette.warning.main,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 20px ${theme.palette.warning.main}40`,
                                    }
                                }}
                            >
                                <Typography variant="h6" sx={{ color: theme.palette.warning.light, mb: 1 }}>
                                    Süresi Aşılan
                                </Typography>
                                <Typography variant="h4" sx={{ color: theme.palette.warning.light, fontWeight: 'bold' }}>
                                    {loading ? '...' : idleBreachTickets.length}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Second Row - Inventory */}
                        <Grid item xs={12} sm={6} md={3} sx={{ mx: 'auto' }}>
                            <Paper 
                                onClick={() => navigate('/inventories')}
                                sx={{ 
                                    p: 2, 
                                    bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.15)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: theme.palette.primary.main,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 4px 20px ${theme.palette.primary.main}40`,
                                    }
                                }}
                            >
                                <Typography variant="h6" sx={{ color: theme.palette.primary.light, mb: 1 }}>
                                    Toplam Envanter
                                </Typography>
                                <Typography variant="h4" sx={{ color: theme.palette.primary.light, fontWeight: 'bold' }}>
                                    {loading ? '...' : inventories.length}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
                {/* Background decoration */}
                <Box sx={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '60%',
                    height: '200%',
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                    transform: 'rotate(45deg)',
                    zIndex: 0
                }} />
            </Box>

            {/* Dialogs */}
            <DepartmentTicketsDialog
                open={showDepartmentTickets}
                onClose={() => setShowDepartmentTickets(false)}
                tickets={departmentTickets}
                onAssignTicket={handleAssignTicket}
                onTicketClick={handleTicketClick}
            />

            <AssignedTicketsDialog
                open={showAssignedTickets}
                onClose={() => setShowAssignedTickets(false)}
                tickets={assignedToMeTickets}
                onTicketUpdate={handleTicketUpdate}
                onTicketClick={handleTicketClick}
            />
        </Box>
    );
}

export default DashboardPage; 