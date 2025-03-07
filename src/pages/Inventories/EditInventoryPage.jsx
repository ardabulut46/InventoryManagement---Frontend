import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getInventoryById,
    updateInventory,
    assignUser,
    getInventoryHistory,
    getAssignmentHistory,
    uploadInvoice
} from '../../api/InventoryService';
import { getUsers } from '../../api/UserService';
import { getCompanies } from '../../api/CompanyService';
import {
    Typography,
    TextField,
    Button,
    Box,
    Autocomplete,
    Grid,
    MenuItem,
    Paper,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const STATUS_OPTIONS = [
    'Müsait',
    'Kullanımda',
    'Bakımda',
    'Emekli',
    'Kayıp',
];

function EditInventoryPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState({
        barcode: '',
        serialNumber: '',
        family: '',
        type: '',
        brand: '',
        model: '',
        location: '',
        status: 'Müsait',
        room: '',
        floor: '',
        block: '',
        department: '',
        warrantyStartDate: '',
        warrantyEndDate: '',
        supplier: '',
        assignedUserId: null,
        supportCompanyId: null,
        invoiceAttachmentPath: '',
    });

    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [inventoryHistory, setInventoryHistory] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [assignmentNotes, setAssignmentNotes] = useState('');
    const [invoiceFile, setInvoiceFile] = useState(null);

    useEffect(() => {
        loadInventory();
        loadUsers();
        loadCompanies();
        loadInventoryHistory();
    }, [id]);

    const loadInventory = async () => {
        try {
            const response = await getInventoryById(id);
            const inventory = response.data;
            setFormData({
                ...inventory,
                warrantyStartDate: inventory.warrantyStartDate ? new Date(inventory.warrantyStartDate).toISOString().split('T')[0] : '',
                warrantyEndDate: inventory.warrantyEndDate ? new Date(inventory.warrantyEndDate).toISOString().split('T')[0] : '',
            });
            if (inventory.assignedUser) {
                setCurrentUser(inventory.assignedUser);
                setSelectedUser(inventory.assignedUser);
            }
            if (inventory.supportCompany) {
                setSelectedCompany(inventory.supportCompany);
            }
        } catch (err) {
            console.error('Error loading inventory', err);
            setSubmitError('Envanter detayları yüklenirken hata oluştu');
        }
    };

    const loadUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users', err);
        }
    };

    const loadCompanies = async () => {
        try {
            const response = await getCompanies();
            setCompanies(response.data);
        } catch (err) {
            console.error('Error fetching companies', err);
        }
    };

    const loadInventoryHistory = async () => {
        try {
            const response = await getAssignmentHistory(id);
            setInventoryHistory(response.data);
        } catch (err) {
            console.error('Error loading inventory history', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.barcode) newErrors.barcode = 'Barkod alanı zorunludur';
        if (!formData.serialNumber) newErrors.serialNumber = 'Seri numarası zorunludur';
        if (!formData.family) newErrors.family = 'Aile bilgisi zorunludur';
        if (!formData.type) newErrors.type = 'Tip bilgisi zorunludur';
        if (!formData.brand) newErrors.brand = 'Marka bilgisi zorunludur';
        if (!formData.model) newErrors.model = 'Model bilgisi zorunludur';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setInvoiceFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        if (!validateForm()) return;

        try {
            let invoicePath = formData.invoiceAttachmentPath;
            if (invoiceFile) {
                const uploadResponse = await uploadInvoice(invoiceFile);
                invoicePath = uploadResponse.data.filePath;
            }

            const dto = {
                ...formData,
                warrantyStartDate: formData.warrantyStartDate ? new Date(formData.warrantyStartDate).toISOString() : null,
                warrantyEndDate: formData.warrantyEndDate ? new Date(formData.warrantyEndDate).toISOString() : null,
                assignedUserId: selectedUser?.id || null,
                supportCompanyId: selectedCompany?.id || null,
                invoiceAttachmentPath: invoicePath
            };

            await updateInventory(id, dto);
            if (selectedUser?.id !== currentUser?.id) {
                setAssignDialogOpen(true);
            } else {
                navigate('/inventories');
            }
        } catch (err) {
            console.error('Error updating inventory', err);
            setSubmitError('Envanter güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleAssignUser = async () => {
        try {
            if (selectedUser?.id) {
                await assignUser(id, selectedUser.id, assignmentNotes);
                setAssignDialogOpen(false);
                navigate('/inventories');
            }
        } catch (err) {
            console.error('Error assigning user', err);
            setSubmitError('Kullanıcı atama işlemi başarısız oldu.');
        }
    };

    return (
        <Box component={Paper} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Envanter Düzenle
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                </Alert>
            )}

            {/* Current Assignment Info */}
            {currentUser && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Mevcut Atama
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography>
                            Şu anda atanan kullanıcı: <strong>{currentUser.email}</strong>
                        </Typography>
                    </Paper>
                </Box>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '100%' }}>
                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Temel Bilgiler</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Barkod"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.barcode}
                                    helperText={errors.barcode}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Seri Numarası"
                                    name="serialNumber"
                                    value={formData.serialNumber}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.serialNumber}
                                    helperText={errors.serialNumber}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Durum"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    {STATUS_OPTIONS.map(option => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Ürün Detayları</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Aile"
                                    name="family"
                                    value={formData.family}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.family}
                                    helperText={errors.family}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Tip"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.type}
                                    helperText={errors.type}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Marka"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.brand}
                                    helperText={errors.brand}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    error={!!errors.model}
                                    helperText={errors.model}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Location Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Konum Bilgileri</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Konum"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Departman"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Oda"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Kat"
                                    name="floor"
                                    value={formData.floor}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Blok"
                                    name="block"
                                    value={formData.block}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Warranty Information */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Garanti Bilgileri</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Garanti Başlangıç Tarihi"
                                    name="warrantyStartDate"
                                    value={formData.warrantyStartDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Garanti Bitiş Tarihi"
                                    name="warrantyEndDate"
                                    value={formData.warrantyEndDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Tedarikçi"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {formData.invoiceAttachmentPath && (
                                        <Typography variant="body2" color="text.secondary">
                                            Mevcut fatura: {formData.invoiceAttachmentPath}
                                        </Typography>
                                    )}
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUploadIcon />}
                                        sx={{ mt: 1, width: 'fit-content' }}
                                    >
                                        {formData.invoiceAttachmentPath ? 'Faturayı Değiştir' : 'Fatura Yükle'}
                                        <input
                                            type="file"
                                            hidden
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                    {invoiceFile && (
                                        <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                                            Seçilen dosya: {invoiceFile.name}
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Assignment */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Atama</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={users}
                                    getOptionLabel={(user) => user.email || ''}
                                    value={selectedUser}
                                    onChange={(event, newValue) => setSelectedUser(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Atanan Kullanıcı"
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={companies}
                                    getOptionLabel={(company) => company.name || ''}
                                    value={selectedCompany}
                                    onChange={(event, newValue) => setSelectedCompany(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Destek Şirketi"
                                            variant="outlined"
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                            <Button 
                                type="submit" 
                                variant="contained"
                                color="primary"
                            >
                                Envanteri Güncelle
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => navigate('/inventories')}
                            >
                                İptal
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* User Assignment Dialog */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>Kullanıcı Ataması</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Bu öğeyi şu kullanıcıya atamak üzeresiniz: <strong>{selectedUser?.email}</strong>
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Atama Notları"
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleAssignUser} color="primary" variant="contained">
                        Atamayı Onayla
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditInventoryPage;
