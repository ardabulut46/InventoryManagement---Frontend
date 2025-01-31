import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Tooltip,
    Alert,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Container,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    FilterList as FilterIcon,
    ViewColumn as ViewColumnIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getInventories, deleteInventory, getAssignmentHistory, downloadInvoice, downloadExcelTemplate, importExcel } from '../../api/InventoryService';

const COLUMNS = [
    { id: 'id', label: 'ID', always: true },
    { id: 'barcode', label: 'Barcode' },
    { id: 'serialNumber', label: 'Serial Number' },
    { id: 'family', label: 'Family' },
    { id: 'type', label: 'Type' },
    { id: 'brand', label: 'Brand' },
    { id: 'model', label: 'Model' },
    { id: 'location', label: 'Location' },
    { id: 'status', label: 'Status' },
    { id: 'room', label: 'Room' },
    { id: 'floor', label: 'Floor' },
    { id: 'block', label: 'Block' },
    { id: 'department', label: 'Department' },
    { id: 'warrantyStartDate', label: 'Warranty Start' },
    { id: 'warrantyEndDate', label: 'Warranty End' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'supportCompany', label: 'Support Company' },
    { id: 'assignedUser', label: 'Assigned User' },
    { id: 'createdDate', label: 'Created Date' },
    { id: 'updatedDate', label: 'Updated Date' },
    { id: 'actions', label: 'Actions', always: true },
];

const statusColors = {
    'Available': 'success',
    'In Use': 'primary',
    'Under Maintenance': 'warning',
    'Retired': 'error',
    'Lost': 'error',
};

function HistoryDialog({ inventoryId, onClose }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
    }, [inventoryId]);

    const loadHistory = async () => {
        try {
            const response = await getAssignmentHistory(inventoryId);
            setHistory(response.data);
        } catch (err) {
            console.error('Error loading history:', err);
        }
    };

    return (
        <Dialog
            open={true}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Assignment History</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Assignment Date</TableCell>
                                <TableCell>Return Date</TableCell>
                                <TableCell>Notes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.user?.email}</TableCell>
                                    <TableCell>
                                        {new Date(item.assignmentDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {item.returnDate 
                                            ? new Date(item.returnDate).toLocaleDateString()
                                            : <Chip label="Active" color="primary" size="small" />
                                        }
                                    </TableCell>
                                    <TableCell>{item.notes || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

function InventoryDetailsDialog({ inventory, onClose }) {
    const [showHistory, setShowHistory] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    console.log('Inventory details:', inventory); // Debug log

    // ... existing code ...

    const handleDownloadInvoice = async () => {
        try {
            setIsDownloading(true);
            const response = await downloadInvoice(inventory.id);

            // Get filename from Content-Disposition header or use default
            let filename = `invoice_${inventory.id}`;
            const disposition = response.headers['content-disposition'];
            if (disposition && disposition.indexOf('filename=') !== -1) {
                const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }

            // Get the correct MIME type from response
            const contentType = response.headers['content-type'];
            
            // Create blob with the correct MIME type
            const blob = new Blob([response.data], { type: contentType });
            
            // Create and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // The filename should include the extension from the server
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            // You might want to show an error notification here
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Dialog
                open={true}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Inventory Details</Typography>
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
                                    <Typography variant="subtitle2" color="text.secondary">Barcode</Typography>
                                    <Typography>{inventory.barcode}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Serial Number</Typography>
                                    <Typography>{inventory.serialNumber || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Brand & Model</Typography>
                                    <Typography>{inventory.brand} {inventory.model}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                                    <Typography>{inventory.type || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Family</Typography>
                                    <Typography>{inventory.family || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Status and Assignment */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                Status and Assignment
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                                    <Chip 
                                        label={inventory.status}
                                        color={statusColors[inventory.status] || 'default'}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Assigned User</Typography>
                                    <Typography>{inventory.assignedUser?.email || 'Not assigned'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                                    <Typography>{inventory.department?.name || '-'}</Typography>
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
                                    <Typography>{inventory.location || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Room</Typography>
                                    <Typography>{inventory.room || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Floor</Typography>
                                    <Typography>{inventory.floor || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Block</Typography>
                                    <Typography>{inventory.block || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Warranty and Support */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                Warranty and Support
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Warranty Period</Typography>
                                    <Typography>
                                        {inventory.warrantyStartDate ? (
                                            `${new Date(inventory.warrantyStartDate).toLocaleDateString()} - ${new Date(inventory.warrantyEndDate).toLocaleDateString()}`
                                        ) : '-'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Supplier</Typography>
                                    <Typography>{inventory.supplier || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Support Company</Typography>
                                    <Typography>{inventory.supportCompany?.name || '-'}</Typography>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Invoice */}
                        {inventory.invoiceAttachmentPath && (
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                    Invoice
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography>
                                        {inventory.invoiceAttachmentPath.split('/').pop()}
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={handleDownloadInvoice}
                                        disabled={isDownloading}
                                        sx={{ 
                                            borderRadius: 1,
                                            textTransform: 'none',
                                            minWidth: 'auto'
                                        }}
                                    >
                                        {isDownloading ? 'Downloading...' : 'Download Invoice'}
                                    </Button>
                                </Box>
                            </Grid>
                        )}

                        {/* Dates */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium', mt: 2 }}>
                                Dates
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Created Date</Typography>
                                    <Typography>{new Date(inventory.createdDate).toLocaleString()}</Typography>
                                </Box>
                                {inventory.updatedDate && (
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                                        <Typography>{new Date(inventory.updatedDate).toLocaleString()}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={() => setShowHistory(true)}
                        variant="outlined"
                        color="primary"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                        }}
                    >
                        Geçmişi Gör
                    </Button>
                    <Button 
                        component={Link}
                        to={`/inventories/edit/${inventory.id}`}
                        color="primary"
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
                        Edit Inventory
                    </Button>
                </DialogActions>
            </Dialog>
            {showHistory && (
                <HistoryDialog 
                    inventoryId={inventory.id} 
                    onClose={() => setShowHistory(false)} 
                />
            )}
        </>
    );
}

function InventoriesPage() {
    const [inventories, setInventories] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(
        COLUMNS.filter(col => col.always || ['barcode', 'brand', 'model', 'status'].includes(col.id))
            .map(col => col.id)
    );
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [showColumnsDialog, setShowColumnsDialog] = useState(false);
    const [selectedHistoryInventoryId, setSelectedHistoryInventoryId] = useState(null);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchInventories();
    }, []);

    const fetchInventories = async () => {
        try {
            const response = await getInventories();
            setInventories(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch inventories.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this inventory?')) {
            try {
                await deleteInventory(id);
                fetchInventories();
            } catch (err) {
                setError('Failed to delete inventory.');
            }
        }
    };

    const filteredInventories = inventories.filter(inventory =>
        Object.values(inventory).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleFilterClick = (event) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleColumnToggle = (columnId) => {
        if (columnId === 'id' || columnId === 'actions') return; // Can't toggle these
        setVisibleColumns(prev => {
            if (prev.includes(columnId)) {
                return prev.filter(id => id !== columnId);
            } else {
                return [...prev, columnId];
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const handleInventoryClick = (inventory) => {
        setSelectedInventory(inventory);
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await downloadExcelTemplate();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'inventory_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download template: ' + err.message);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const response = await importExcel(file);
            setSuccessMessage(response.data.message);
            fetchInventories(); // Refresh the inventory list
            event.target.value = ''; // Reset file input
        } catch (err) {
            setError(err.response?.data?.errors?.join('\n') || 'Failed to import file');
        }
    };

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
                        Inventories
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ViewColumnIcon />}
                            onClick={() => setShowColumnsDialog(true)}
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
                            Columns
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleDownloadTemplate}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                            }}
                        >
                            Download Template
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            onClick={handleImportClick}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                            }}
                        >
                            Import Excel
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept=".xlsx"
                        />
                        <Button
                            component={Link}
                            to="/inventories/create"
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                                }
                            }}
                        >
                            Create New Inventory
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        onClose={() => setError('')}
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert 
                        severity="success" 
                        onClose={() => setSuccessMessage('')}
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        {successMessage}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search inventories..."
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

                <TableContainer 
                    sx={{ 
                        borderRadius: 2, 
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 300px)', // Gives space for header and search
                        '&::-webkit-scrollbar': {
                            width: 8,
                            height: 8,
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'background.default',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'grey.300',
                            borderRadius: 4,
                            '&:hover': {
                                backgroundColor: 'grey.400',
                            },
                        },
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                {COLUMNS.filter(col => visibleColumns.includes(col.id)).map(column => (
                                    <TableCell 
                                        key={column.id} 
                                        sx={{ 
                                            fontWeight: 600, 
                                            py: 2, 
                                            color: 'text.secondary' 
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInventories.map((inventory) => (
                                <TableRow 
                                    key={inventory.id}
                                    onClick={() => handleInventoryClick(inventory)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    {COLUMNS.filter(col => visibleColumns.includes(col.id)).map(column => {
                                        if (column.id === 'actions') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/inventories/edit/${inventory.id}`);
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
                                                                handleDelete(inventory.id);
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
                                            );
                                        } else if (column.id === 'status') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    <Chip 
                                                        label={inventory.status}
                                                        color={statusColors[inventory.status] || 'default'}
                                                        size="small"
                                                        sx={{ 
                                                            borderRadius: 1,
                                                            '& .MuiChip-label': {
                                                                px: 2
                                                            }
                                                        }}
                                                    />
                                                </TableCell>
                                            );
                                        } else if (column.id === 'warrantyStartDate' || column.id === 'warrantyEndDate' || column.id === 'createdDate' || column.id === 'updatedDate') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {formatDate(inventory[column.id])}
                                                </TableCell>
                                            );
                                        } else if (column.id === 'department') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.department?.name || '-'}
                                                </TableCell>
                                            );
                                        } else if (column.id === 'supplier') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.supplier?.name || '-'}
                                                </TableCell>
                                            );
                                        } else if (column.id === 'supportCompany') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.supportCompany?.name || '-'}
                                                </TableCell>
                                            );
                                        } else if (column.id === 'assignedUser') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.assignedUser?.email || '-'}
                                                </TableCell>
                                            );
                                        } else {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory[column.id] || '-'}
                                                </TableCell>
                                            );
                                        }
                                    })}
                                </TableRow>
                            ))}
                            {filteredInventories.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={visibleColumns.length} 
                                        align="center"
                                        sx={{ 
                                            py: 4,
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No inventories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Columns Dialog */}
                <Dialog
                    open={showColumnsDialog}
                    onClose={() => setShowColumnsDialog(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            maxWidth: 400,
                            width: '100%',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6">Show/Hide Columns</Typography>
                            <IconButton onClick={() => setShowColumnsDialog(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {COLUMNS.map((column) => (
                                <FormControlLabel
                                    key={column.id}
                                    control={
                                        <Checkbox
                                            checked={visibleColumns.includes(column.id)}
                                            onChange={() => handleColumnToggle(column.id)}
                                            disabled={column.always}
                                        />
                                    }
                                    label={column.label}
                                />
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button 
                            onClick={() => setShowColumnsDialog(false)}
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3,
                            }}
                        >
                            Done
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Inventory Details Dialog */}
                {selectedInventory && (
                    <InventoryDetailsDialog
                        inventory={selectedInventory}
                        onClose={() => setSelectedInventory(null)}
                    />
                )}
            </Paper>
        </Container>
    );
}

export default InventoriesPage;
