import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
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
    Divider,
    Grid,
    Paper,
    useTheme,
    alpha,
    CircularProgress
} from '@mui/material';
import {
    CheckCircleOutline as ApproveIcon,
    CancelOutlined as RejectIcon,
    AccessTime as PendingIcon,
    Person as UserIcon,
    CalendarToday as DateIcon,
    Description as CommentIcon,
    Business as DepartmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ApprovalService from '../api/ApprovalService';

const InventoryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectComment, setRejectComment] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const theme = useTheme();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await ApprovalService.getPendingApprovals();
            setRequests(data);
            setLoading(false);
        } catch (err) {
            setError('İstekler yüklenirken bir hata oluştu.');
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await ApprovalService.approveRequest(requestId);
            setSnackbar({
                open: true,
                message: 'İstek başarıyla onaylandı.',
                severity: 'success'
            });
            fetchRequests();
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'İstek onaylanırken bir hata oluştu.',
                severity: 'error'
            });
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
                        variant="outlined"
                    />
                );
            case 1:
                return (
                    <Chip
                        icon={<ApproveIcon />}
                        label="Onaylandı"
                        color="success"
                        variant="outlined"
                    />
                );
            case 2:
                return (
                    <Chip
                        icon={<RejectIcon />}
                        label="Reddedildi"
                        color="error"
                        variant="outlined"
                    />
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Envanter Silme İstekleri
            </Typography>

            {requests.length === 0 ? (
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: theme.palette.background.paper,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" color="text.secondary">
                        Bekleyen istek bulunmamaktadır.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {requests.map((request) => (
                        <Grid item xs={12} key={request.id}>
                            <Card
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: theme.shadows[2],
                                    '&:hover': {
                                        boxShadow: theme.shadows[4],
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={8}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <UserIcon color="primary" />
                                                <Typography variant="h6">
                                                    {request.requestingUser.name} {request.requestingUser.surname}
                                                </Typography>
                                                {getStatusChip(request.status)}
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <DateIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    İstek Tarihi: {format(new Date(request.requestedDate), 'dd MMMM yyyy HH:mm', { locale: tr })}
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CommentIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                    Departman: {request.requestingUser.location}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                gap: 2, 
                                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                                mt: { xs: 2, md: 0 }
                                            }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<ApproveIcon />}
                                                    onClick={() => handleApprove(request.id)}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Onayla
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    startIcon={<RejectIcon />}
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setOpenRejectDialog(true);
                                                    }}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Reddet
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog
                open={openRejectDialog}
                onClose={() => setOpenRejectDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: theme.shadows[5]
                    }
                }}
            >
                <DialogTitle>Reddetme Nedeni</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reddetme açıklaması"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setOpenRejectDialog(false)}
                        sx={{ borderRadius: 2 }}
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
                        Reddet
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InventoryRequests; 