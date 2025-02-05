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
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAssignedInventories } from '../api/InventoryService';
import { getMyTickets, getTicketById, assignTicket, getDepartmentTickets, updateTicketPriority } from '../api/TicketService';
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
    const [showDepartmentTickets, setShowDepartmentTickets] = useState(false);
    const [showAssignedTickets, setShowAssignedTickets] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [error, setError] = useState('');
    const theme = useTheme();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [inventoriesRes, departmentTicketsRes, assignedTicketsRes] = await Promise.all([
                getAssignedInventories(),
                getDepartmentTickets(),
                getMyTickets()
            ]);
            setInventories(inventoriesRes.data);
            setDepartmentTickets(departmentTicketsRes.data);
            setAssignedToMeTickets(assignedTicketsRes.data);
        } catch (err) {
            setError('Veri yüklenirken bir hata oluştu');
        }
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
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

            {/* Welcome Section */}
            <Box 
                sx={{ 
                    mb: 4,
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Hoş Geldiniz!
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    Envanter ve çağrı yönetim sistemi kontrol paneli
                </Typography>
            </Box>

            {/* Inventory Overview Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                    Envanter Durumu
                </Typography>
                <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{ 
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Barkod</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Model</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Seri No</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Lokasyon</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Durum</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventories.map((inventory) => (
                                <TableRow 
                                    key={inventory.id}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <BarcodeIcon color="action" fontSize="small" />
                                            {inventory.barcode}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{inventory.model}</TableCell>
                                    <TableCell>{inventory.serialNumber}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationIcon color="action" fontSize="small" />
                                            {inventory.location}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={inventory.status}
                                            color={statusColors[inventory.status] || 'default'}
                                            size="small"
                                            sx={{ 
                                                borderRadius: 1,
                                                fontWeight: 500
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {inventories.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={5} 
                                        align="center"
                                        sx={{ 
                                            py: 4,
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        Atanmış envanter bulunamadı
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Tickets Overview Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                    Çağrı Durumu
                </Typography>
                <Grid container spacing={3}>
                    {/* Department Tickets Card */}
                    <Grid item xs={12} sm={6}>
                        <Paper
                            sx={{ 
                                cursor: 'pointer',
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            onClick={() => setShowDepartmentTickets(true)}
                            elevation={1}
                        >
                            <Box 
                                sx={{ 
                                    p: 3,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                        Departman Çağrıları
                                    </Typography>
                                    <Chip 
                                        label={departmentTickets.length}
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '1.1rem'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Departmanınıza atanmış tüm çağrıları görüntüleyin
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Assigned Tickets Card */}
                    <Grid item xs={12} sm={6}>
                        <Paper
                            sx={{ 
                                cursor: 'pointer',
                                borderRadius: 3,
                                overflow: 'hidden',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            onClick={() => setShowAssignedTickets(true)}
                            elevation={1}
                        >
                            <Box 
                                sx={{ 
                                    p: 3,
                                    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                        Üzerimdeki Çağrılar
                                    </Typography>
                                    <Chip 
                                        label={assignedToMeTickets.length}
                                        sx={{ 
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '1.1rem'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Size atanmış çağrıları görüntüleyin ve yönetin
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
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

            {selectedTicket && (
                <TicketDetailsDialog
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onAssignTicket={handleAssignTicket}
                />
            )}
        </Box>
    );
}

export default DashboardPage; 