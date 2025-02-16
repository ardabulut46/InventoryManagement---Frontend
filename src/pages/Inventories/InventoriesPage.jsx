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
    Tabs,
    Tab,
    alpha,
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
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { 
    getActiveWarrantyInventories,
    getWarrantyExpiredInventories,
    getWarrantyExpiringInMonth,
    getWarrantyExpiringInFifteenDays,
    getMostRepairedInventories 
} from '../../api/WarrantyService';

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
    { id: 'purchasePrice', label: 'Purchase Price' },
    { id: 'purchaseCurrency', label: 'Currency' },
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
    'Müsait': 'success',
    'Kullanımda': 'primary',
    'Bakımda': 'warning',
    'Emekli': 'error',
    'Kayıp': 'error',
};

const CURRENCY_MAP = {
    1: 'TRY',
    2: 'USD',
    3: 'EUR'
};

const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];

function InventoryStats({ inventories, warrantyData }) {
    const theme = useTheme();
    const navigate = useNavigate();

    // Calculate status distribution
    const statusDistribution = inventories.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(statusDistribution).map(([name, value]) => ({
        name: name === 'Available' ? 'Müsait' :
             name === 'In Use' ? 'Kullanımda' :
             name === 'Under Maintenance' ? 'Bakımda' :
             name === 'Retired' ? 'Emekli' :
             name === 'Lost' ? 'Kayıp' : name,
        value
    }));

    // Calculate department distribution (top 5)
    const departmentDistribution = inventories.reduce((acc, inv) => {
        const deptName = inv.department?.name || 'Atanmamış';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
    }, {});

    const barData = Object.entries(departmentDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({
            name: name.length > 15 ? name.substring(0, 15) + '...' : name,
            value
        }));

    const handleWarrantyCardClick = (type) => {
        navigate('/inventories/warranty-status', { 
            state: { 
                activeTab: type,
                showOnlyActiveTab: true,
                tabData: {
                    active: type === 'active' ? warrantyData.active : null,
                    expired: type === 'expired' ? warrantyData.expired : null,
                    expiringInMonth: type === 'expiringMonth' ? warrantyData.expiringInMonth : null,
                    expiringInFifteenDays: type === 'expiringFifteen' ? warrantyData.expiringInFifteenDays : null,
                    mostRepaired: type === 'mostRepaired' ? warrantyData.mostRepaired : null
                }
            } 
        });
    };

    return (
        <Box sx={{ 
            mb: 4, 
            p: 3,
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 24px rgba(0, 0, 0, 0.3)'
                : '0 4px 24px rgba(0, 0, 0, 0.1)',
        }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Envanter Analizi</Typography>
            
            {/* Warranty and Repair Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        flexWrap: 'wrap',
                        '& > *': { 
                            flex: '1 1 200px',
                            minWidth: 200,
                            maxWidth: 300,
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }
                        }
                    }}>
                        {/* Active Warranty */}
                        <Paper
                            elevation={0}
                            onClick={() => handleWarrantyCardClick('active')}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            }}
                        >
                            <Typography variant="subtitle2" color="success.main" sx={{ mb: 1, fontWeight: 600 }}>
                                Garanti Süresi Devam Eden
                            </Typography>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                                {warrantyData.active?.length || 0}
                            </Typography>
                        </Paper>

                        {/* Expired Warranty */}
                        <Paper
                            elevation={0}
                            onClick={() => handleWarrantyCardClick('expired')}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                            }}
                        >
                            <Typography variant="subtitle2" color="error.main" sx={{ mb: 1, fontWeight: 600 }}>
                                Garanti Süresi Biten
                            </Typography>
                            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700 }}>
                                {warrantyData.expired?.length || 0}
                            </Typography>
                        </Paper>

                        {/* 1 Month Warning */}
                        <Paper
                            elevation={0}
                            onClick={() => handleWarrantyCardClick('expiringMonth')}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            }}
                        >
                            <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1, fontWeight: 600 }}>
                                1 Ay İçinde Sona Erecek
                            </Typography>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                                {warrantyData.expiringInMonth?.length || 0}
                            </Typography>
                        </Paper>

                        {/* 15 Days Warning */}
                        <Paper
                            elevation={0}
                            onClick={() => handleWarrantyCardClick('expiringFifteen')}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.warning.dark, 0.1),
                                border: `1px solid ${alpha(theme.palette.warning.dark, 0.2)}`,
                            }}
                        >
                            <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 1, fontWeight: 600 }}>
                                15 Gün İçinde Sona Erecek
                            </Typography>
                            <Typography variant="h4" color="warning.dark" sx={{ fontWeight: 700 }}>
                                {warrantyData.expiringInFifteenDays?.length || 0}
                            </Typography>
                        </Paper>

                        {/* Most Repaired */}
                        <Paper
                            elevation={0}
                            onClick={() => handleWarrantyCardClick('mostRepaired')}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                            }}
                        >
                            <Typography variant="subtitle2" color="info.main" sx={{ mb: 1, fontWeight: 600 }}>
                                En Çok Tamir Gören
                            </Typography>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                                {warrantyData.mostRepaired?.length || 0}
                            </Typography>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>Durum Dağılımı</Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (%${(percent * 100).toFixed(0)})`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>En Çok Envantere Sahip 5 Departman</Typography>
                    <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                <YAxis />
                                <RechartsTooltip />
                                <Bar dataKey="value" fill={theme.palette.primary.main}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Grid>
            </Grid>
        </Box>
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
    const [showColumnsDialog, setShowColumnsDialog] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [warrantyExpiringInventories, setWarrantyExpiringInventories] = useState([]);
    const [warrantyExpiredInventories, setWarrantyExpiredInventories] = useState([]);
    const [warrantyDialogOpen, setWarrantyDialogOpen] = useState(false);
    const [activeWarrantyTab, setActiveWarrantyTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeWarrantyInventories, setActiveWarrantyInventories] = useState([]);
    const [expiringInMonthInventories, setExpiringInMonthInventories] = useState([]);
    const [expiringInFifteenDaysInventories, setExpiringInFifteenDaysInventories] = useState([]);
    const [mostRepairedInventories, setMostRepairedInventories] = useState([]);

    useEffect(() => {
        fetchInventories();
        fetchWarrantyData();
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

    const fetchWarrantyData = async () => {
        setLoading(true);
        try {
            // Wrap each promise in a catch block to handle individual failures
            const results = await Promise.all([
                getActiveWarrantyInventories().catch(err => ({ data: [] })),
                getWarrantyExpiredInventories().catch(err => ({ data: [] })),
                getWarrantyExpiringInMonth().catch(err => ({ data: [] })),
                getWarrantyExpiringInFifteenDays().catch(err => ({ data: [] })),
                getMostRepairedInventories().catch(err => ({ data: [] }))
            ]);

            const [
                activeRes,
                expiredRes,
                expiringInMonthRes,
                expiringInFifteenDaysRes,
                mostRepairedRes
            ] = results;

            // Enhanced logging
            console.log('Raw Expired Warranty Response:', expiredRes);
            console.log('Expired Warranty Data:', expiredRes.data);
            console.log('Expiring in Month Data:', expiringInMonthRes.data);
            console.log('Expiring in 15 Days Data:', expiringInFifteenDaysRes.data);
            
            // Set states with null checks
            setActiveWarrantyInventories(activeRes?.data || []);
            setWarrantyExpiredInventories(expiredRes?.data || []);
            setExpiringInMonthInventories(expiringInMonthRes?.data || []);
            setExpiringInFifteenDaysInventories(expiringInFifteenDaysRes?.data || []);
            setMostRepairedInventories(mostRepairedRes?.data || []);

            // Log state after setting
            console.log('State after setting:', {
                expired: expiredRes?.data || [],
                active: activeRes?.data || [],
                expiringInMonth: expiringInMonthRes?.data || [],
                expiringInFifteenDays: expiringInFifteenDaysRes?.data || [],
                mostRepaired: mostRepairedRes?.data || []
            });

            // Clear any previous errors since we have some data
            setError('');
        } catch (err) {
            console.error('Failed to fetch warranty data:', err);
            setError('Failed to fetch some warranty data. Some information may be incomplete.');
        } finally {
            setLoading(false);
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
        navigate(`/inventories/detail/${inventory.id}`);
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

    const handleViewWarrantyDetails = (tabIndex) => {
        navigate('/inventories/warranty-status');
    };

    const calculateDaysRemaining = (endDate) => {
        if (!endDate) return null;
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getWarrantyStatusChip = (endDate) => {
        const daysRemaining = calculateDaysRemaining(endDate);
        
        if (daysRemaining === null) return null;
        
        if (daysRemaining < 0) {
            return (
                <Chip 
                    label="Süresi Dolmuş" 
                    color="error" 
                    size="small"
                />
            );
        }
        
        if (daysRemaining <= 30) {
            return (
                <Chip 
                    label={`${daysRemaining} gün kaldı`} 
                    color="warning" 
                    size="small"
                />
            );
        }
        
        return (
            <Chip 
                label={`${daysRemaining} gün kaldı`} 
                color="success" 
                size="small"
            />
        );
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

                <InventoryStats 
                    inventories={filteredInventories} 
                    warrantyData={{
                        active: activeWarrantyInventories,
                        expired: warrantyExpiredInventories,
                        expiringInMonth: expiringInMonthInventories,
                        expiringInFifteenDays: expiringInFifteenDaysInventories,
                        mostRepaired: mostRepairedInventories
                    }}
                />

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
                                    onClick={() => navigate(`/inventories/detail/${inventory.id}`)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
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
                                                                '&:hover': { bgcolor: 'primary.100' }
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
                                                                '&:hover': { bgcolor: 'error.100' }
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
                                                            '& .MuiChip-label': { px: 2 }
                                                        }}
                                                    />
                                                </TableCell>
                                            );
                                        } else if (['warrantyStartDate', 'warrantyEndDate', 'createdDate', 'updatedDate'].includes(column.id)) {
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
                                        } else if (column.id === 'purchasePrice') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.purchasePrice ? `${inventory.purchasePrice.toLocaleString()} ${CURRENCY_MAP[inventory.purchaseCurrency] || '-'}` : '-'}
                                                </TableCell>
                                            );
                                        } else if (column.id === 'purchaseCurrency') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {CURRENCY_MAP[inventory.purchaseCurrency] || '-'}
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
            </Paper>
        </Container>
    );
}

export default InventoriesPage;
