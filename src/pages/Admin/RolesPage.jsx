import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    IconButton,
    Button,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    TextField,
    InputAdornment,
    Chip,
    Avatar,
    useTheme,
    Tooltip,
    CircularProgress,
    Alert,
    Collapse,
    CardActionArea,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Security as SecurityIcon,
    SupervisorAccount as AdminIcon,
    Person as UserIcon,
    Build as TechnicianIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as ArrowBackIcon,
    Settings as SettingsIcon,
    Assignment as AssignmentIcon,
    Group as GroupIcon,
    Business as BusinessIcon,
    Inventory as InventoryIcon,
    ConfirmationNumber as TicketIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import httpClient from '../../api/httpClient';

// Helper function to get icon based on role name
const getRoleIcon = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin') || name.includes('yönetici')) {
        return <AdminIcon />;
    } else if (name.includes('teknisyen') || name.includes('teknik')) {
        return <TechnicianIcon />;
    } else if (name.includes('envanter')) {
        return <InventoryIcon />;
    } else if (name.includes('çağrı') || name.includes('ticket')) {
        return <TicketIcon />;
    } else if (name.includes('departman')) {
        return <BusinessIcon />;
    } else {
        return <SecurityIcon />;
    }
};

// Helper function to get color based on role name
const getRoleColor = (roleName) => {
    const name = roleName.toLowerCase();
    if (name.includes('admin') || name.includes('yönetici')) {
        return '#1976d2';
    } else if (name.includes('teknisyen') || name.includes('teknik')) {
        return '#2e7d32';
    } else if (name.includes('envanter')) {
        return '#ed6c02';
    } else if (name.includes('çağrı') || name.includes('ticket')) {
        return '#9c27b0';
    } else if (name.includes('departman')) {
        return '#0288d1';
    } else {
        return '#607d8b';
    }
};

// Helper function to categorize permissions
const categorizePermissions = (permissions) => {
    const categories = {
        'Inventory': [],
        'Users': [],
        'Tickets': [],
        'Other': []
    };

    permissions.forEach(permission => {
        // Check if permission is an object with a name property
        const permissionName = typeof permission === 'string' ? permission : permission.name;
        
        if (!permissionName) return; // Skip if no valid permission name
        
        const [resource, action] = permissionName.split(':');
        if (categories[resource]) {
            categories[resource].push(permissionName);
        } else {
            categories.Other.push(permissionName);
        }
    });

    return categories;
};

const RolesPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRoleId, setExpandedRoleId] = useState(null);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const response = await httpClient.get('/api/Roles');
                setRoles(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError('Roller yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    // Memoize the handleCardClick function to prevent unnecessary re-renders
    const handleCardClick = useCallback((roleId) => {
        // Toggle: if this card is already expanded, collapse it, otherwise expand it
        setExpandedRoleId(prevId => {
            const newId = String(prevId) === String(roleId) ? null : String(roleId);
            
            // Add a small delay to allow the collapse animation to complete
            if (newId) {
                // Scroll the expanded card into view for better UX
                setTimeout(() => {
                    const element = document.getElementById(`role-card-${roleId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 100);
            }
            
            return newId;
        });
    }, []);

    const handleDeleteRole = async (id, event) => {
        // Prevent the card click event from triggering
        if (event) {
            event.stopPropagation();
        }
        
        if (window.confirm('Bu rolü silmek istediğinizden emin misiniz?')) {
            try {
                await httpClient.delete(`/api/Roles/${id}`);
                setRoles(roles.filter(role => role.id !== id));
            } catch (err) {
                console.error('Error deleting role:', err);
                alert('Rol silinirken bir hata oluştu.');
            }
        }
    };

    const handleEditRole = (id, event) => {
        // Prevent the card click event from triggering
        if (event) {
            event.stopPropagation();
        }
        navigate(`/admin/roles/edit/${id}`);
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/admin')}
                    sx={{ mb: 3 }}
                >
                    Admin Paneline Dön
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
                    Rol Yönetimi
                </Typography>
            </Box>

            {/* Search and Actions */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4 
            }}>
                <TextField
                    placeholder="Rollerde ara..."
                    variant="outlined"
                    size="medium"
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/roles/create')}
                    sx={{
                        background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                        }
                    }}
                >
                    Yeni Rol Oluştur
                </Button>
            </Box>

            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Loading indicator */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                /* Roles Grid */
                <Grid container spacing={3} alignItems="flex-start">
                    {filteredRoles.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">
                                {searchTerm ? 'Arama kriterlerine uygun rol bulunamadı.' : 'Henüz hiç rol oluşturulmamış.'}
                            </Alert>
                        </Grid>
                    ) : (
                        filteredRoles.map((role) => {
                            const roleColor = getRoleColor(role.name);
                            const roleIcon = getRoleIcon(role.name);
                            const permissionCategories = categorizePermissions(role.permissions);
                            
                            // Use strict string comparison for reliable equality check
                            const isExpanded = String(expandedRoleId) === String(role.id);
                            
                            return (
                                <Grid item xs={12} sm={6} md={6} key={role.id} sx={{ display: 'flex' }}>
                                    <Card
                                        id={`role-card-${role.id}`}
                                        sx={{
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'all 0.3s ease',
                                            boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                                            '&:hover': {
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                            },
                                            cursor: 'pointer',
                                            borderLeft: isExpanded ? `4px solid ${roleColor}` : 'none',
                                        }}
                                    >
                                        <CardContent 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleCardClick(role.id);
                                            }}
                                            sx={{ 
                                                flex: '1 0 auto',
                                                padding: 3,
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: `${roleColor}15`,
                                                        color: roleColor,
                                                        width: 56,
                                                        height: 56,
                                                        mr: 2
                                                    }}
                                                >
                                                    {roleIcon}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: roleColor }}>
                                                            {role.name}
                                                        </Typography>
                                                        <Box>
                                                            <Tooltip title="Düzenle">
                                                                <IconButton 
                                                                    size="small" 
                                                                    sx={{ color: roleColor }}
                                                                    onClick={(e) => handleEditRole(role.id, e)}
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Sil">
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error"
                                                                    onClick={(e) => handleDeleteRole(role.id, e)}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {role.description || 'Bu rol için açıklama bulunmuyor.'}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {isExpanded ? 'Yetkileri gizle' : 'Yetkileri göster'}
                                                        </Typography>
                                                        {isExpanded ? 
                                                            <ExpandLessIcon fontSize="small" color="action" sx={{ ml: 0.5 }} /> : 
                                                            <ExpandMoreIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
                                                        }
                                                    </Box>
                                                </Box>
                                            </Box>
                                            
                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
                                                <Divider sx={{ my: 2 }} />
                                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                                    Yetkiler
                                                </Typography>
                                                {Object.entries(permissionCategories).map(([category, perms]) => 
                                                    perms.length > 0 && (
                                                        <Box key={category} sx={{ mb: 2 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: roleColor }}>
                                                                {category === 'Inventory' ? 'Envanter' : 
                                                                category === 'Users' ? 'Kullanıcılar' : 
                                                                category === 'Tickets' ? 'Çağrılar' : 'Diğer'}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                                                {perms.map((permission, index) => {
                                                                    // Get the permission name (handle both string and object formats)
                                                                    const permissionName = typeof permission === 'string' ? permission : permission.name;
                                                                    if (!permissionName) return null;
                                                                    
                                                                    const [resource, action] = permissionName.split(':');
                                                                    let actionText = action;
                                                                    
                                                                    // Translate action to Turkish
                                                                    if (action === 'View') actionText = 'Görüntüleme';
                                                                    else if (action === 'Create') actionText = 'Oluşturma';
                                                                    else if (action === 'Edit') actionText = 'Düzenleme';
                                                                    else if (action === 'Delete') actionText = 'Silme';
                                                                    else if (action === 'Assign') actionText = 'Atama';
                                                                    
                                                                    return (
                                                                        <Chip
                                                                            key={index}
                                                                            label={actionText}
                                                                            size="small"
                                                                            sx={{
                                                                                bgcolor: `${roleColor}15`,
                                                                                color: roleColor,
                                                                                '&:hover': {
                                                                                    bgcolor: `${roleColor}25`,
                                                                                }
                                                                            }}
                                                                        />
                                                                    );
                                                                })}
                                                            </Box>
                                                        </Box>
                                                    )
                                                )}
                                            </Collapse>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })
                    )}
                </Grid>
            )}
        </Container>
    );
};

export default RolesPage; 