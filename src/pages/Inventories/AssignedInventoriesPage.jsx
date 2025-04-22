import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Tooltip,
    IconButton,
    Card,
    CardContent,
    Grid,
    Divider,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import {
    Search as SearchIcon,
    Info as InfoIcon,
    CalendarToday as CalendarIcon,
    Computer as ComputerIcon,
    Memory as MemoryIcon,
    Build as BuildIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    AttachFile as AttachmentIcon,
    Close as CloseIcon,
    Group as GroupIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAssignedInventories } from '../../api/InventoryService';
import { format } from 'date-fns';

const STATUS_MAP = {
    1: 'Müsait',    // Available
    2: 'Kullanımda', // InUse
    3: 'Bakımda',    // UnderMaintenance
    4: 'Emekli',     // Retired
    5: 'Kayıp',      // Lost
    // Legacy string values (if any still exist in the system)
    'Available': 'Müsait',
    'In Use': 'Kullanımda',
    'Under Maintenance': 'Bakımda',
    'Retired': 'Emekli',
    'Lost': 'Kayıp',
};

const STATUS_LIST = [
    { value: 'all', label: 'Tümü', color: 'default' },
    { value: 1, label: 'Müsait', color: 'success' },
    { value: 2, label: 'Kullanımda', color: 'primary' },
    { value: 3, label: 'Bakımda', color: 'warning' },
    { value: 4, label: 'Emekli', color: 'default' },
    { value: 5, label: 'Kayıp', color: 'error' },
];
const STATUS_COLORS = {
    1: '#4caf50',
    2: '#1976d2',
    3: '#ff9800',
    4: '#757575',
    5: '#f44336',
};
const COLUMNS = [
    { id: 'barcode', label: 'Barkod / Seri No', always: true },
    { id: 'family', label: 'Aile / Tip' },
    { id: 'brand', label: 'Marka / Model' },
    { id: 'location', label: 'Konum' },
    { id: 'status', label: 'Durum' },
    { id: 'warrantyEndDate', label: 'Garanti Bitiş' },
    { id: 'actions', label: 'İşlemler', always: true },
];

const AssignedInventoriesPage = () => {
    const [inventories, setInventories] = useState([]);
    const [filteredInventories, setFilteredInventories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();
    const [statusFilter, setStatusFilter] = useState('all');
    const [visibleColumns, setVisibleColumns] = useState(
        COLUMNS.filter(col => col.always || ['barcode', 'brand', 'status'].includes(col.id)).map(col => col.id)
    );
    const [showColumnsDialog, setShowColumnsDialog] = useState(false);

    useEffect(() => {
        fetchAssignedInventories();
    }, []);

    useEffect(() => {
        if (inventories.length > 0) {
            filterInventories();
        }
    }, [searchTerm, inventories, statusFilter]);

    const fetchAssignedInventories = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAssignedInventories();
            setInventories(response.data);
            setFilteredInventories(response.data);
        } catch (err) {
            console.error('Error fetching assigned inventories:', err);
            setError('Failed to load assigned inventories. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filterInventories = () => {
        let filtered = inventories;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(inv => String(inv.status) === String(statusFilter));
        }
        if (searchTerm.trim()) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(inventory => 
                (inventory.barcode && inventory.barcode.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (inventory.serialNumber && inventory.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (inventory.familyName && inventory.familyName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (inventory.typeName && inventory.typeName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (inventory.brandName && inventory.brandName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (inventory.modelName && inventory.modelName.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (inventory.location && inventory.location.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (inventory.status && (STATUS_MAP[inventory.status] || inventory.status).toLowerCase().includes(lowerCaseSearchTerm))
            );
        }
        setFilteredInventories(filtered);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleViewDetails = (id) => {
        navigate(`/inventories/detail/${id}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status) => {
        const statusStr = STATUS_MAP[status] || status;
        if (!statusStr || typeof statusStr !== 'string') return 'info';
        switch (statusStr.toLowerCase()) {
            case 'kullanılabilir':
            case 'müsait':
                return 'success';
            case 'arızalı':
                return 'error';
            case 'bakımda':
                return 'warning';
            case 'kayıp':
                return 'error';
            case 'emekli':
            case 'hurdaya ayrılmış':
                return 'default';
            case 'kullanımda':
                return 'primary';
            default:
                return 'info';
        }
    };

    // Status distribution for summary
    const statusDistribution = inventories.reduce((acc, inv) => {
        const key = inv.status;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const handleColumnToggle = (columnId) => {
        if (COLUMNS.find(col => col.id === columnId)?.always) return;
        setVisibleColumns(prev =>
            prev.includes(columnId)
                ? prev.filter(id => id !== columnId)
                : [...prev, columnId]
        );
    };

    const renderInventoryCard = (inventory) => (
        <Card 
            key={inventory.id} 
            sx={{ 
                mb: 2, 
                borderRadius: 2,
                boxShadow: theme.palette.mode === 'dark' 
                    ? '0 4px 8px rgba(0,0,0,0.4)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.palette.mode === 'dark' 
                        ? '0 8px 16px rgba(0,0,0,0.6)' 
                        : '0 8px 16px rgba(0,0,0,0.1)',
                }
            }}
        >
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ComputerIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="h6" component="div">
                                {inventory.brandName} {inventory.modelName}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Aile:</strong> {inventory.familyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Tip:</strong> {inventory.typeName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Barkod:</strong> {inventory.barcode || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Seri No:</strong> {inventory.serialNumber || 'N/A'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Chip 
                                label={STATUS_MAP[inventory.status] || inventory.status} 
                                color={getStatusColor(inventory.status)}
                                size="small"
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Konum:</strong> {inventory.location || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Oda:</strong> {inventory.room || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Kat:</strong> {inventory.floor || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Departman:</strong> {inventory.department || 'N/A'}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Garanti Başlangıç:</strong> {formatDate(inventory.warrantyStartDate)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Garanti Bitiş:</strong> {formatDate(inventory.warrantyEndDate)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => handleViewDetails(inventory.id)}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                        >
                            Detayları Görüntüle
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );

    return (
        <Box>
            {/* Modern Header with Group Icon */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                        Üzerimdeki Envanterler
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Size atanmış tüm envanterlerin listesi
                    </Typography>
                </Box>
            </Box>

            {/* Summary Bar with Status Chips */}
            <Paper elevation={0} sx={{ mb: 3, p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 2 }}>
                    Toplam <span style={{ color: theme.palette.primary.main }}>{inventories.length}</span> envanter
                </Typography>
                {STATUS_LIST.filter(s => s.value !== 'all').map(s => (
                    <Chip
                        key={s.value}
                        label={`${s.label}: ${statusDistribution[s.value] || 0}`}
                        color={s.color}
                        sx={{ fontWeight: 500, bgcolor: STATUS_COLORS[s.value], color: '#fff', mr: 1 }}
                        variant={statusFilter === String(s.value) ? 'filled' : 'outlined'}
                        onClick={() => setStatusFilter(String(s.value))}
                        clickable
                    />
                ))}
                <Button size="small" onClick={() => { setStatusFilter('all'); setSearchTerm(''); }} sx={{ ml: 'auto' }}>
                    Filtreleri Temizle
                </Button>
            </Paper>

            {/* Sticky Search Bar with Status Filter Chips */}
            <Box sx={{ mb: 3, position: 'sticky', top: 0, zIndex: 10, bgcolor: theme.palette.background.paper, pb: 1 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Envanter ara... (Barkod, Seri No, Marka, Model, Konum vb.)"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                    }}
                    sx={{ maxWidth: 600, bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : '#fff', boxShadow: 1 }}
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {STATUS_LIST.map(s => (
                        <Chip
                            key={s.value}
                            label={s.label}
                            color={s.color}
                            variant={statusFilter === String(s.value) ? 'filled' : 'outlined'}
                            onClick={() => setStatusFilter(String(s.value))}
                            clickable
                            sx={{ fontWeight: 500, bgcolor: statusFilter === String(s.value) ? STATUS_COLORS[s.value] : undefined, color: statusFilter === String(s.value) ? '#fff' : undefined }}
                        />
                    ))}
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            ) : filteredInventories.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Üzerinize atanmış envanter bulunamadı.
                </Alert>
            ) : (
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        Toplam {filteredInventories.length} envanter bulundu
                    </Typography>
                    {/* Mobile view - Cards */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        {filteredInventories.map(inventory => renderInventoryCard(inventory))}
                    </Box>
                    {/* Desktop view - Table */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<InfoIcon />}
                            onClick={() => setShowColumnsDialog(true)}
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1, borderWidth: 1.5, whiteSpace: 'nowrap' }}
                        >
                            Sütunlar
                        </Button>
                    </Box>
                    {/* Columns Dialog */}
                    <Dialog
                        open={showColumnsDialog}
                        onClose={() => setShowColumnsDialog(false)}
                        PaperProps={{ sx: { borderRadius: 2, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }}
                    >
                        <DialogTitle>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Typography variant="h6">Gösterilecek Sütunlar</Typography>
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
                                sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                            >
                                Kapat
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {COLUMNS.filter(col => visibleColumns.includes(col.id)).map(column => (
                                            <TableCell key={column.id}>{column.label}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredInventories.map((inventory) => (
                                        <TableRow key={inventory.id} hover>
                                            {COLUMNS.filter(col => visibleColumns.includes(col.id)).map(column => {
                                                if (column.id === 'barcode') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                {inventory.barcode || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {inventory.serialNumber || 'N/A'}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'family') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Typography variant="body2">
                                                                {inventory.familyName || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {inventory.typeName || 'N/A'}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'brand') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Typography variant="body2">
                                                                {inventory.brandName || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {inventory.modelName || 'N/A'}
                                                            </Typography>
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'location') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Tooltip title={`Oda: ${inventory.room || 'N/A'}, Kat: ${inventory.floor || 'N/A'}, Departman: ${inventory.department || 'N/A'}`}>
                                                                <Typography variant="body2">
                                                                    {inventory.location || 'N/A'}
                                                                </Typography>
                                                            </Tooltip>
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'status') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            <Chip 
                                                                label={STATUS_MAP[inventory.status] || inventory.status} 
                                                                color={getStatusColor(inventory.status)}
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'warrantyEndDate') {
                                                    return (
                                                        <TableCell key={column.id}>
                                                            {formatDate(inventory.warrantyEndDate)}
                                                        </TableCell>
                                                    );
                                                }
                                                if (column.id === 'actions') {
                                                    return (
                                                        <TableCell key={column.id} align="right">
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => handleViewDetails(inventory.id)}
                                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                                            >
                                                                Detaylar
                                                            </Button>
                                                        </TableCell>
                                                    );
                                                }
                                                return <TableCell key={column.id}>-</TableCell>;
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default AssignedInventoriesPage; 