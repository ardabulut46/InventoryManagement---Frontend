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

function TicketDetailsDialog({ ticket, onClose }) {
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
    const [myTickets, setMyTickets] = useState([]);
    const [departmentTickets, setDepartmentTickets] = useState([]);
    const [assignedToMeTickets, setAssignedToMeTickets] = useState([]);
    const [error, setError] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDepartmentTickets, setShowDepartmentTickets] = useState(false);
    const [showAssignedTickets, setShowAssignedTickets] = useState(false);

    useEffect(() => {
        fetchInventories();
        fetchTickets();

        // Set up polling interval
        const intervalId = setInterval(() => {
            fetchTickets();
        }, 10000); // Fetch every 10 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs once on mount

    const fetchInventories = async () => {
        try {
            const response = await getAssignedInventories();
            // Ensure we have an array of inventories
            const inventoriesData = Array.isArray(response.data) ? response.data : [];
            setInventories(inventoriesData);
        } catch (error) {
            console.error('Error fetching inventories:', error);
            setError('Failed to fetch inventories.');
        }
    };

    const fetchTickets = async () => {
        try {
            const [myTicketsResponse, departmentTicketsResponse] = await Promise.all([
                getMyTickets(),
                getDepartmentTickets()
            ]);
            
            console.log('My Tickets Response:', myTicketsResponse);
            console.log('Department Tickets Response:', departmentTicketsResponse);
            
            // Ensure we have arrays
            const myTicketsData = Array.isArray(myTicketsResponse.data) ? myTicketsResponse.data : [];
            const departmentTicketsData = Array.isArray(departmentTicketsResponse.data) ? departmentTicketsResponse.data : [];
            
            setMyTickets(myTicketsData);
            setDepartmentTickets(departmentTicketsData); // Show all department tickets
            setAssignedToMeTickets(myTicketsData);
            setError('');
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Failed to fetch tickets. ' + (err.response?.data?.message || err.message));
        }
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleAssignTicket = async (ticketId) => {
        try {
            await assignTicket(ticketId);
            fetchTickets(); // Refresh tickets after assignment
            setShowDepartmentTickets(false); // Close the dialog after successful assignment
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to assign ticket.';
            setError(errorMessage);
            console.error('Error assigning ticket:', err);
        }
    };

    const handleTicketUpdate = () => {
        fetchTickets(); // Refresh tickets after priority update
    };

    return (
        <Box sx={{ p: 0 }}>
            {error && (
                <Box sx={{ px: 1, mb: 1 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            {/* My Assigned Inventories Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ px: 1, py: 2, fontWeight: 'bold' }}>
                    Zimmetli Envanterim
                </Typography>
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        maxHeight: 400, // This will show approximately 5 rows before scrolling
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
                                <TableCell>ID</TableCell>
                                <TableCell>Barcode</TableCell>
                                <TableCell>Brand</TableCell>
                                <TableCell>Model</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventories.map((inventory) => (
                                <TableRow key={inventory.id}>
                                    <TableCell>{inventory.id}</TableCell>
                                    <TableCell>{inventory.serialNumber}</TableCell>
                                    <TableCell>{inventory.brand}</TableCell>
                                    <TableCell>{inventory.model}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={inventory.status}
                                            color={inventory.status === 'Available' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            component={Link}
                                            to={`/inventories/edit/${inventory.id}`}
                                            size="small"
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Tickets Overview Section */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} sx={{ px: 1 }}>
                    {/* Department Tickets Card */}
                    <Grid item xs={12} sm={6}>
                        <Paper
                            sx={{ 
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                },
                            }}
                            onClick={() => setShowDepartmentTickets(true)}
                            elevation={0}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TicketIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Grubumdaki Çağrılar
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={departmentTickets.length}
                                        color="primary"
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            height: 32,
                                            minWidth: 32,
                                            borderRadius: 2
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Paper>
                    </Grid>

                    {/* Assigned Tickets Card */}
                    <Grid item xs={12} sm={6}>
                        <Paper
                            sx={{ 
                                cursor: 'pointer',
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                },
                            }}
                            onClick={() => setShowAssignedTickets(true)}
                            elevation={0}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TicketIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Üzerimdeki Çağrılar
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={assignedToMeTickets.length}
                                        color="primary"
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            height: 32,
                                            minWidth: 32,
                                            borderRadius: 2
                                        }}
                                    />
                                </Box>
                            </CardContent>
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

            {/* Ticket Details Dialog */}
            {selectedTicket && (
                <TicketDetailsDialog
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                />
            )}
        </Box>
    );
}

export default DashboardPage; 