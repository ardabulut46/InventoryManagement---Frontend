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
import { useNavigate } from 'react-router-dom';
import { getWarrantyExpiringInventories, getWarrantyExpiredInventories } from '../../api/WarrantyService';

const WarrantyStatusPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [expiringInventories, setExpiringInventories] = useState([]);
    const [expiredInventories, setExpiredInventories] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [expiringRes, expiredRes] = await Promise.all([
                getWarrantyExpiringInventories(),
                getWarrantyExpiredInventories()
            ]);
            setExpiringInventories(expiringRes.data);
            setExpiredInventories(expiredRes.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch warranty data');
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
                        <Tab 
                            label={`Yaklaşan Garantiler (${expiringInventories.length})`} 
                            id="tab-0"
                        />
                        <Tab 
                            label={`Süresi Dolan Garantiler (${expiredInventories.length})`} 
                            id="tab-1"
                        />
                    </Tabs>
                </Box>

                <Box role="tabpanel" hidden={activeTab !== 0}>
                    {activeTab === 0 && renderInventoryTable(expiringInventories)}
                </Box>

                <Box role="tabpanel" hidden={activeTab !== 1}>
                    {activeTab === 1 && renderInventoryTable(expiredInventories)}
                </Box>
            </Paper>
        </Container>
    );
};

export default WarrantyStatusPage; 