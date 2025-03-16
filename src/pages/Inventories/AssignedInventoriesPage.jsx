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
    useTheme
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAssignedInventories } from '../../api/InventoryService';
import { format } from 'date-fns';

const AssignedInventoriesPage = () => {
    const [inventories, setInventories] = useState([]);
    const [filteredInventories, setFilteredInventories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        fetchAssignedInventories();
    }, []);

    useEffect(() => {
        if (inventories.length > 0) {
            filterInventories();
        }
    }, [searchTerm, inventories]);

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
        if (!searchTerm.trim()) {
            setFilteredInventories(inventories);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = inventories.filter(inventory => 
            (inventory.barcode && inventory.barcode.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (inventory.serialNumber && inventory.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (inventory.familyName && inventory.familyName.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (inventory.typeName && inventory.typeName.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (inventory.brandName && inventory.brandName.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (inventory.modelName && inventory.modelName.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (inventory.location && inventory.location.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (inventory.status && inventory.status.toLowerCase().includes(lowerCaseSearchTerm))
        );
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
        switch (status?.toLowerCase()) {
            case 'kullanılabilir':
                return 'success';
            case 'arızalı':
                return 'error';
            case 'bakımda':
                return 'warning';
            case 'kayıp':
                return 'error';
            case 'hurdaya ayrılmış':
                return 'default';
            default:
                return 'info';
        }
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
                                label={inventory.status} 
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
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Üzerimdeki Envanterler
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Size atanmış tüm envanterlerin listesi
                </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
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
                    sx={{ maxWidth: 600 }}
                />
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
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Barkod / Seri No</TableCell>
                                        <TableCell>Aile / Tip</TableCell>
                                        <TableCell>Marka / Model</TableCell>
                                        <TableCell>Konum</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell>Garanti Bitiş</TableCell>
                                        <TableCell align="right">İşlemler</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredInventories.map((inventory) => (
                                        <TableRow key={inventory.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {inventory.barcode || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {inventory.serialNumber || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {inventory.familyName || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {inventory.typeName || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {inventory.brandName || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {inventory.modelName || 'N/A'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={`Oda: ${inventory.room || 'N/A'}, Kat: ${inventory.floor || 'N/A'}, Departman: ${inventory.department || 'N/A'}`}>
                                                    <Typography variant="body2">
                                                        {inventory.location || 'N/A'}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={inventory.status} 
                                                    color={getStatusColor(inventory.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(inventory.warrantyEndDate)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleViewDetails(inventory.id)}
                                                    sx={{ 
                                                        borderRadius: 2,
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Detaylar
                                                </Button>
                                            </TableCell>
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