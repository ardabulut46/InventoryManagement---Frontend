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
    Tooltip,
    Checkbox,
    FormGroup,
    FormControlLabel,
    CircularProgress,
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
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { getDepartmentTickets, deleteTicket, getMyTickets, updateTicketPriority, assignTicket, getMostOpenedByGroup, getMostOpenedToGroup } from '../../api/TicketService'
import { TICKET_PRIORITIES, TICKET_STATUS_COLORS, getStatusTranslation } from '../../utils/ticketConfig'
import PriorityChip from '../../components/PriorityChip'
import { getCurrentUser } from '../../api/auth'
import { API_URL } from '../../config'

function TicketsPage() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([])
    const [assignedTickets, setAssignedTickets] = useState([])
    const [mostOpenedByGroup, setMostOpenedByGroup] = useState([])
    const [mostOpenedToGroup, setMostOpenedToGroup] = useState([])
    const [loadingStats, setLoadingStats] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState('')
    const [showAssignedTickets, setShowAssignedTickets] = useState(false)
    const [columnDialogOpen, setColumnDialogOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(() => {
        const saved = localStorage.getItem('ticketsColumns');
        if (saved) return JSON.parse(saved);
        return ['registrationNumber', 'subject', 'department', 'location', 'status', 'createdDate', 'actions'];
    });

    useEffect(() => {
        fetchTickets()
        fetchStatistics()
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

    const fetchStatistics = async () => {
        try {
            const [byGroupResponse, toGroupResponse] = await Promise.all([
                getMostOpenedByGroup(),
                getMostOpenedToGroup()
            ]);
            setMostOpenedByGroup(byGroupResponse.data)
            setMostOpenedToGroup(toGroupResponse.data)
            setLoadingStats(false)
        } catch (err) {
            console.error('Error fetching statistics:', err)
            setLoadingStats(false)
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
        navigate(`/tickets/${ticket.id}`, { state: { source: 'tickets' } });
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

    const handleColumnChange = (key) => {
        setSelectedColumns(prev => {
            const next = prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key];
            localStorage.setItem('ticketsColumns', JSON.stringify(next));
            return next;
        });
    };

    const handleOpenColumnDialog = () => setColumnDialogOpen(true);
    const handleCloseColumnDialog = () => setColumnDialogOpen(false);

    const filteredTickets = tickets.filter(ticket =>
        Object.values(ticket).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    // Column config (Turkish)
    const COLUMN_CONFIG = [
        { key: 'registrationNumber', label: 'Kayıt No' },
        { key: 'subject', label: 'Konu' },
        { key: 'department', label: 'Departman' },
        { key: 'location', label: 'Konum' },
        { key: 'status', label: 'Durum' },
        { key: 'createdDate', label: 'Oluşturma Tarihi' },
        { key: 'actions', label: 'İşlemler' },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Statistics Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                            height: '100%'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon /> En Çok Çağrı Oluşturan Gruplar
                        </Typography>
                        {loadingStats ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            mostOpenedByGroup.map((group, index) => (
                                <Box
                                    key={group.groupId}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                        p: 2,
                                        bgcolor: 'grey.50',
                                        borderRadius: 2,
                                        '&:hover': {
                                            bgcolor: 'grey.100',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {index + 1}
                                        </Typography>
                                        <Typography>{group.groupName}</Typography>
                                    </Box>
                                    <Chip
                                        label={`${group.ticketCount} çağrı`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                            height: '100%'
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingDownIcon /> En Çok Çağrı Atanan Gruplar
                        </Typography>
                        {loadingStats ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            mostOpenedToGroup.map((group, index) => (
                                <Box
                                    key={group.groupId}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                        p: 2,
                                        bgcolor: 'grey.50',
                                        borderRadius: 2,
                                        '&:hover': {
                                            bgcolor: 'grey.100',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: '50%',
                                                bgcolor: 'secondary.main',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {index + 1}
                                        </Typography>
                                        <Typography>{group.groupName}</Typography>
                                    </Box>
                                    <Chip
                                        label={`${group.ticketCount} çağrı`}
                                        color="secondary"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            ))
                        )}
                    </Paper>
                </Grid>
            </Grid>

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
                        Çağrılar
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                            Yeni Çağrı Oluştur
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleOpenColumnDialog}
                        >
                            Kolonları Seç
                        </Button>
                        <Dialog open={columnDialogOpen} onClose={handleCloseColumnDialog}>
                            <DialogTitle>Görüntülenecek Kolonları Seçin</DialogTitle>
                            <DialogContent>
                                <FormGroup>
                                    {COLUMN_CONFIG.map(col => (
                                        <FormControlLabel
                                            key={col.key}
                                            control={
                                                <Checkbox
                                                    checked={selectedColumns.includes(col.key)}
                                                    onChange={() => handleColumnChange(col.key)}
                                                />
                                            }
                                            label={col.label}
                                        />
                                    ))}
                                </FormGroup>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseColumnDialog}>Kapat</Button>
                            </DialogActions>
                        </Dialog>
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
                                {COLUMN_CONFIG.map(col =>
                                    selectedColumns.includes(col.key) && (
                                        <TableCell key={col.key} sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }} align={col.key === 'actions' ? 'right' : 'left'}>
                                            {col.label}
                                        </TableCell>
                                    )
                                )}
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
                                    {selectedColumns.includes('registrationNumber') && (
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {ticket.registrationNumber}
                                                {ticket.attachmentPath && (
                                                    <Tooltip title="Ek var">
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
                                    )}
                                    {selectedColumns.includes('subject') && (
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography>{ticket.subject}</Typography>
                                                {ticket.attachmentPath && (
                                                    <Tooltip title="Ek var">
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
                                    )}
                                    {selectedColumns.includes('department') && (
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>{ticket.department?.name}</TableCell>
                                    )}
                                    {selectedColumns.includes('location') && (
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                            {ticket.location}
                                            {ticket.room && (
                                                <Typography 
                                                    component="span" 
                                                    color="text.secondary"
                                                    sx={{ ml: 0.5 }}
                                                >
                                                    (Oda: {ticket.room})
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}
                                    {selectedColumns.includes('status') && (
                                        <TableCell sx={{ py: 2 }}>
                                            <Chip 
                                                label={getStatusTranslation(ticket.status)}
                                                color={TICKET_STATUS_COLORS[ticket.status] || 'default'}
                                                size="small"
                                                sx={{ 
                                                    borderRadius: 1,
                                                    '& .MuiChip-label': {
                                                        px: 2
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    )}
                                    {selectedColumns.includes('createdDate') && (
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                            {new Date(ticket.createdDate).toLocaleDateString()}
                                        </TableCell>
                                    )}
                                    {selectedColumns.includes('actions') && (
                                        <TableCell sx={{ py: 2 }} align="right">
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/tickets/edit/${ticket.id}`, { state: { source: 'tickets' } });
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
                                    )}
                                </TableRow>
                            ))}
                            {filteredTickets.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={selectedColumns.length} 
                                        align="center"
                                        sx={{ 
                                            py: 4,
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        Çağrı bulunamadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    )
}

export default TicketsPage
