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
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import httpClient from '../../api/httpClient';

// Define permissions based on backend constants
const availablePermissions = {
    'AdminPanel': [
        'AdminPanel:View'
    ],
    'Inventory': [
        'Inventory:View',
        'Inventory:Create',
        'Inventory:Edit',
        'Inventory:Delete',
        'Inventory:UploadFile'
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
        'Tickets:Assign',
        'Tickets:ViewWhoCreated'
    ],
    'Roles': [
        'Roles:View',
        'Roles:Create',
        'Roles:Edit',
        'Roles:Delete'
    ]
};

// Helper function to get permission display name
const getPermissionDisplayName = (permission) => {
    const [resource, action] = permission.split(':');
    
    let actionText = action;
    // Translate action to Turkish
    if (permission === 'Tickets:ViewWhoCreated') return 'Çağrıyı Oluşturanı Görebilme';
    if (action === 'View') actionText = 'Görüntüleme';
    else if (action === 'Create') actionText = 'Oluşturma';
    else if (action === 'Edit') actionText = 'Düzenleme';
    else if (action === 'Delete') actionText = 'Silme';
    else if (action === 'Assign') actionText = 'Atama';
    else if (action === 'UploadFile') actionText = 'Dosya Yükleme';
    
    // Special case for AdminPanel:View
    if (permission === 'AdminPanel:View') return 'Admin Paneline Erişim';
    
    return actionText;
};

// Helper function to get category display name
const getCategoryDisplayName = (category) => {
    if (category === 'Inventory') return 'Envanter';
    if (category === 'Users') return 'Kullanıcılar';
    if (category === 'Tickets') return 'Çağrılar';
    if (category === 'Roles') return 'Rol Yönetimi';
    if (category === 'AdminPanel') return 'Admin Paneli';
    return category;
};

const CreateRolePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams(); // Get the role ID from URL if editing
    const isEditMode = !!id;
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const [selectedPermissions, setSelectedPermissions] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [expandedCategory, setExpandedCategory] = useState(null);

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
        
        // If in edit mode, fetch the role data
        if (isEditMode) {
            fetchRoleData();
        }
    }, [id]);
    
    const fetchRoleData = async () => {
        try {
            setInitialLoading(true);
            const response = await httpClient.get(`/api/Roles/${id}`);
            
            // The httpClient interceptor might convert the response to an array
            // Get the first item if it's an array, otherwise use the response data directly
            const roleData = Array.isArray(response.data) ? response.data[0] : response.data;
            
            // Debug log to see the structure
            console.log('Role data from API:', roleData);
            
            if (!roleData) {
                throw new Error('No role data found');
            }
            
            // Update form data
            setFormData({
                name: roleData.name || '',
                description: roleData.description || '',
                permissions: Array.isArray(roleData.permissions) ? roleData.permissions : []
            });
            
            // Create a fresh permissions object with all permissions set to false initially
            const updatedPermissions = {};
            Object.keys(availablePermissions).forEach(category => {
                updatedPermissions[category] = {};
                availablePermissions[category].forEach(permission => {
                    updatedPermissions[category][permission] = false;
                });
            });
            
            // Process permissions (handle both string and object formats)
            if (roleData.permissions && Array.isArray(roleData.permissions)) {
                console.log('Permissions array:', roleData.permissions);
                
                roleData.permissions.forEach(permission => {
                    // Extract permission name whether it's a string or an object with a name property
                    const permissionName = typeof permission === 'string' ? permission : permission.name;
                    
                    if (!permissionName) return;
                    
                    // Split the permission to get the resource category
                    const [resource] = permissionName.split(':');
                    
                    // Check if this permission exists in our available permissions
                    if (updatedPermissions[resource] && updatedPermissions[resource][permissionName] !== undefined) {
                        // Set this permission to true
                        updatedPermissions[resource][permissionName] = true;
                    }
                });
            } else {
                console.warn('No permissions array found in the response:', roleData);
            }
            
            // Update the state with the processed permissions
            setSelectedPermissions(updatedPermissions);
            setError('');
        } catch (err) {
            console.error('Error fetching role:', err);
            console.error('Error details:', err.response?.data || err.message);
            setError('Rol bilgileri yüklenirken bir hata oluştu.');
        } finally {
            setInitialLoading(false);
        }
    };

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

    const handleAccordionChange = (category) => (event, isExpanded) => {
        setExpandedCategory(isExpanded ? category : null);
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
            
            if (isEditMode) {
                // Update existing role
                await httpClient.put(`/api/Roles/${id}`, roleData);
            } else {
                // Create new role
                await httpClient.post('/api/Roles', roleData);
            }
            
            navigate('/admin/roles');
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} role:`, err);
            setError(`Rol ${isEditMode ? 'güncellenirken' : 'oluşturulurken'} bir hata oluştu.`);
            setLoading(false);
        }
    };

    const isCategorySelected = (category) => {
        return selectedPermissions[category] && Object.values(selectedPermissions[category]).some(value => value);
    };

    const isAllCategorySelected = (category) => {
        return selectedPermissions[category] && Object.values(selectedPermissions[category]).every(value => value);
    };

    if (initialLoading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

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
                    {isEditMode ? 'Rolü Düzenle' : 'Yeni Rol Oluştur'}
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
                            <Stack spacing={1}>
                                {Object.entries(availablePermissions).map(([category, permissions]) => (
                                    <Accordion 
                                        key={category}
                                        expanded={expandedCategory === category}
                                        onChange={handleAccordionChange(category)}
                                        sx={{
                                            '&.Mui-expanded': {
                                                margin: '4px 0',
                                            }
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{
                                                backgroundColor: theme.palette.grey[50],
                                                '&:hover': {
                                                    backgroundColor: theme.palette.grey[100],
                                                },
                                            }}
                                        >
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                pr: 2
                                            }}>
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    {getCategoryDisplayName(category)}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    startIcon={isAllCategorySelected(category) ? <RemoveIcon /> : <AddIcon />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCategorySelectAll(category, !isAllCategorySelected(category));
                                                    }}
                                                    sx={{ ml: 2 }}
                                                >
                                                    {isAllCategorySelected(category) ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                                                </Button>
                                            </Box>
                                        </AccordionSummary>
                                        <AccordionDetails>
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
                                        </AccordionDetails>
                                    </Accordion>
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
                            {loading ? (isEditMode ? 'Güncelleniyor...' : 'Oluşturuluyor...') : (isEditMode ? 'Rolü Güncelle' : 'Rolü Oluştur')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateRolePage; 