import React, { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    Box,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    Card,
    CardContent,
    Divider,
    Menu,
    MenuItem,
    Grid,
    DialogActions,
    Container,
    Fade,
    Tooltip
} from '@mui/material'
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Info as InfoIcon,
    Close as CloseIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Assignment as AssignmentIcon,
    PersonAdd as PersonAddIcon,
    CheckCircle as CheckCircleIcon,
    AttachFile as AttachmentIcon,
    Download as DownloadIcon,
} from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { getDepartmentTickets, deleteTicket, getMyTickets, updateTicketPriority, assignTicket } from '../../api/TicketService'
import { TICKET_PRIORITIES } from '../../utils/ticketConfig'
import PriorityChip from '../../components/PriorityChip'
import { getCurrentUser } from '../../api/auth'
import { API_URL } from '../../config'

const statusColors = {
    'New': 'info',
    'In Progress': 'warning',
    'Completed': 'success',
    'Cancelled': 'error',
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
            onTicketUpdate(); // Refresh tickets after update
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
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {tickets.map((ticket) => (
                        <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {ticket.subject}
                                    </Typography>
                                    <Typography color="textSecondary" gutterBottom>
                                        #{ticket.registrationNumber}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ mt: 2, mb: 2 }}>
                                        <Chip 
                                            label={ticket.problemType}
                                            sx={{ mr: 1, mb: 1 }}
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                            <PriorityChip priority={ticket.priority} />
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => handlePriorityClick(e, ticket)}
                                                sx={{ ml: 0.5 }}
                                            >
                                                <ArrowDownIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <Chip 
                                        label={ticket.status}
                                        size="small"
                                        color={statusColors[ticket.status] || 'default'}
                                    />
                                </CardContent>
                                <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => onTicketClick(ticket)}
                                    >
                                        <InfoIcon />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                    {tickets.length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center' }}>
                                No tickets assigned to you.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
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

function TicketDetailsDialog({ ticket, onClose, onAssignTicket }) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    const handleCloseTicket = () => {
        navigate(`/tickets/${ticket.id}/solutions/create`, { state: { isClosing: true } });
        onClose();
    };

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            const response = await fetch(`${API_URL}/api/Ticket/download/${ticket.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = ticket.attachmentPath.split('/').pop(); // Use the original filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading file:', error);
            // You might want to show an error notification here
        } finally {
            setIsDownloading(false);
        }
    };

    if (!ticket) return null;

    const isAssignedToCurrentUser = ticket.userId === currentUser?.id;

    return (
        <>
            <Dialog
                open={true}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
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
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                Basic Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Registration Number</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>{ticket.registrationNumber}</Typography>
                                        {ticket.attachmentPath && (
                                            <Tooltip title="Has attachment">
                                                <AttachmentIcon 
                                                    fontSize="small" 
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        opacity: 0.7
                                                    }} 
                                                />
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography>{ticket.subject}</Typography>
                                        {ticket.attachmentPath && (
                                            <Tooltip title="Has attachment">
                                                <AttachmentIcon 
                                                    fontSize="small" 
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        opacity: 0.7
                                                    }} 
                                                />
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Problem Type</Typography>
                                    <Typography>{ticket.problemType}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</Typography>
                                </Box>
                                {ticket.attachmentPath && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Attachment</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                            <Typography>{ticket.attachmentPath.split('/').pop()}</Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<DownloadIcon />}
                                                onClick={handleDownload}
                                                disabled={isDownloading}
                                                sx={{ 
                                                    borderRadius: 1,
                                                    textTransform: 'none',
                                                    minWidth: 'auto'
                                                }}
                                            >
                                                {isDownloading ? 'Downloading...' : 'Download'}
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        {/* Status and Assignment */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                Status and Assignment
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                        <Chip 
                                            label={ticket.status}
                                            color={statusColors[ticket.status] || 'default'}
                                            size="small"
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                                        <PriorityChip priority={ticket.priority} />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                                    <Typography>{ticket.user ? `${ticket.user.name} ${ticket.user.surname} (${ticket.user.email})` : 'Not assigned'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                                    <Typography>{ticket.department?.name || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Çağrının Boşta Kalma Süresi</Typography>
                                    <Typography>{ticket.idleDurationDisplay || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Location Information */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                Location Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                    <Typography>{ticket.location}</Typography>
                                </Box>
                                {ticket.room && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Room</Typography>
                                        <Typography>{ticket.room}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>

                        {/* Dates */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                Dates
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                                    <Typography>{new Date(ticket.createdDate).toLocaleString()}</Typography>
                                </Box>
                                {ticket.updatedDate && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                                        <Typography>{new Date(ticket.updatedDate).toLocaleString()}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                    {ticket.status !== 'Completed' && (
                        <>
                            {isAssignedToCurrentUser && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleCloseTicket}
                                    startIcon={<CheckCircleIcon />}
                                >
                                    Çağrıyı Kapat
                                </Button>
                            )}
                            {!ticket.userId && (
                                <Button
                                    variant="contained"
                                    onClick={() => setShowConfirmation(true)}
                                    startIcon={<PersonAddIcon />}
                                >
                                    Çağrıyı Üstlen
                                </Button>
                            )}
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6">Onay</Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Çağrıyı üstlenmeye emin misiniz?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={() => setShowConfirmation(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                        }}
                    >
                        İptal
                    </Button>
                    <Button
                        onClick={() => {
                            onAssignTicket(ticket.id);
                            setShowConfirmation(false);
                            onClose();
                        }}
                        color="success"
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                            }
                        }}
                    >
                        Onayla
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function TicketsPage() {
    const [tickets, setTickets] = useState([])
    const [assignedTickets, setAssignedTickets] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState('')
    const [showAssignedTickets, setShowAssignedTickets] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        fetchTickets()
    }, [])

    const fetchTickets = async () => {
        try {
            const [departmentResponse, myTicketsResponse] = await Promise.all([
                getDepartmentTickets(),
                getMyTickets()
            ]);
            setTickets(departmentResponse.data)
            setAssignedTickets(myTicketsResponse.data)
            setError('')
        } catch (err) {
            setError('Failed to fetch tickets.')
            console.error('Error fetching tickets', err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return
        try {
            await deleteTicket(id)
            fetchTickets()
            setError('')
        } catch (err) {
            setError('Failed to delete ticket. You can only delete your own tickets.')
        }
    }

    const handleTicketUpdate = () => {
        fetchTickets(); // Refresh tickets after priority update
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleAssignTicket = async (ticketId) => {
        try {
            await assignTicket(ticketId);
            fetchTickets(); // Refresh tickets after assignment
            setError('');
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to assign ticket.';
            setError(errorMessage);
            console.error('Error assigning ticket:', err);
        }
    };

    const filteredTickets = tickets.filter(ticket =>
        Object.values(ticket).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Tickets
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<AssignmentIcon />}
                            onClick={() => setShowAssignedTickets(true)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                borderWidth: 1.5,
                                '&:hover': {
                                    borderWidth: 1.5,
                                }
                            }}
                        >
                            Üzerimdeki Çağrılar
                        </Button>
                        <Button
                            component={Link}
                            to="/tickets/create"
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                                }
                            }}
                        >
                            Create New Ticket
                        </Button>
                    </Box>
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

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search tickets..."
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
                            bgcolor: 'grey.50',
                            '&:hover': {
                                bgcolor: 'grey.100',
                            },
                            '& fieldset': {
                                borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                                borderColor: 'transparent',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                            },
                        }
                    }}
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            '&:hover': {
                                bgcolor: 'background.default',
                            }
                        }
                    }}
                />

                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Registration #</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Subject</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Location</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Created Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTickets.map((ticket) => (
                                <TableRow 
                                    key={ticket.id}
                                    onClick={() => handleTicketClick(ticket)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {ticket.registrationNumber}
                                            {ticket.attachmentPath && (
                                                <Tooltip title="Has attachment">
                                                    <AttachmentIcon 
                                                        fontSize="small" 
                                                        sx={{ 
                                                            color: 'text.secondary',
                                                            opacity: 0.7
                                                        }} 
                                                    />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>{ticket.subject}</Typography>
                                            {ticket.attachmentPath && (
                                                <Tooltip title="Has attachment">
                                                    <AttachmentIcon 
                                                        fontSize="small" 
                                                        sx={{ 
                                                            color: 'text.secondary',
                                                            opacity: 0.7
                                                        }} 
                                                    />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{ticket.department?.name}</TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                        {ticket.location}
                                        {ticket.room && (
                                            <Typography 
                                                component="span" 
                                                color="text.secondary"
                                                sx={{ ml: 0.5 }}
                                            >
                                                (Room: {ticket.room})
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Chip 
                                            label={ticket.status}
                                            color={statusColors[ticket.status] || 'default'}
                                            size="small"
                                            sx={{ 
                                                borderRadius: 1,
                                                '& .MuiChip-label': {
                                                    px: 2
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                        {new Date(ticket.createdDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/tickets/edit/${ticket.id}`;
                                                }}
                                                color="primary"
                                                size="small"
                                                sx={{ 
                                                    bgcolor: 'primary.50',
                                                    '&:hover': {
                                                        bgcolor: 'primary.100',
                                                    }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(ticket.id);
                                                }}
                                                color="error"
                                                size="small"
                                                sx={{ 
                                                    bgcolor: 'error.50',
                                                    '&:hover': {
                                                        bgcolor: 'error.100',
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTickets.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={7} 
                                        align="center"
                                        sx={{ 
                                            py: 4,
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No tickets found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Assigned Tickets Dialog */}
                <AssignedTicketsDialog
                    open={showAssignedTickets}
                    onClose={() => setShowAssignedTickets(false)}
                    tickets={assignedTickets}
                    onTicketUpdate={handleTicketUpdate}
                    onTicketClick={handleTicketClick}
                />

                {/* Ticket Details Dialog */}
                {selectedTicket && (
                    <TicketDetailsDialog
                        ticket={selectedTicket}
                        onClose={() => setSelectedTicket(null)}
                        onAssignTicket={handleAssignTicket}
                    />
                )}
            </Paper>
        </Container>
    )
}

export default TicketsPage
