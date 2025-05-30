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
    Card,
    CardContent,
    LinearProgress,
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
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Timeline as TimelineIcon,
    Receipt as ReceiptIcon,
    Inventory as InventoryIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getInventories, deleteInventory, getAssignmentHistory, downloadInvoice, downloadExcelTemplate, importExcel } from '../../api/InventoryService';
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip as RechartsTooltip, 
    Legend,
    LineChart,
    Line,
    CartesianGrid,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
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
    { id: 'barcode', label: 'Barkod' },
    { id: 'serialNumber', label: 'Seri Numarası' },
    { id: 'family', label: 'Aile' },
    { id: 'type', label: 'Tip' },
    { id: 'brand', label: 'Marka' },
    { id: 'model', label: 'Model' },
    { id: 'location', label: 'Konum' },
    { id: 'status', label: 'Durum' },
    { id: 'room', label: 'Oda' },
    { id: 'floor', label: 'Kat' },
    { id: 'block', label: 'Blok' },
    { id: 'department', label: 'Departman' },
    { id: 'assignedUser', label: 'Atanan Kullanıcı' },
    { id: 'createdUser', label: 'Oluşturan Kullanıcı' },
    { id: 'warrantyStartDate', label: 'Garanti Başlangıç Tarihi' },
    { id: 'warrantyEndDate', label: 'Garanti Bitiş Tarihi' },
    { id: 'purchasePrice', label: 'Satın Alma Fiyatı' },
    { id: 'purchaseCurrency', label: 'Para Birimi' },
    { id: 'createdDate', label: 'Oluşturma Tarihi' },
    { id: 'updatedDate', label: 'Güncelleme Tarihi' },
    { id: 'actions', label: 'İşlemler', always: true },
];

const statusColors = {
    'Müsait': 'success',
    'Kullanımda': 'primary',
    'Bakımda': 'warning',
    'Emekli': 'error',
    'Kayıp': 'error',
    1: 'success',
    2: 'primary',
    3: 'warning',
    4: 'error',
    5: 'error',
};

const CURRENCY_MAP = {
    1: 'TRY',
    2: 'USD',
    3: 'EUR'
};

// Turkish translation map for status values
const statusTranslations = {
    'Available': 'Müsait',
    'In Use': 'Kullanımda',
    'Under Maintenance': 'Bakımda',
    'Retired': 'Emekli',
    'Lost': 'Kayıp'
};

// Enhanced status mapping system
const STATUS_MAP = {
    // API enum status values to display values (Turkish)
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

// Enhanced color palette for better visualization
const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#3f51b5', '#e91e63'];

// Create a reverse mapping for status values (English to Turkish)
const reverseStatusMap = {
    'InUse': 'Kullanımda',
    'UnderMaintenance': 'Bakımda',
    'Available': 'Müsait',
    'Retired': 'Emekli',
    'Lost': 'Kayıp'
};

function InventoryStats({ inventories, warrantyData, onCardClick }) {
    const theme = useTheme();
    const navigate = useNavigate();

    // Calculate status distribution with the correct mapping
    const statusDistribution = inventories.reduce((acc, inv) => {
        const status = inv.status;
        const translatedStatus = STATUS_MAP[status] || status;
        acc[translatedStatus] = (acc[translatedStatus] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(statusDistribution).map(([name, value]) => ({
        name,
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

    // Calculate brand distribution
    const brandDistribution = inventories.reduce((acc, inv) => {
        const brand = inv.brand || 'Belirtilmemiş';
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
    }, {});

    const brandData = Object.entries(brandDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({
            name,
            value
        }));

    // Calculate inventory age distribution
    const currentYear = new Date().getFullYear();
    const ageDistribution = inventories.reduce((acc, inv) => {
        if (!inv.purchaseDate) return acc;
        
        const purchaseYear = new Date(inv.purchaseDate).getFullYear();
        const age = currentYear - purchaseYear;
        
        let ageGroup;
        if (age < 1) ageGroup = '< 1 Yıl';
        else if (age < 2) ageGroup = '1-2 Yıl';
        else if (age < 3) ageGroup = '2-3 Yıl';
        else if (age < 5) ageGroup = '3-5 Yıl';
        else ageGroup = '5+ Yıl';
        
        acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        return acc;
    }, {});

    // Sort age groups in chronological order
    const ageOrder = ['< 1 Yıl', '1-2 Yıl', '2-3 Yıl', '3-5 Yıl', '5+ Yıl'];
    const ageData = ageOrder
        .filter(group => ageDistribution[group])
        .map(group => ({
            name: group,
            value: ageDistribution[group] || 0
        }));

    // Calculate warranty status percentages
    const totalInventoriesWithWarranty = inventories.filter(inv => inv.warrantyEndDate).length;
    const activeWarrantyPercentage = totalInventoriesWithWarranty ? 
        ((warrantyData.active?.length || 0) / totalInventoriesWithWarranty * 100).toFixed(1) : 0;
    const expiredWarrantyPercentage = totalInventoriesWithWarranty ? 
        ((warrantyData.expired?.length || 0) / totalInventoriesWithWarranty * 100).toFixed(1) : 0;
    const expiringMonthPercentage = totalInventoriesWithWarranty ? 
        ((warrantyData.expiringInMonth?.length || 0) / totalInventoriesWithWarranty * 100).toFixed(1) : 0;
    const expiringFifteenPercentage = totalInventoriesWithWarranty ? 
        ((warrantyData.expiringInFifteenDays?.length || 0) / totalInventoriesWithWarranty * 100).toFixed(1) : 0;

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

    // Calculate total inventory value
    const totalValue = inventories.reduce((sum, inv) => {
        if (!inv.purchasePrice) return sum;
        return sum + parseFloat(inv.purchasePrice);
    }, 0);

    // Calculate value by currency
    const valueByCategory = inventories.reduce((acc, inv) => {
        if (!inv.purchasePrice || !inv.purchaseCurrency) return acc;
        
        const currency = CURRENCY_MAP[inv.purchaseCurrency] || 'Diğer';
        if (!acc[currency]) acc[currency] = 0;
        acc[currency] += parseFloat(inv.purchasePrice);
        
        return acc;
    }, {});

    const currencyData = Object.entries(valueByCategory).map(([currency, value]) => ({
        name: currency,
        value: parseFloat(value.toFixed(2))
    }));

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
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
                Envanter Analiz Paneli
            </Typography>
            
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' },
                            cursor: 'pointer'
                        }}
                        onClick={() => onCardClick('all')}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary">Toplam Envanter</Typography>
                                <InfoIcon color="primary" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{inventories.length}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sistemde kayıtlı tüm envanter sayısı
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' },
                            cursor: 'pointer'
                        }}
                        onClick={() => onCardClick('InUse')}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary">Kullanımda</Typography>
                                <CheckCircleIcon color="success" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {statusDistribution['Kullanımda'] || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aktif olarak kullanılan envanter sayısı
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' },
                            cursor: 'pointer'
                        }}
                        onClick={() => onCardClick('Available')}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary">Müsait</Typography>
                                <InventoryIcon color="info" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {statusDistribution['Müsait'] || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Müsait durumdaki envanter sayısı
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card 
                        sx={{ 
                            height: '100%', 
                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' },
                            cursor: 'pointer'
                        }}
                        onClick={() => onCardClick('UnderMaintenance')}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary">Bakımda</Typography>
                                <WarningIcon color="warning" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {statusDistribution['Bakımda'] || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Bakım/onarım sürecindeki envanter sayısı
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ 
                        height: '100%', 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" color="text.secondary">Toplam Değer</Typography>
                                <TimelineIcon color="info" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {totalValue.toLocaleString('tr-TR')} ₺
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tüm envanterin toplam değeri
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Warranty and Repair Stats */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                Garanti Durumu
            </Typography>
            
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 600 }}>
                                    Garanti Süresi Devam Eden
                                </Typography>
                                <CheckCircleIcon color="success" fontSize="small" />
                            </Box>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                                {warrantyData.active?.length || 0}
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={parseFloat(activeWarrantyPercentage)} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.success.main, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: theme.palette.success.main
                                    }
                                }} 
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Toplam garantili envanterın %{activeWarrantyPercentage}'i
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 600 }}>
                                    Garanti Süresi Biten
                                </Typography>
                                <ErrorIcon color="error" fontSize="small" />
                            </Box>
                            <Typography variant="h4" color="error.main" sx={{ fontWeight: 700, mb: 1 }}>
                                {warrantyData.expired?.length || 0}
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={parseFloat(expiredWarrantyPercentage)} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: theme.palette.error.main
                                    }
                                }} 
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Toplam garantili envanterın %{expiredWarrantyPercentage}'i
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 600 }}>
                                    1 Ay İçinde Sona Erecek
                                </Typography>
                                <WarningIcon color="warning" fontSize="small" />
                            </Box>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                                {warrantyData.expiringInMonth?.length || 0}
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={parseFloat(expiringMonthPercentage)} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: theme.palette.warning.main
                                    }
                                }} 
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Toplam garantili envanterın %{expiringMonthPercentage}'i
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="warning.dark" sx={{ fontWeight: 600 }}>
                                    15 Gün İçinde Sona Erecek
                                </Typography>
                                <WarningIcon sx={{ color: theme.palette.warning.dark }} fontSize="small" />
                            </Box>
                            <Typography variant="h4" color="warning.dark" sx={{ fontWeight: 700, mb: 1 }}>
                                {warrantyData.expiringInFifteenDays?.length || 0}
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={parseFloat(expiringFifteenPercentage)} 
                                sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.warning.dark, 0.2),
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: theme.palette.warning.dark
                                    }
                                }} 
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Toplam garantili envanterın %{expiringFifteenPercentage}'i
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 600 }}>
                                    En Çok Tamir Gören
                                </Typography>
                                <TrendingUpIcon color="info" fontSize="small" />
                            </Box>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                                {warrantyData.mostRepaired?.length || 0}
                            </Typography>
                            <Box sx={{ height: 8, borderRadius: 4, bgcolor: alpha(theme.palette.info.main, 0.2) }} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Sık bakım gerektiren envanter sayısı
                            </Typography>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            {/* Charts */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                Envanter Dağılımı
            </Typography>
            
            <Grid container spacing={3}>
                {/* Status and Warranty Distribution - Combined Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Durum ve Garanti Analizi</Typography>
                        <Box sx={{ height: 350, width: '100%' }}>
                            <ResponsiveContainer>
                                <BarChart
                                    data={[
                                        {
                                            name: 'Kullanımda',
                                            'Garantili': inventories.filter(inv => 
                                                inv.status === 2 && // InUse = 2
                                                inv.warrantyEndDate && 
                                                new Date(inv.warrantyEndDate) > new Date()
                                            ).length,
                                            'Garantisiz': inventories.filter(inv => 
                                                inv.status === 2 && // InUse = 2
                                                (!inv.warrantyEndDate || new Date(inv.warrantyEndDate) <= new Date())
                                            ).length,
                                        },
                                        {
                                            name: 'Müsait',
                                            'Garantili': inventories.filter(inv => 
                                                inv.status === 1 && // Available = 1
                                                inv.warrantyEndDate && 
                                                new Date(inv.warrantyEndDate) > new Date()
                                            ).length,
                                            'Garantisiz': inventories.filter(inv => 
                                                inv.status === 1 && // Available = 1
                                                (!inv.warrantyEndDate || new Date(inv.warrantyEndDate) <= new Date())
                                            ).length,
                                        },
                                        {
                                            name: 'Bakımda',
                                            'Garantili': inventories.filter(inv => 
                                                inv.status === 3 && // UnderMaintenance = 3
                                                inv.warrantyEndDate && 
                                                new Date(inv.warrantyEndDate) > new Date()
                                            ).length,
                                            'Garantisiz': inventories.filter(inv => 
                                                inv.status === 3 && // UnderMaintenance = 3
                                                (!inv.warrantyEndDate || new Date(inv.warrantyEndDate) <= new Date())
                                            ).length,
                                        },
                                        {
                                            name: 'Emekli',
                                            'Garantili': inventories.filter(inv => 
                                                inv.status === 4 && // Retired = 4
                                                inv.warrantyEndDate && 
                                                new Date(inv.warrantyEndDate) > new Date()
                                            ).length,
                                            'Garantisiz': inventories.filter(inv => 
                                                inv.status === 4 && // Retired = 4
                                                (!inv.warrantyEndDate || new Date(inv.warrantyEndDate) <= new Date())
                                            ).length,
                                        },
                                        {
                                            name: 'Kayıp',
                                            'Garantili': inventories.filter(inv => 
                                                inv.status === 5 && // Lost = 5
                                                inv.warrantyEndDate && 
                                                new Date(inv.warrantyEndDate) > new Date()
                                            ).length,
                                            'Garantisiz': inventories.filter(inv => 
                                                inv.status === 5 && // Lost = 5
                                                (!inv.warrantyEndDate || new Date(inv.warrantyEndDate) <= new Date())
                                            ).length,
                                        },
                                    ]}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip 
                                        formatter={(value, name) => [
                                            `${value} adet`, 
                                            name === 'Garantili' ? 'Garantisi Devam Eden' : 'Garantisi Bitmiş/Yok'
                                        ]} 
                                    />
                                    <Legend />
                                    <Bar dataKey="Garantili" stackId="a" fill={theme.palette.success.main} />
                                    <Bar dataKey="Garantisiz" stackId="a" fill={theme.palette.error.main} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                            Bu grafik, her durumdaki envanterlerin garanti durumunu gösterir. Yeşil alanlar garantisi devam eden, kırmızı alanlar garantisi bitmiş veya olmayan envanterleri temsil eder.
                        </Typography>
                    </Paper>
                </Grid>
                
                {/* Value Distribution by Category/Type */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Kategori Bazlı Değer Dağılımı</Typography>
                        <Box sx={{ height: 350, width: '100%' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={(() => {
                                            // Group by type and calculate total value
                                            const typeValueMap = inventories.reduce((acc, inv) => {
                                                if (!inv.purchasePrice) return acc;
                                                
                                                const type = inv.type || 'Diğer';
                                                if (!acc[type]) acc[type] = 0;
                                                acc[type] += parseFloat(inv.purchasePrice);
                                                return acc;
                                            }, {});
                                            
                                            // Convert to array and sort by value
                                            return Object.entries(typeValueMap)
                                                .map(([name, value]) => ({ 
                                                    name, 
                                                    value: parseFloat(value.toFixed(2)),
                                                    count: inventories.filter(inv => inv.type === name).length
                                                }))
                                                .sort((a, b) => b.value - a.value);
                                        })()}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => 
                                            `${name} (%${(percent * 100).toFixed(1)})`
                                        }
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value, name, props) => [
                                            `${value.toLocaleString('tr-TR')} ₺ (${props.payload.count} adet)`, 
                                            name
                                        ]} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                            Bu grafik, envanter tipine göre toplam değer dağılımını gösterir. Her dilim, o tipteki envanterlerin toplam değerini ve yüzdesini temsil eder.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

function InventoriesPage() {
    const theme = useTheme();
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
    const tableContainerRef = useRef(null);
    const [warrantyExpiringInventories, setWarrantyExpiringInventories] = useState([]);
    const [warrantyExpiredInventories, setWarrantyExpiredInventories] = useState([]);
    const [warrantyDialogOpen, setWarrantyDialogOpen] = useState(false);
    const [activeWarrantyTab, setActiveWarrantyTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeWarrantyInventories, setActiveWarrantyInventories] = useState([]);
    const [expiringInMonthInventories, setExpiringInMonthInventories] = useState([]);
    const [expiringInFifteenDaysInventories, setExpiringInFifteenDaysInventories] = useState([]);
    const [mostRepairedInventories, setMostRepairedInventories] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [inventoryToDeleteId, setInventoryToDeleteId] = useState(null);
    const [deleteComment, setDeleteComment] = useState('');

    useEffect(() => {
        fetchInventories();
        fetchWarrantyData();
    }, []);

    const fetchInventories = async () => {
        try {
            const response = await getInventories();
            
            // Log a sample inventory to debug status values
            if (response.data.length > 0) {
                console.log('Sample inventory:', response.data[0]);
                console.log('Status value:', response.data[0].status);
            }
            
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
        setInventoryToDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!inventoryToDeleteId) return;
        try {
            // Assuming deleteInventory service function is updated to accept { comments: "..." } as a second argument
            await deleteInventory(inventoryToDeleteId, { comments: deleteComment });
            setSuccessMessage('Grup liderinize silme onayı isteği gönderilmiştir. İsteğiniz onaylandığında envanter pasif duruma alınacaktır.');
            fetchInventories();
        } catch (err) {
            setError(err.response?.data?.message || 'Silme isteği gönderilirken bir hata oluştu.');
        } finally {
            setDeleteDialogOpen(false);
            setInventoryToDeleteId(null);
            setDeleteComment('');
        }
    };

    const filteredInventories = inventories.filter(inventory => {
        // Apply status filter first
        if (statusFilter !== 'all') {
            // Handle numeric status values (1-5) directly or named status filters
            if (statusFilter === 'Available' || statusFilter === 'Müsait') {
                return inventory.status === 1;
            } else if (statusFilter === 'InUse' || statusFilter === 'Kullanımda') {
                return inventory.status === 2;
            } else if (statusFilter === 'UnderMaintenance' || statusFilter === 'Bakımda') {
                return inventory.status === 3;
            } else if (statusFilter === 'Retired' || statusFilter === 'Emekli') {
                return inventory.status === 4;
            } else if (statusFilter === 'Lost' || statusFilter === 'Kayıp') {
                return inventory.status === 5;
            } else if (!isNaN(parseInt(statusFilter))) {
                // If statusFilter is a numeric string, compare directly
                return inventory.status === parseInt(statusFilter);
            }
            return false;
        }
        
        // Then apply search term filter
        if (!searchTerm.trim()) return true;
        
        const searchTermLower = searchTerm.toLowerCase();
        
        // Check for specific properties explicitly
        return (
            (inventory.barcode?.toLowerCase().includes(searchTermLower)) ||
            (inventory.serialNumber?.toLowerCase().includes(searchTermLower)) ||
            (inventory.familyName?.toLowerCase().includes(searchTermLower)) ||
            (inventory.typeName?.toLowerCase().includes(searchTermLower)) ||
            (inventory.brandName?.toLowerCase().includes(searchTermLower)) ||
            (inventory.modelName?.toLowerCase().includes(searchTermLower)) ||
            (inventory.location?.toLowerCase().includes(searchTermLower)) ||
            (inventory.room?.toLowerCase().includes(searchTermLower)) ||
            (inventory.floor?.toLowerCase().includes(searchTermLower)) ||
            (inventory.department?.toLowerCase().includes(searchTermLower)) ||
            // Include the mapped status in the search
            (STATUS_MAP[inventory.status]?.toLowerCase().includes(searchTermLower))
        );
    });

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
            link.setAttribute('download', 'envanter_sablonu.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Şablon indirilemedi: ' + err.message);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx')) {
            setError('Lütfen bir Excel dosyası (.xlsx) yükleyin');
            event.target.value = '';
            return;
        }

        try {
            const response = await importExcel(file);
            setSuccessMessage(response.data.message || 'Envanter başarıyla içe aktarıldı');
            fetchInventories();
            event.target.value = '';
        } catch (err) {
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                setError(
                    <div>
                        <p>Excel içe aktarma sırasında hatalar oluştu:</p>
                        <ul>
                            {err.response.data.errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                );
            } else {
                setError(err.response?.data?.message || 'Dosya içe aktarılamadı');
            }
            event.target.value = '';
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

    const handleCardClick = (status) => {
        setStatusFilter(status);
        // Smoothly scroll to the table container
        setTimeout(() => {
            tableContainerRef.current?.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'
            });
        }, 100);
    };

    // Updated status display for the filtered info message
    const getDisplayStatus = (statusKey) => {
        if (statusKey === 'all') return 'Tümü';
        
        // First try direct mapping (for filter keys like 'InUse' or numeric values)
        if (STATUS_MAP[statusKey]) {
            return STATUS_MAP[statusKey];
        }
        
        // If no mapping exists, return the key as is
        return statusKey;
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
                        Envanterler
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleDownloadTemplate}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                            }}
                        >
                            Şablon İndir
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
                            Excel İçe Aktar
                        </Button>
                        <Button
                            component={Link}
                            to="/inventories/upload-invoice"
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: theme.palette.warning.main,
                                color: theme.palette.warning.main,
                                '&:hover': {
                                    borderColor: theme.palette.warning.dark,
                                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                                }
                            }}
                        >
                            Fatura Yükle
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
                            Yeni Envanter Oluştur
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
                    inventories={inventories} 
                    warrantyData={{
                        active: activeWarrantyInventories,
                        expired: warrantyExpiredInventories,
                        expiringInMonth: expiringInMonthInventories,
                        expiringInFifteenDays: expiringInFifteenDaysInventories,
                        mostRepaired: mostRepairedInventories
                    }}
                    onCardClick={handleCardClick}
                />

                {statusFilter !== 'all' && (
                    <Alert 
                        severity="info" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        action={
                            <Button 
                                color="inherit" 
                                size="small"
                                onClick={() => setStatusFilter('all')}
                            >
                                Tümünü Göster
                            </Button>
                        }
                    >
                        {getDisplayStatus(statusFilter)} olan envanterler gösteriliyor
                    </Alert>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Envanterlerde ara..."
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
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    bgcolor: 'background.default',
                                }
                            }
                        }}
                    />
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
                            },
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Sütunlar
                    </Button>
                </Box>

                <TableContainer 
                    ref={tableContainerRef}
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
                                        }
                                        
                                        if (column.id === 'id') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    <Chip 
                                                        label={inventory.id} 
                                                        size="small" 
                                                        sx={{ 
                                                            fontWeight: 'medium',
                                                            bgcolor: 'primary.50',
                                                            color: 'primary.main'
                                                        }} 
                                                    />
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'status') {
                                            const statusDisplay = STATUS_MAP[inventory.status] || inventory.status;
                                            const statusColor = 
                                                inventory.status === 1 || statusDisplay === 'Müsait' ? 'success' :
                                                inventory.status === 2 || statusDisplay === 'Kullanımda' ? 'primary' :
                                                inventory.status === 3 || statusDisplay === 'Bakımda' ? 'warning' :
                                                inventory.status === 4 || statusDisplay === 'Emekli' ? 'error' :
                                                inventory.status === 5 || statusDisplay === 'Kayıp' ? 'error' :
                                                'default';
                                            
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    <Chip 
                                                        label={statusDisplay} 
                                                        size="small"
                                                        color={statusColor}
                                                        sx={{ 
                                                            fontWeight: 'medium',
                                                        }}
                                                    />
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'warrantyEndDate') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Typography variant="body2">
                                                            {formatDate(inventory.warrantyEndDate)}
                                                        </Typography>
                                                        {getWarrantyStatusChip(inventory.warrantyEndDate)}
                                                    </Box>
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'assignedUser') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.assignedUser ? 
                                                        `${inventory.assignedUser.name} ${inventory.assignedUser.surname}` : 
                                                        '-'}
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'createdUser') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.createdUser ? 
                                                        `${inventory.createdUser.name} ${inventory.createdUser.surname}` : 
                                                        '-'}
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'family') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.familyName || '-'}
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'type') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.typeName || '-'}
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'brand') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.brandName || '-'}
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'model') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.modelName || '-'}
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'purchasePrice') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {inventory.purchasePrice ? 
                                                        `${inventory.purchasePrice} ${
                                                            inventory.purchaseCurrency === 1 ? '₺' : 
                                                            inventory.purchaseCurrency === 2 ? '$' : 
                                                            inventory.purchaseCurrency === 3 ? '€' : ''
                                                        }` : 
                                                        '-'}
                                                </TableCell>
                                            );
                                        }
                                        
                                        if (column.id === 'warrantyStartDate' || column.id === 'createdDate' || column.id === 'updatedDate') {
                                            return (
                                                <TableCell key={column.id} sx={{ py: 2 }}>
                                                    {formatDate(inventory[column.id])}
                                                </TableCell>
                                            );
                                        }
                                        
                                        return (
                                            <TableCell key={column.id} sx={{ py: 2 }}>
                                                {inventory[column.id] || '-'}
                                            </TableCell>
                                        );
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

                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Envanteri Silme Onayı</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            Bu envanteri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve grup liderinizin onayını gerektirir. Lütfen silme talebiniz için bir açıklama girin.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="delete-comment"
                            label="Açıklama (İsteğe Bağlı)"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={deleteComment}
                            onChange={(e) => setDeleteComment(e.target.value)}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                        <Button onClick={confirmDelete} color="error">
                            Silme Talebi Gönder
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
}

export default InventoriesPage;
