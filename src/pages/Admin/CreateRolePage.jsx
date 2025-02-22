import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    Divider,
    Grid,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    useTheme,
    Alert,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock permissions for demonstration
const availablePermissions = {
    'Kullanıcı Yönetimi': [
        'Kullanıcı Oluşturma',
        'Kullanıcı Düzenleme',
        'Kullanıcı Silme',
        'Kullanıcı Görüntüleme'
    ],
    'Çağrı Yönetimi': [
        'Çağrı Oluşturma',
        'Çağrı Düzenleme',
        'Çağrı Silme',
        'Çağrı Atama',
        'Çağrı Çözümleme'
    ],
    'Envanter Yönetimi': [
        'Envanter Oluşturma',
        'Envanter Düzenleme',
        'Envanter Silme',
        'Envanter Görüntüleme',
        'Envanter Atama'
    ],
    'Sistem Yönetimi': [
        'Rol Yönetimi',
        'Departman Yönetimi',
        'Şirket Yönetimi',
        'Sistem Ayarları'
    ]
};

const CreateRolePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#1976d2',
        permissions: {}
    });
    const [error, setError] = useState('');

    // Initialize permissions structure
    React.useEffect(() => {
        const initialPermissions = {};
        Object.keys(availablePermissions).forEach(category => {
            initialPermissions[category] = {};
            availablePermissions[category].forEach(permission => {
                initialPermissions[category][permission] = false;
            });
        });
        setFormData(prev => ({ ...prev, permissions: initialPermissions }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (category, permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [category]: {
                    ...prev.permissions[category],
                    [permission]: !prev.permissions[category][permission]
                }
            }
        }));
    };

    const handleCategorySelectAll = (category, value) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [category]: Object.keys(prev.permissions[category] || {}).reduce((acc, permission) => {
                    acc[permission] = value;
                    return acc;
                }, {})
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name.trim()) {
            setError('Rol adı zorunludur');
            return;
        }

        // Here you would typically make an API call to create the role
        console.log('Creating role:', formData);
        
        // Navigate back to roles page after successful creation
        navigate('/admin/roles');
    };

    const isCategorySelected = (category) => {
        return formData.permissions[category] && Object.values(formData.permissions[category]).some(value => value);
    };

    const isAllCategorySelected = (category) => {
        return formData.permissions[category] && Object.values(formData.permissions[category]).every(value => value);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin/roles')}
                    sx={{ mb: 3 }}
                >
                    Rollere Dön
                </Button>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 3
                    }}
                >
                    Yeni Rol Oluştur
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Basic Information */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Temel Bilgiler
                            </Typography>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Rol Adı"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Açıklama"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                />
                                <TextField
                                    fullWidth
                                    label="Renk"
                                    name="color"
                                    type="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    sx={{
                                        '& input': {
                                            height: '50px',
                                            padding: '0 10px'
                                        }
                                    }}
                                />
                            </Stack>
                        </Grid>

                        {/* Permissions */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                Yetkiler
                            </Typography>
                            <Stack spacing={3}>
                                {Object.entries(availablePermissions).map(([category, permissions]) => (
                                    <Box key={category}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <FormLabel component="legend" sx={{ flex: 1 }}>
                                                {category}
                                            </FormLabel>
                                            <Button
                                                size="small"
                                                startIcon={isAllCategorySelected(category) ? <RemoveIcon /> : <AddIcon />}
                                                onClick={() => handleCategorySelectAll(category, !isAllCategorySelected(category))}
                                            >
                                                {isAllCategorySelected(category) ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                                            </Button>
                                        </Box>
                                        <FormGroup>
                                            <Grid container spacing={2}>
                                                {permissions.map((permission) => (
                                                    <Grid item xs={12} sm={6} key={permission}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={formData.permissions[category]?.[permission] || false}
                                                                    onChange={() => handlePermissionChange(category, permission)}
                                                                />
                                                            }
                                                            label={permission}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </FormGroup>
                                        {category !== Object.keys(availablePermissions).slice(-1)[0] && (
                                            <Divider sx={{ mt: 2 }} />
                                        )}
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/roles')}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            startIcon={<SaveIcon />}
                            sx={{
                                background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                }
                            }}
                        >
                            Rolü Oluştur
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateRolePage; 