import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    Divider,
    Avatar,
    Alert,
    CircularProgress,
    Chip,
    useTheme
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    Security as SecurityIcon,
    Apartment as ApartmentIcon,
    LocationCity as CityIcon,
    Home as HomeIcon,
    Phone as PhoneIcon,
    Badge as BadgeIcon,
    Visibility as VisibilityIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { getCurrentUser } from '../api/auth';
import { getUserById } from '../api/UserService';

function MyProfilePage() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const currentUser = getCurrentUser();
            console.log('Current user from localStorage:', currentUser);
            
            if (!currentUser?.id) {
                throw new Error('Kullanıcı bulunamadı');
            }
            
            const response = await getUserById(currentUser.id);
            console.log('User data from API:', response.data);
            
            // Merge the data to ensure we have all fields
            const mergedProfile = {
                ...currentUser,
                ...response.data
            };
            console.log('Merged profile data:', mergedProfile);
            
            setProfile(mergedProfile);
            setError('');
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Profil bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    // Permission badges component
    const PermissionBadge = ({ active, icon, label }) => (
        <Chip
            icon={icon}
            label={label}
            variant={active ? "filled" : "outlined"}
            color={active ? "primary" : "default"}
            sx={{ 
                m: 0.5, 
                opacity: active ? 1 : 0.6,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    opacity: 0.9,
                    transform: active ? 'scale(1.05)' : 'none'
                }
            }}
        />
    );

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '70vh'
            }}>
                <CircularProgress size={60} />
                <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                    Profil bilgileri yükleniyor...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                <Alert 
                    severity="error" 
                    variant="filled"
                    sx={{ 
                        borderRadius: 2,
                        mb: 2
                    }}
                >
                    {error}
                </Alert>
                <Typography color="text.secondary">
                    Lütfen daha sonra tekrar deneyin veya sistem yöneticisiyle iletişime geçin.
                </Typography>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                <Alert 
                    severity="warning"
                    variant="filled"
                    sx={{ 
                        borderRadius: 2,
                        mb: 2
                    }}
                >
                    Profil bilgisi bulunamadı.
                </Alert>
                <Typography color="text.secondary">
                    Profil bilgileriniz şu anda mevcut değil.
                </Typography>
            </Box>
        );
    }

    const getInitials = () => {
        const nameInitial = profile.name?.[0] || '';
        const surnameInitial = profile.surname?.[0] || '';
        return (nameInitial + surnameInitial).toUpperCase() || 'K';
    };

    return (
        <Box sx={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            p: { xs: 2, sm: 3, md: 4 },
            animation: 'fadeIn 0.6s ease-out',
            '@keyframes fadeIn': {
                '0%': {
                    opacity: 0,
                    transform: 'translateY(10px)'
                },
                '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                }
            }
        }}>
            <Paper 
                elevation={4} 
                sx={{ 
                    p: { xs: 3, md: 5 }, 
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.98))',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '15px',
                        background: theme.palette.primary.main,
                        boxShadow: `0 0 20px ${theme.palette.primary.main}`
                    }
                }}
            >
                {/* Header with Avatar */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 5, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3
                }}>
                    <Avatar 
                        sx={{ 
                            width: 120, 
                            height: 120, 
                            bgcolor: theme.palette.primary.main,
                            fontSize: '2.5rem',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            border: '4px solid white'
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                color: 'primary.main', 
                                fontWeight: 'bold',
                                mb: 0.5
                            }}
                        >
                            {`${profile.name || ''} ${profile.surname || ''}`}
                        </Typography>
                        <Typography 
                            variant="subtitle1" 
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1 }}
                        >
                            <EmailIcon fontSize="small" />
                            {profile.email || 'E-posta bilgisi bulunmuyor'}
                        </Typography>
                        {profile.phone && (
                            <Typography 
                                variant="subtitle1" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1, mt: 1 }}
                            >
                                <PhoneIcon fontSize="small" />
                                {profile.phone}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            variant="outlined" 
                            sx={{ 
                                height: '100%', 
                                borderRadius: 2,
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                                    transform: 'translateY(-5px)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <PersonIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                                        Kişisel Bilgiler
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <EmailIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>E-posta</Typography>
                                            <Typography variant="body1" fontWeight="medium">{profile.email || 'Bilgi bulunmuyor'}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <BusinessIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Grup</Typography>
                                            <Typography variant="body1" fontWeight="medium">{profile.group?.name || 'Atanmamış'}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <BadgeIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Unvan</Typography>
                                            <Typography variant="body1" fontWeight="medium">{profile.title || 'Bilgi bulunmuyor'}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Location Information */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            variant="outlined" 
                            sx={{ 
                                height: '100%', 
                                borderRadius: 2,
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                                    transform: 'translateY(-5px)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LocationIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                                        Konum Bilgileri
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <ApartmentIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Konum</Typography>
                                            <Typography variant="body1" fontWeight="medium">{profile.location || 'Belirtilmemiş'}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <HomeIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Kat ve Oda</Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {profile.floor ? `Kat ${profile.floor}` : 'Kat belirtilmemiş'}
                                                {profile.room && `, Oda ${profile.room}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Address Information */}
                    <Grid item xs={12}>
                        <Card 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: 2,
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                                    transform: 'translateY(-5px)'
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <CityIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                                        Adres Bilgileri
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Şehir</Typography>
                                        <Typography variant="body1" fontWeight="medium">{profile.city || 'Belirtilmemiş'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>İlçe</Typography>
                                        <Typography variant="body1" fontWeight="medium">{profile.district || 'Belirtilmemiş'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Adres</Typography>
                                        <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>{profile.address || 'Belirtilmemiş'}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Permissions */}
                    {profile.permissions && (
                        <Grid item xs={12}>
                            <Card 
                                variant="outlined" 
                                sx={{ 
                                    borderRadius: 2,
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <SecurityIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
                                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                                            Yetkiler
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', p: 1 }}>
                                        <PermissionBadge 
                                            active={profile.permissions?.canView} 
                                            icon={<VisibilityIcon />} 
                                            label="Görüntüleme" 
                                        />
                                        <PermissionBadge 
                                            active={profile.permissions?.canCreate} 
                                            icon={<AddIcon />} 
                                            label="Oluşturma" 
                                        />
                                        <PermissionBadge 
                                            active={profile.permissions?.canEdit} 
                                            icon={<EditIcon />} 
                                            label="Düzenleme" 
                                        />
                                        <PermissionBadge 
                                            active={profile.permissions?.canDelete} 
                                            icon={<DeleteIcon />} 
                                            label="Silme" 
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Box>
    );
}

export default MyProfilePage; 