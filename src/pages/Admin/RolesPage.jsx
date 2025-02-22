import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockRoles = [
    {
        id: 1,
        name: 'Sistem Yöneticisi',
        description: 'Tam sistem erişimi olan yönetici rolü',
        icon: <AdminIcon />,
        color: '#1976d2',
        userCount: 3,
        permissions: ['Tam Erişim', 'Kullanıcı Yönetimi', 'Rol Yönetimi', 'Sistem Ayarları']
    },
    {
        id: 2,
        name: 'Teknisyen',
        description: 'Teknik destek ve çağrı yönetimi rolü',
        icon: <TechnicianIcon />,
        color: '#2e7d32',
        userCount: 8,
        permissions: ['Çağrı Yönetimi', 'Envanter Görüntüleme', 'Rapor Oluşturma']
    },
    {
        id: 3,
        name: 'Departman Yöneticisi',
        description: 'Departman seviyesinde yönetim rolü',
        icon: <BusinessIcon />,
        color: '#ed6c02',
        userCount: 12,
        permissions: ['Departman Yönetimi', 'Çağrı Atama', 'Rapor Görüntüleme']
    },
    {
        id: 4,
        name: 'Standart Kullanıcı',
        description: 'Temel sistem kullanıcısı',
        icon: <UserIcon />,
        color: '#0288d1',
        userCount: 45,
        permissions: ['Çağrı Oluşturma', 'Kendi Çağrılarını Görüntüleme']
    },
];

const RolesPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRoles = mockRoles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
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

            {/* Roles Grid */}
            <Grid container spacing={3}>
                {filteredRoles.map((role) => (
                    <Grid item xs={12} sm={6} md={6} key={role.id}>
                        <Card
                            sx={{
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${role.color}15`,
                                            color: role.color,
                                            width: 56,
                                            height: 56,
                                            mr: 2
                                        }}
                                    >
                                        {role.icon}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: role.color }}>
                                                {role.name}
                                            </Typography>
                                            <Box>
                                                <Tooltip title="Düzenle">
                                                    <IconButton size="small" sx={{ color: role.color }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton size="small" color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {role.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <GroupIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {role.userCount} kullanıcı
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Yetkiler
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {role.permissions.map((permission, index) => (
                                        <Chip
                                            key={index}
                                            label={permission}
                                            size="small"
                                            sx={{
                                                bgcolor: `${role.color}15`,
                                                color: role.color,
                                                '&:hover': {
                                                    bgcolor: `${role.color}25`,
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default RolesPage; 