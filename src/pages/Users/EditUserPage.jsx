import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserById, updateUser } from '../../api/UserService'
import httpClient from '../../api/httpClient'
import { getGroups } from '../../api/GroupService'
import {
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Paper,
    Divider,
    Card,
    CardContent,
    Alert,
    Autocomplete,
    Switch,
    FormControlLabel
} from '@mui/material'

function EditUserPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [roles, setRoles] = useState([])
    const [groups, setGroups] = useState([])
    const [selectedRole, setSelectedRole] = useState(null)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        location: '',
        groupId: null,
        password: '',
        floor: '',
        room: '',
        city: '',
        district: '',
        address: '',
        roleId: null,
        isActive: true
    })
    const [errors, setErrors] = useState({})
    const [submitError, setSubmitError] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                
                // Fetch user data
                const userResponse = await getUserById(id);
                console.log('getUserById response:', userResponse);
                
                // Handle different possible API response structures
                let userData = userResponse.data.data || userResponse.data;
                
                console.log('User data from API:', userData);
                
                // Handle case where API returns an array instead of a single object
                if (Array.isArray(userData)) {
                    if (userData.length > 0) {
                        userData = userData[0];
                        console.log('Using first user from array:', userData);
                    } else {
                        throw new Error('User array is empty');
                    }
                }
                
                if (!userData || Object.keys(userData).length === 0) {
                    throw new Error('No user data returned from API');
                }
                
                // Fetch roles and groups in parallel
                const [rolesResponse, groupsResponse] = await Promise.all([
                    httpClient.get('/api/Roles'),
                    getGroups()
                ]);
                
                const roles = rolesResponse.data.data || rolesResponse.data;
                const groups = groupsResponse.data.data || groupsResponse.data;
                
                console.log('Roles from API:', roles);
                console.log('Groups from API:', groups);
                
                // Set roles and groups
                setRoles(roles);
                setGroups(groups);
                
                // Find selected role and group
                let selectedRole = null;
                if (userData.roleId) {
                    selectedRole = roles.find(r => r.id === userData.roleId || r.id === parseInt(userData.roleId));
                    console.log('Selected role:', selectedRole);
                    setSelectedRole(selectedRole || null);
                }
                
                let selectedGroup = null;
                if (userData.groupId) {
                    selectedGroup = groups.find(g => g.id === userData.groupId || g.id === parseInt(userData.groupId));
                    console.log('Selected group:', selectedGroup);
                    setSelectedGroup(selectedGroup || null);
                }
                
                // Set form data - ensure all properties are properly extracted
                const formDataToSet = {
                    name: userData.name || '',
                    surname: userData.surname || '',
                    email: userData.email || '',
                    location: userData.location || '',
                    groupId: userData.groupId || null,
                    password: '',  // Don't show password for security
                    floor: userData.floor || '',
                    room: userData.room || '',
                    city: userData.city || '',
                    district: userData.district || '',
                    address: userData.address || '',
                    roleId: userData.roleId || null,
                    isActive: userData.isActive !== undefined ? userData.isActive : true
                };
                
                console.log('Setting form data:', formDataToSet);
                setFormData(formDataToSet);
                
                setLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setSubmitError('Kullanıcı bilgileri alınırken hata oluştu: ' + (err.message || err));
                setLoading(false);
            }
        };
        
        loadData();
    }, [id]);

    // Update form data when selectedRole or selectedGroup changes
    useEffect(() => {
        if (selectedRole) {
            setFormData(prev => ({
                ...prev,
                roleId: selectedRole.id,
            }));
        }
    }, [selectedRole]);

    useEffect(() => {
        if (selectedGroup) {
            setFormData(prev => ({
                ...prev,
                groupId: selectedGroup.id
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                groupId: null
            }));
        }
    }, [selectedGroup]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value
        }))
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleRoleChange = (event, newValue) => {
        setSelectedRole(newValue)
        setFormData(prev => ({
            ...prev,
            roleId: newValue?.id || null
        }))
    }

    const handleGroupChange = (event, newValue) => {
        setSelectedGroup(newValue)
        setFormData(prev => ({
            ...prev,
            groupId: newValue?.id || null
        }))
    }

    const validateForm = () => {
        const newErrors = {}
        
        // Required fields based on UpdateUserDto
        if (!formData.name) newErrors.name = 'İsim alanı zorunludur'
        if (!formData.surname) newErrors.surname = 'Soyisim alanı zorunludur'
        if (!formData.email) newErrors.email = 'Email alanı zorunludur'
        if (!formData.roleId) newErrors.roleId = 'Rol seçimi zorunludur'
        
        // Password validation if provided
        if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
            newErrors.password = 'Şifre en az 6 karakter olmalıdır'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            // Prepare the data to match UpdateUserDto
            const updateUserDto = {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                location: formData.location || null,
                groupId: formData.groupId || null,
                password: formData.password || null,
                floor: formData.floor || null,
                room: formData.room || null,
                city: formData.city || null,
                district: formData.district || null,
                address: formData.address || null,
                roleId: formData.roleId,
                isActive: formData.isActive
            };
            
            console.log('Submitting form data:', updateUserDto);
            await updateUser(id, updateUserDto);
            navigate('/users');
        } catch (err) {
            console.error('Error updating user:', err);
            
            // Handle different error response formats
            let errorMessage = 'Kullanıcı güncellenirken hata oluştu. Lütfen tekrar deneyin.';
            
            if (err.response) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data && err.response.data.errors) {
                    // Handle validation errors from ASP.NET Core
                    const validationErrors = err.response.data.errors;
                    errorMessage = Object.values(validationErrors).flat().join(', ');
                } else if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            }
            
            setSubmitError(errorMessage);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Yükleniyor...</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                    Kullanıcı Düzenle
                </Typography>
                <Divider sx={{ mb: 4 }} />

                {submitError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {submitError}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        {/* Personal Information */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ mb: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Kişisel Bilgiler
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="İsim"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                error={!!errors.name}
                                                helperText={errors.name}
                                                required
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Soyisim"
                                                name="surname"
                                                value={formData.surname}
                                                onChange={handleChange}
                                                error={!!errors.surname}
                                                helperText={errors.surname}
                                                required
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="E-posta"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                required
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Şifre"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                error={!!errors.password}
                                                helperText={errors.password || "Şifreyi değiştirmek için doldurun (en az 6 karakter)"}
                                                size="medium"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Role and Group Information */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ mb: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Rol ve Grup Bilgileri
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                options={roles}
                                                getOptionLabel={(role) => role.name}
                                                value={selectedRole}
                                                onChange={handleRoleChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Rol"
                                                        error={!!errors.roleId}
                                                        helperText={errors.roleId}
                                                        required
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                options={groups}
                                                getOptionLabel={(group) => group.name}
                                                value={selectedGroup}
                                                onChange={handleGroupChange}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Grup"
                                                        error={!!errors.groupId}
                                                        helperText={errors.groupId}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={formData.isActive}
                                                        onChange={handleChange}
                                                        name="isActive"
                                                        color="primary"
                                                    />
                                                }
                                                label="Aktif"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Location Information */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ mb: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Konum Bilgileri
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Konum"
                                                name="location"
                                                value={formData.location || ''}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="Kat"
                                                name="floor"
                                                value={formData.floor || ''}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="Oda"
                                                name="room"
                                                value={formData.room || ''}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Address Information */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ mb: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Adres Bilgileri
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Şehir"
                                                name="city"
                                                value={formData.city || ''}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="İlçe"
                                                name="district"
                                                value={formData.district || ''}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Adres"
                                                name="address"
                                                value={formData.address || ''}
                                                onChange={handleChange}
                                                multiline
                                                rows={3}
                                                size="medium"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Submit Buttons */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => navigate('/users')}
                                    size="large"
                                >
                                    İptal
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                >
                                    Güncelle
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    )
}

export default EditUserPage
