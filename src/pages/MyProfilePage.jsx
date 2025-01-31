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
    CircularProgress
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
} from '@mui/icons-material';
import { getCurrentUser } from '../api/auth';
import { getUserById } from '../api/UserService';

function MyProfilePage() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const currentUser = getCurrentUser();
            console.log('Current user from localStorage:', currentUser);
            
            if (!currentUser?.id) {
                throw new Error('User not found');
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
            setError('Failed to load profile information. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!profile) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="warning">No profile information available.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                {/* Header with Avatar */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 4, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                }}>
                    <Avatar 
                        sx={{ 
                            width: 100, 
                            height: 100, 
                            bgcolor: 'primary.main',
                            fontSize: '2.5rem'
                        }}
                    >
                        {profile.name?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                            {`${profile.name || ''} ${profile.surname || ''}`}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {profile.email || 'No email provided'}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Personal Information
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                            <Typography>{profile.email || 'Not provided'}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Group</Typography>
                                            <Typography>{profile.group?.name || 'Not Assigned'}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Location Information */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Location Information
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ApartmentIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                                            <Typography>{profile.location || 'Not Specified'}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <HomeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">Floor & Room</Typography>
                                            <Typography>
                                                {profile.floor ? `Floor ${profile.floor}` : 'Floor not specified'}
                                                {profile.room && `, Room ${profile.room}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Address Information */}
                    <Grid item xs={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <CityIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Address Information
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle2" color="text.secondary">City</Typography>
                                        <Typography>{profile.city || 'Not Specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle2" color="text.secondary">District</Typography>
                                        <Typography>{profile.district || 'Not Specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                                        <Typography sx={{ mt: 1 }}>{profile.address || 'Not Specified'}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Permissions */}
                    {profile.permissions && (
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                        <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                            Permissions
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {profile.permissions?.canView && (
                                            <Typography variant="body1" color="text.secondary">View</Typography>
                                        )}
                                        {profile.permissions?.canCreate && (
                                            <Typography variant="body1" color="text.secondary">Create</Typography>
                                        )}
                                        {profile.permissions?.canEdit && (
                                            <Typography variant="body1" color="text.secondary">Edit</Typography>
                                        )}
                                        {profile.permissions?.canDelete && (
                                            <Typography variant="body1" color="text.secondary">Delete</Typography>
                                        )}
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