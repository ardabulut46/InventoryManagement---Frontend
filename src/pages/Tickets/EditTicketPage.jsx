import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketById, updateTicket } from '../../api/TicketService';
import { getProblemTypes } from '../../api/ProblemTypeService';
import { getInventories } from '../../api/InventoryService';
import {
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Grid,
    Alert,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    useTheme,
    Card,
    CardContent,
    Container,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationIcon,
    Description as DescriptionIcon,
    PriorityHigh as PriorityIcon,
} from '@mui/icons-material';
import { TICKET_PRIORITIES, getStatusTranslation } from '../../utils/ticketConfig';

const STATUS_OPTIONS = [
    'Open',
    'InProgress',
    'UnderReview',
    'ReadyForTesting',
    'Testing',
    'Resolved',
    'Closed',
    'Reopened',
    'Cancelled',
];

function EditTicketPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        registrationNumber: '',
        userId: 0,
        inventoryId: null,
        problemTypeId: null,
        location: '',
        room: '',
        subject: '',
        description: '',
        status: '',
        priority: 1,
        attachmentPath: '',
        departmentId: null,
    });
    const [problemTypes, setProblemTypes] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [selectedProblemType, setSelectedProblemType] = useState(null);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        fetchTicket();
        fetchProblemTypes();
        fetchInventories();
    }, []);

    useEffect(() => {
        if (success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 2500);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            setShowError(true);
            const timer = setTimeout(() => setShowError(false), 3500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fetchTicket = async () => {
        try {
            const res = await getTicketById(id);
            const t = res.data;
            setFormData({
                registrationNumber: t.registrationNumber || '',
                userId: t.userId || 0,
                inventoryId: t.inventoryId || null,
                problemTypeId: t.problemTypeId || null,
                location: t.location || '',
                room: t.room || '',
                subject: t.subject || '',
                description: t.description || '',
                status: t.status || '',
                priority: t.priority || 1,
                attachmentPath: t.attachmentPath || '',
                departmentId: t.departmentId || null,
            });
            setSelectedProblemType(t.problemTypeId ? { id: t.problemTypeId, name: t.problemTypeName } : null);
            setSelectedInventory(t.inventoryId ? { id: t.inventoryId, brandName: t.inventoryBrandName, modelName: t.inventoryModelName } : null);
            setError('');
        } catch (err) {
            setError('Çağrı detayları alınamadı.');
        }
    };

    const fetchProblemTypes = async () => {
        try {
            const response = await getProblemTypes();
            setProblemTypes(response.data);
        } catch (err) {
            setProblemTypes([]);
        }
    };

    const fetchInventories = async () => {
        try {
            const response = await getInventories();
            setInventories(response.data);
        } catch (err) {
            setInventories([]);
        }
    };

    const handleProblemTypeChange = (event, newValue) => {
        setSelectedProblemType(newValue);
        setFormData(prev => ({
            ...prev,
            problemTypeId: newValue?.id || null
        }));
    };

    const handleInventoryChange = (event, newValue) => {
        setSelectedInventory(newValue);
        setFormData(prev => ({
            ...prev,
            inventoryId: newValue?.id || null
        }));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirm(false);
        setLoading(true);
        try {
            const dto = {
                ...formData,
                userId: Number(formData.userId),
                inventoryId: formData.inventoryId ? Number(formData.inventoryId) : null,
                departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                priority: Number(formData.priority)
            };
            await updateTicket(id, dto);
            setSuccess('Çağrı başarıyla güncellendi!');
            setTimeout(() => navigate('/tickets'), 1500);
        } catch (err) {
            setError('Çağrı güncellenemedi. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Priority chips for selection
    const renderPriorityChips = () => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {Object.entries(TICKET_PRIORITIES).map(([value, { label, color }]) => (
                <Chip
                    key={value}
                    label={label}
                    clickable
                    color={formData.priority === Number(value) ? 'primary' : 'default'}
                    onClick={() => setFormData(prev => ({ ...prev, priority: Number(value) }))}
                    sx={{
                        bgcolor: formData.priority === Number(value) ? color : 'grey.100',
                        color: formData.priority === Number(value) ? 'white' : color,
                        fontWeight: 600,
                        borderRadius: 2,
                        border: formData.priority === Number(value) ? `2px solid ${color}` : '1px solid #e0e0e0',
                        transition: 'all 0.2s',
                        '&:hover': {
                            boxShadow: 2,
                            opacity: 0.9,
                        },
                    }}
                />
            ))}
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    onClick={() => navigate('/tickets')}
                    sx={{
                        mr: 2,
                        bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.03)',
                        '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.05)',
                        }
                    }}
                    aria-label="Geri Dön"
                >
                    <ArrowBackIcon />
                </IconButton>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    {`Çağrıyı Düzenle #${formData.registrationNumber}`}
                </Typography>
            </Box>
            {showError && error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2 }}
                    icon={false}
                >
                    <Typography sx={{ fontWeight: 500 }}>{error}</Typography>
                </Alert>
            )}
            {showSuccess && success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2, borderRadius: 2 }}
                    icon={false}
                >
                    <Typography sx={{ fontWeight: 500 }}>{success}</Typography>
                </Alert>
            )}
            <Box component="form" onSubmit={e => { e.preventDefault(); setShowConfirm(true); }}>
                <Grid container spacing={3}>
                    {/* Temel Bilgiler */}
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                boxShadow: 'none',
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.03)'
                                    : 'rgba(0,0,0,0.02)',
                                mb: 3
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Temel Bilgiler
                                    </Typography>
                                </Box>
                                <TextField
                                    label={<><span style={{ color: theme.palette.error.main }}>*</span> Konu</>}
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2, borderRadius: 2 }}
                                    inputProps={{ maxLength: 100 }}
                                    helperText="Kısa ve açıklayıcı bir konu giriniz."
                                />
                                <Autocomplete
                                    options={problemTypes}
                                    getOptionLabel={(problemType) => problemType ? `${problemType.name}${problemType.groupName ? ` (${problemType.groupName})` : ''}` : ''}
                                    value={problemTypes.find(pt => pt.id === formData.problemTypeId) || null}
                                    onChange={handleProblemTypeChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={<><span style={{ color: theme.palette.error.main }}>*</span> Problem Tipi</>}
                                            required
                                            sx={{ mb: 2, borderRadius: 2 }}
                                            helperText="Çağrının ait olduğu problem tipini seçiniz."
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                />
                                <Autocomplete
                                    options={inventories}
                                    getOptionLabel={(inventory) => inventory ? `${inventory.brandName} ${inventory.modelName}` : ''}
                                    value={inventories.find(inv => inv.id === formData.inventoryId) || null}
                                    onChange={handleInventoryChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="İlgili Envanter"
                                            sx={{ mb: 2, borderRadius: 2 }}
                                            helperText="Varsa çağrı ile ilgili envanteri seçiniz."
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                />
                                <TextField
                                    label={<><span style={{ color: theme.palette.error.main }}>*</span> Açıklama</>}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    fullWidth
                                    required
                                    sx={{ mb: 2, borderRadius: 2 }}
                                    inputProps={{ maxLength: 1000 }}
                                    helperText="Sorunun detaylarını açıklayınız."
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                    {/* Sağ Kolon */}
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                boxShadow: 'none',
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.03)'
                                    : 'rgba(0,0,0,0.02)',
                                mb: 3
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Konum Bilgileri
                                    </Typography>
                                </Box>
                                <TextField
                                    label="Konum"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ mb: 2, borderRadius: 2 }}
                                    helperText="Bina, kat veya alan bilgisi giriniz."
                                />
                                <TextField
                                    label="Oda"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={{ borderRadius: 2 }}
                                    helperText="Varsa oda numarası giriniz."
                                />
                            </CardContent>
                        </Card>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                boxShadow: 'none',
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.03)'
                                    : 'rgba(0,0,0,0.02)',
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <PriorityIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Durum & Öncelik
                                    </Typography>
                                </Box>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Durum</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        label="Durum"
                                        required
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {STATUS_OPTIONS.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {getStatusTranslation(status)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {/* Priority Chips */}
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                                    Öncelik Seçimi
                                </Typography>
                                {renderPriorityChips()}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/tickets')}
                        sx={{ borderRadius: 2, px: 4, py: 1, fontWeight: 600 }}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            py: 1,
                            fontWeight: 600,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            '&:hover': {
                                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                transform: 'translateY(-1px)',
                            }
                        }}
                        disabled={loading}
                    >
                        Değişiklikleri Kaydet
                    </Button>
                </Box>
            </Box>
            {/* Confirm Dialog */}
            <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
                <DialogTitle>Değişiklikleri Kaydet</DialogTitle>
                <DialogContent>
                    <Typography>Çağrı bilgilerini güncellemek istediğinize emin misiniz?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirm(false)} color="inherit">Vazgeç</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained" autoFocus disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}>
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default EditTicketPage;
