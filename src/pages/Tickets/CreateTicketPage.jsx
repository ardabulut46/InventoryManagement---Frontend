import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    Autocomplete,
    Alert,
    Divider,
    IconButton,
    MenuItem,
    Card,
    CardContent,
    Container,
    useTheme,
} from '@mui/material';
import { createTicket } from '../../api/TicketService';
import { getProblemTypes } from '../../api/ProblemTypeService';
import { getInventories } from '../../api/InventoryService';
import { TICKET_PRIORITIES } from '../../utils/ticketConfig';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    Description as DescriptionIcon,
    Assignment as AssignmentIcon,
    AttachFile as AttachmentIcon,
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import { API_URL } from '../../config';

function CreateTicketPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { addNotification } = useNotifications();
    
    console.log('Notifications context:', { addNotification }); // Debug log

    const [formData, setFormData] = useState({
        problemTypeId: null,
        inventoryId: null,
        subject: '',
        description: '',
        status: 'Open',
        priority: 4,
        attachmentPath: ''
    });
    
    const [problemTypes, setProblemTypes] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [selectedProblemType, setSelectedProblemType] = useState(null);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchProblemTypes();
        fetchInventories();
    }, []);

    const fetchProblemTypes = async () => {
        try {
            const response = await getProblemTypes();
            setProblemTypes(response.data);
        } catch (err) {
            console.error('Error fetching problem types', err);
        }
    };

    const fetchInventories = async () => {
        try {
            const response = await getInventories();
            setInventories(response.data);
        } catch (err) {
            console.error('Error fetching inventories', err);
        }
    };

    const handleProblemTypeChange = (event, newValue) => {
        setSelectedProblemType(newValue);
        setFormData(prev => ({
            ...prev,
            problemTypeId: newValue?.id || null
        }));
        if (errors.problemTypeId) {
            setErrors(prev => ({ ...prev, problemTypeId: '' }));
        }
    };

    const handleInventoryChange = (event, newValue) => {
        setSelectedInventory(newValue);
        setFormData(prev => ({
            ...prev,
            inventoryId: newValue?.id || null
        }));
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
        if (!formData.problemTypeId) newErrors.problemTypeId = 'Problem tipi zorunludur';
        if (!formData.subject) newErrors.subject = 'Konu zorunludur';
        if (!formData.description) newErrors.description = 'Açıklama zorunludur';
        if (!formData.priority) newErrors.priority = 'Öncelik zorunludur';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        if (!validateForm()) return;

        try {
            const ticketData = {
                ...formData,
                priority: parseInt(formData.priority)
            };
            
            console.log('Sending ticket data:', ticketData);
            
            const response = await createTicket(ticketData);
            console.log('Create ticket response:', response);
            
            // Only call addNotification if it exists
            if (addNotification) {
                addNotification('Çağrı başarıyla oluşturuldu', 'success');
            }
            
            navigate('/tickets');
        } catch (err) {
            console.error('Error creating ticket', err);
            if (err.response) {
                console.error('Error response:', {
                    data: err.response.data,
                    status: err.response.status,
                    headers: err.response.headers
                });
            }
            setSubmitError(err.response?.data?.message || err.message || 'Çağrı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/Ticket/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        attachmentPath: data.filePath
                    }));
                    setSelectedFile(file);
                    setSubmitError('');
                } else {
                    setSubmitError('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
                }
            } catch (err) {
                console.error('Error uploading file:', err);
                setSubmitError('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            }
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFormData(prev => ({
            ...prev,
            attachmentPath: ''
        }));
    };

    // Priority options with values matching backend enum and Turkish labels
    const priorityOptions = [
        { value: 1, label: 'Kritik', color: '#DC2626' },
        { value: 2, label: 'Yüksek', color: '#EA580C' },
        { value: 3, label: 'Normal', color: '#0D9488' },
        { value: 4, label: 'Düşük', color: '#2563EB' }
    ];

    // Helper function to map priority to enum
    const mapPriorityToEnum = (priority) => {
        return parseInt(priority);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 24px rgba(0,0,0,0.2)' 
                        : '0 4px 24px rgba(0,0,0,0.05)',
                }}
            >
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
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
                        Yeni Çağrı Oluştur
                    </Typography>
                </Box>

                {submitError && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                color: 'error.main'
                            }
                        }}
                    >
                        {submitError}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
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
                                        <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Temel Bilgiler
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                options={problemTypes}
                                                getOptionLabel={(problemType) => {
                                                    if (!problemType) return '';
                                                    return `${problemType.name} (${problemType.department?.name || 'No Department'})`;
                                                }}
                                                value={selectedProblemType}
                                                onChange={handleProblemTypeChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Problem Tipi"
                                                        error={!!errors.problemTypeId}
                                                        helperText={errors.problemTypeId}
                                                        required
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                            }
                                                        }}
                                                    />
                                                )}
                                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                options={inventories}
                                                getOptionLabel={(inventory) => inventory ? `${inventory.brand} ${inventory.model}` : ''}
                                                value={selectedInventory}
                                                onChange={handleInventoryChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="İlgili Envanter"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                            }
                                                        }}
                                                    />
                                                )}
                                                renderOption={(props, inventory) => {
                                                    const { key, ...otherProps } = props;
                                                    return (
                                                        <li key={inventory.id} {...otherProps}>
                                                            <Box>
                                                                <Typography>{`${inventory.brand} ${inventory.model}`}</Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {`Seri No: ${inventory.serialNumber} • Barkod: ${inventory.barcode}`}
                                                                </Typography>
                                                            </Box>
                                                        </li>
                                                    );
                                                }}
                                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Öncelik"
                                                name="priority"
                                                value={formData.priority}
                                                onChange={handleChange}
                                                error={!!errors.priority}
                                                helperText={errors.priority}
                                                required
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            >
                                                {priorityOptions.map((priority) => (
                                                    <MenuItem 
                                                        key={priority.value} 
                                                        value={priority.value}
                                                        sx={{ color: priority.color }}
                                                    >
                                                        {priority.label}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Ticket Details */}
                        <Grid item xs={12}>
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
                                        <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Çağrı Detayları
                                        </Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Konu"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                error={!!errors.subject}
                                                helperText={errors.subject}
                                                required
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Açıklama"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                error={!!errors.description}
                                                helperText={errors.description}
                                                multiline
                                                rows={4}
                                                required
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* File Attachment Section */}
                        <Grid item xs={12}>
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
                                        <AttachmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Ek Dosya
                                        </Typography>
                                    </Box>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2,
                                        mb: selectedFile ? 2 : 0
                                    }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<UploadIcon />}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                borderWidth: '1.5px',
                                                '&:hover': {
                                                    borderWidth: '1.5px',
                                                }
                                            }}
                                        >
                                            Dosya Yükle
                                            <input
                                                type="file"
                                                hidden
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                            />
                                        </Button>
                                        {selectedFile && (
                                            <>
                                                <Typography>
                                                    {selectedFile.name}
                                                </Typography>
                                                <IconButton 
                                                    color="error" 
                                                    onClick={handleRemoveFile}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: theme.palette.mode === 'dark' 
                                                            ? 'rgba(255,255,255,0.05)' 
                                                            : 'rgba(0,0,0,0.03)',
                                                        '&:hover': {
                                                            bgcolor: theme.palette.mode === 'dark' 
                                                                ? 'rgba(255,255,255,0.1)' 
                                                                : 'rgba(0,0,0,0.05)',
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </>
                                        )}
                                    </Box>
                                    {selectedFile && (
                                        <Typography variant="caption" color="text.secondary">
                                            Dosya boyutu: {(selectedFile.size / 1024).toFixed(2)} KB
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Submit Buttons */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                                <Button 
                                    type="submit" 
                                    variant="contained"
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        px: 4,
                                        py: 1,
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                            transform: 'translateY(-1px)',
                                        }
                                    }}
                                >
                                    Çağrı Oluştur
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => navigate('/tickets')}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        px: 4,
                                        py: 1,
                                        borderWidth: '1.5px',
                                        '&:hover': {
                                            borderWidth: '1.5px',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }
                                    }}
                                >
                                    İptal
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}

export default CreateTicketPage;
