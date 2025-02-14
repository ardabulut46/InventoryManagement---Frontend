import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Tabs,
    Tab,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    getWarrantyExpiringInMonth, 
    getWarrantyExpiredInventories,
    getActiveWarrantyInventories,
    getWarrantyExpiringInFifteenDays,
    getMostRepairedInventories 
} from '../../api/WarrantyService';

const WarrantyStatusPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);
    const [inventories, setInventories] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Set initial tab based on navigation state
        if (location.state?.activeTab) {
            const tabMap = {
                'active': 0,
                'expired': 1,
                'expiringMonth': 2,
                'expiringFifteen': 3,
                'mostRepaired': 4
            };
            setActiveTab(tabMap[location.state.activeTab] || 0);
        }
    }, [location]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            let response;
            switch (activeTab) {
                case 0: // Active
                    response = await getActiveWarrantyInventories();
                    break;
                case 1: // Expired
                    response = await getWarrantyExpiredInventories();
                    break;
                case 2: // Expiring in Month
                    response = await getWarrantyExpiringInMonth();
                    break;
                case 3: // Expiring in 15 Days
                    response = await getWarrantyExpiringInFifteenDays();
                    break;
                case 4: // Most Repaired
                    response = await getMostRepairedInventories();
                    break;
                default:
                    response = { data: [] };
            }
            setInventories(response.data || []);
            setError('');
        } catch (err) {
            console.error('Failed to fetch warranty data:', err);
            setError('Failed to fetch warranty data');
            setInventories([]);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
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

    const getTabLabel = (index) => {
        switch (index) {
            case 0:
                return `Aktif Garantiler (${inventories.length})`;
            case 1:
                return `Süresi Dolan Garantiler (${inventories.length})`;
            case 2:
                return `1 Ay İçinde Dolacak (${inventories.length})`;
            case 3:
                return `15 Gün İçinde Dolacak (${inventories.length})`;
            case 4:
                return `En Çok Tamir Görenler (${inventories.length})`;
            default:
                return '';
        }
    };

    const renderInventoryTable = (inventories) => (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Barkod</TableCell>
                        <TableCell>Model</TableCell>
                        <TableCell>Seri No</TableCell>
                        <TableCell>Garanti Başlangıç</TableCell>
                        <TableCell>Garanti Bitiş</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell>İşlemler</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {inventories.map((inventory) => (
                        <TableRow key={inventory.id}>
                            <TableCell>{inventory.id}</TableCell>
                            <TableCell>{inventory.barcode}</TableCell>
                            <TableCell>{inventory.model}</TableCell>
                            <TableCell>{inventory.serialNumber}</TableCell>
                            <TableCell>{formatDate(inventory.warrantyStartDate)}</TableCell>
                            <TableCell>{formatDate(inventory.warrantyEndDate)}</TableCell>
                            <TableCell>
                                {getWarrantyStatusChip(inventory.warrantyEndDate)}
                            </TableCell>
                            <TableCell>
                                <Tooltip title="Düzenle">
                                    <IconButton
                                        size="small"
                                        onClick={() => navigate(`/inventories/edit/${inventory.id}`)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {inventories.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                Kayıt bulunamadı.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Garanti Durumu
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label={getTabLabel(0)} id="tab-0" />
                        <Tab label={getTabLabel(1)} id="tab-1" />
                        <Tab label={getTabLabel(2)} id="tab-2" />
                        <Tab label={getTabLabel(3)} id="tab-3" />
                        <Tab label={getTabLabel(4)} id="tab-4" />
                    </Tabs>
                </Box>

                <Box role="tabpanel" hidden={activeTab !== 0}>
                    {activeTab === 0 && renderInventoryTable(inventories)}
                </Box>

                <Box role="tabpanel" hidden={activeTab !== 1}>
                    {activeTab === 1 && renderInventoryTable(inventories)}
                </Box>

                <Box role="tabpanel" hidden={activeTab !== 2}>
                    {activeTab === 2 && renderInventoryTable(inventories)}
                </Box>

                <Box role="tabpanel" hidden={activeTab !== 3}>
                    {activeTab === 3 && renderInventoryTable(inventories)}
                </Box>

                <Box role="tabpanel" hidden={activeTab !== 4}>
                    {activeTab === 4 && renderInventoryTable(inventories)}
                </Box>
            </Paper>
        </Container>
    );
};

export default WarrantyStatusPage; 