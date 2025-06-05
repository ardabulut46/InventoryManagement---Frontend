import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    Chip,
    useTheme,
    alpha,
    CircularProgress,
    ToggleButtonGroup,
    ToggleButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Collapse,
    Grid
} from '@mui/material';
import {
    CheckCircleOutline as ApproveIcon,
    CancelOutlined as RejectIcon,
    AccessTime as PendingIcon,
    Person as UserIcon,
    FilterList as FilterIcon,
    KeyboardArrowDown as ExpandMoreIcon,
    KeyboardArrowUp as ExpandLessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ApprovalService from '../api/ApprovalService';
import { getInventoryById } from '../api/InventoryService';
import InventoryRequestDetail from './InventoryRequestDetail';

const InventoryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectComment, setRejectComment] = useState('');
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const [approveComment, setApproveComment] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [viewMode, setViewMode] = useState('pending');
    const [expandedRow, setExpandedRow] = useState(null);
    const [inventoryDetails, setInventoryDetails] = useState({});
    const [inventoryLoading, setInventoryLoading] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        fetchRequests();
    }, [viewMode]);

    useEffect(() => {
        const fetchInventoryDetails = async (inventoryId) => {
            if (inventoryDetails[inventoryId]) return; // Already fetched

            setInventoryLoading(true);
            try {
                const response = await getInventoryById(inventoryId);
                console.log("Fetched inventory details response:", response); // Console log for debugging
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                console.log("Processed inventory data:", data); // Console log for debugging
                setInventoryDetails(prev => ({ ...prev, [inventoryId]: data }));
            } catch (err) {
                console.error("Failed to fetch inventory details", err);
                setInventoryDetails(prev => ({ ...prev, [inventoryId]: { error: 'Detaylar yüklenemedi.' } }));
            } finally {
                setInventoryLoading(false);
            }
        };

        if (expandedRow !== null) {
            const request = requests.find(r => r.id === expandedRow);
            console.log("Expanding row:", expandedRow, "Found request:", request); // Console log for debugging
            if (request && request.entityType === 'Inventory' && request.entityId) {
                console.log("Fetching details for inventory ID:", request.entityId); // Console log for debugging
                fetchInventoryDetails(request.entityId);
            }
        }
    }, [expandedRow, requests, inventoryDetails]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = viewMode === 'pending' 
                ? await ApprovalService.getPendingApprovals()
                : await ApprovalService.getAllRequests();
            setRequests(data);
            setError(null);
        } catch (err) {
            setError('İstekler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        setSelectedRequest(requests.find(req => req.id === requestId));
        setOpenApproveDialog(true);
    };

    const confirmApprove = async () => {
        if (!selectedRequest) return;

        try {
            await ApprovalService.approveRequest(selectedRequest.id, approveComment);
            setSnackbar({
                open: true,
                message: 'İstek başarıyla onaylandı.',
                severity: 'success'
            });
            fetchRequests();
        } catch (err) {
            setSnackbar({
                open: true,
                message: err.response?.data?.message || 'İstek onaylanırken bir hata oluştu.',
                severity: 'error'
            });
        } finally {
            setOpenApproveDialog(false);
            setApproveComment('');
            setSelectedRequest(null);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectComment.trim()) return;

        try {
            await ApprovalService.rejectRequest(selectedRequest.id, rejectComment);
            setSnackbar({
                open: true,
                message: 'İstek başarıyla reddedildi.',
                severity: 'success'
            });
            setOpenRejectDialog(false);
            setRejectComment('');
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'İstek reddedilirken bir hata oluştu.',
                severity: 'error'
            });
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 0:
                return (
                    <Chip
                        icon={<PendingIcon />}
                        label="Beklemede"
                        color="warning"
                        variant="filled"
                        size="small"
                    />
                );
            case 1:
                return (
                    <Chip
                        icon={<ApproveIcon />}
                        label="Onaylandı"
                        color="success"
                        variant="filled"
                        size="small"
                    />
                );
            case 2:
                return (
                    <Chip
                        icon={<RejectIcon />}
                        label="Reddedildi"
                        color="error"
                        variant="filled"
                        size="small"
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 200px)">
                <CircularProgress size={50} />
                <Typography variant="h6" sx={{ ml: 2 }}>Yükleniyor...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    mb: 4, 
                    fontWeight: 700, 
                    color: theme.palette.primary.main,
                    borderBottom: `2px solid ${theme.palette.primary.light}`,
                    pb: 1
                }}
            >
                Envanter Silme İstekleri
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(e, newValue) => newValue && setViewMode(newValue)}
                    aria-label="request view mode"
                    size="small"
                >
                    <ToggleButton value="pending" aria-label="show pending requests">
                        <PendingIcon sx={{ mr: 1 }} />
                        Bekleyen İstekler
                    </ToggleButton>
                    <ToggleButton value="all" aria-label="show all requests">
                        <FilterIcon sx={{ mr: 1 }} />
                        Tüm İstekler
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error} <Button onClick={fetchRequests} size="small">Tekrar Yükle</Button>
                </Alert>
            )}

            {requests.length === 0 && !loading && !error ? (
                <Paper
                    sx={{
                        p: { xs: 3, md: 5 },
                        textAlign: 'center',
                        bgcolor: theme.palette.background.default,
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`
                    }}
                >
                    <Typography variant="h6" color="text.secondary">
                        {viewMode === 'pending' ? 'Bekleyen istek bulunmamaktadır.' : 'Hiç istek bulunmamaktadır.'}
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[3] }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" />
                                <TableCell>Durum</TableCell>
                                <TableCell>İsteyen Kullanıcı</TableCell>
                                <TableCell>Departman</TableCell>
                                <TableCell>İstek Tarihi</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((request) => (
                                <React.Fragment key={request.id}>
                                    <TableRow 
                                        hover
                                        sx={{ 
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <IconButton
                                                size="small"
                                                onClick={() => setExpandedRow(expandedRow === request.id ? null : request.id)}
                                            >
                                                {expandedRow === request.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{getStatusChip(request.status)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <UserIcon fontSize="small" color="action" />
                                                {request.requestingUser.name} {request.requestingUser.surname}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{request.requestingUser.location || '-'}</TableCell>
                                        <TableCell>
                                            {format(new Date(request.requestedDate), 'dd MMM yyyy, HH:mm', { locale: tr })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {request.status === 0 && (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Tooltip title="Onayla">
                                                        <IconButton
                                                            color="success"
                                                            onClick={() => handleApprove(request.id)}
                                                            size="small"
                                                        >
                                                            <ApproveIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reddet">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setOpenRejectDialog(true);
                                                            }}
                                                            size="small"
                                                        >
                                                            <RejectIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                            <Collapse in={expandedRow === request.id} timeout="auto" unmountOnExit>
                                                <InventoryRequestDetail 
                                                    request={request}
                                                    inventoryDetails={inventoryDetails}
                                                    inventoryLoading={inventoryLoading}
                                                    theme={theme}
                                                />
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={openRejectDialog}
                onClose={() => {
                    setOpenRejectDialog(false);
                    setRejectComment('');
                    setSelectedRequest(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: theme.shadows[5]
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1.5, fontWeight: 600 }}>
                    Reddetme Nedenini Belirtin
                </DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <Typography variant="body2" sx={{ mb: 2}}>
                        Lütfen {selectedRequest?.requestingUser.name} {selectedRequest?.requestingUser.surname} adlı kullanıcının isteğini neden reddettiğinizi açıklayın.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="reject-comment"
                        label="Reddetme Açıklaması"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        variant="outlined"
                        helperText={!rejectComment.trim() ? "Açıklama boş bırakılamaz." : ""}
                        error={!rejectComment.trim()}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, pt: 1.5 }}>
                    <Button 
                        onClick={() => {
                            setOpenRejectDialog(false);
                            setRejectComment('');
                            setSelectedRequest(null);
                        }}
                        sx={{ borderRadius: 2, color: theme.palette.text.secondary }}
                    >
                        İptal
                    </Button>
                    <Button 
                        onClick={handleReject}
                        variant="contained" 
                        color="error"
                        disabled={!rejectComment.trim()}
                        sx={{ borderRadius: 2 }}
                    >
                        Gönder ve Reddet
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openApproveDialog}
                onClose={() => {
                    setOpenApproveDialog(false);
                    setApproveComment('');
                    setSelectedRequest(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: theme.shadows[5]
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1.5, fontWeight: 600 }}>
                    Onay Açıklaması (İsteğe Bağlı)
                </DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}>
                    <Typography variant="body2" sx={{ mb: 2}}>
                        İsteği onaylarken bir açıklama ekleyebilirsiniz.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="approve-comment"
                        label="Onay Açıklaması"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={approveComment}
                        onChange={(e) => setApproveComment(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, pt: 1.5 }}>
                    <Button 
                        onClick={() => {
                            setOpenApproveDialog(false);
                            setApproveComment('');
                            setSelectedRequest(null);
                        }}
                        sx={{ borderRadius: 2, color: theme.palette.text.secondary }}
                    >
                        İptal
                    </Button>
                    <Button 
                        onClick={confirmApprove} 
                        variant="contained" 
                        color="success"
                        sx={{ borderRadius: 2 }}
                    >
                        Onayla
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', boxShadow: theme.shadows[6] }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InventoryRequests; 