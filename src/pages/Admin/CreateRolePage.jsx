import React, { useState, useEffect } from 'react';
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
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import httpClient from '../../api/httpClient';

// Define permissions based on backend constants
const availablePermissions = {
    'Inventory': [
        'Inventory:View',
        'Inventory:Create',
        'Inventory:Edit',
        'Inventory:Delete'
    ],
    'Users': [
        'Users:View',
        'Users:Create',
        'Users:Edit',
        'Users:Delete'
    ],
    'Tickets': [
        'Tickets:View',
        'Tickets:Create',
        'Tickets:Edit',
        'Tickets:Delete',
        'Tickets:Assign'
    ]
};

// Helper function to get permission display name
const getPermissionDisplayName = (permission) => {
    const [resource, action] = permission.split(':');
    
    let actionText = action;
    // Translate action to Turkish
    if (action === 'View') actionText = 'Görüntüleme';
    else if (action === 'Create') actionText = 'Oluşturma';
    else if (action === 'Edit') actionText = 'Düzenleme';
    else if (action === 'Delete') actionText = 'Silme';
    else if (action === 'Assign') actionText = 'Atama';
    
    return actionText;
};

// Helper function to get category display name
const getCategoryDisplayName = (category) => {
    if (category === 'Inventory') return 'Envanter';
    if (category === 'Users') return 'Kullanıcılar';
    if (category === 'Tickets') return 'Çağrılar';
    return category;
};

const CreateRolePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize permissions structure
    useEffect(() => {
        const initialPermissions = {};
        Object.keys(availablePermissions).forEach(category => {
            initialPermissions[category] = {};
            availablePermissions[category].forEach(permission => {
                initialPermissions[category][permission] = false;
            });
        });
        setSelectedPermissions(initialPermissions);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (category, permission) => {
        setSelectedPermissions(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [permission]: !prev[category][permission]
            }
        }));
    };

    const handleCategorySelectAll = (category, value) => {
        setSelectedPermissions(prev => ({
            ...prev,
            [category]: Object.keys(prev[category] || {}).reduce((acc, permission) => {
                acc[permission] = value;
                return acc;
            }, {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.name.trim()) {
            setError('Rol adı zorunludur');
            return;
        }

        // Collect selected permissions
        const selectedPermissionsList = [];
        Object.entries(selectedPermissions).forEach(([category, permissions]) => {
            Object.entries(permissions).forEach(([permission, isSelected]) => {
                if (isSelected) {
                    selectedPermissionsList.push(permission);
                }
            });
        });

        // Prepare data for API
        const roleData = {
            name: formData.name,
            description: formData.description,
            permissions: selectedPermissionsList
        };

        try {
            setLoading(true);
            await httpClient.post('/api/Roles', roleData);
            navigate('/admin/roles');
        } catch (err) {
            console.error('Error creating role:', err);
            setError('Rol oluşturulurken bir hata oluştu.');
            setLoading(false);
        }
    };

    const isCategorySelected = (category) => {
        return selectedPermissions[category] && Object.values(selectedPermissions[category]).some(value => value);
    };

    const isAllCategorySelected = (category) => {
        return selectedPermissions[category] && Object.values(selectedPermissions[category]).every(value => value);
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
                                    placeholder="Örn: Çağrı Yöneticisi"
                                />
                                <TextField
                                    fullWidth
                                    label="Açıklama"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    placeholder="Rolün görev ve yetkilerini açıklayın"
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
                                            <FormLabel component="legend" sx={{ flex: 1, fontWeight: 'bold' }}>
                                                {getCategoryDisplayName(category)}
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
                                                                    checked={selectedPermissions[category]?.[permission] || false}
                                                                    onChange={() => handlePermissionChange(category, permission)}
                                                                />
                                                            }
                                                            label={getPermissionDisplayName(permission)}
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
                            disabled={loading}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                }
                            }}
                        >
                            {loading ? 'Oluşturuluyor...' : 'Rolü Oluştur'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateRolePage; 