import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    Alert,
    Divider,
    MenuItem,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    Switch,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../api/UserService';
import { getGroups } from '../../api/GroupService';
import httpClient from '../../api/httpClient';

function CreateUserPage() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        location: '',
        groupId: null,
        password: '',
        role: '',
        floor: '',
        room: '',
        city: '',
        district: '',
        address: '',
        roleId: null,
        isActive: true
    });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        fetchGroups();
        fetchRoles();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await getGroups();
            setGroups(response.data);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setSubmitError('Gruplar alınırken hata oluştu');
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await httpClient.get('/api/Roles');
            setRoles(response.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setSubmitError('Roller alınırken hata oluştu');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleGroupChange = (event, newValue) => {
        setSelectedGroup(newValue);
        setFormData(prev => ({
            ...prev,
            groupId: newValue?.id || null
        }));
    };

    const handleRoleChange = (event, newValue) => {
        setSelectedRole(newValue);
        setFormData(prev => ({
            ...prev,
            roleId: newValue?.id || null,
            role: newValue?.name || ''
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'İsim gereklidir';
        if (!formData.surname) newErrors.surname = 'Soyisim gereklidir';
        if (!formData.email) newErrors.email = 'E-posta gereklidir';
        if (!formData.password) newErrors.password = 'Şifre gereklidir';
        if (!formData.groupId) newErrors.groupId = 'Grup gereklidir';
        if (!formData.roleId) newErrors.roleId = 'Rol gereklidir';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                userName: formData.email,  // Set userName to email
            };
            await createUser(dataToSubmit);
            navigate('/users');
        } catch (err) {
            console.error('Error creating user:', err);
            const errorMessage = err.response?.data || 'Kullanıcı oluşturulurken hata oluştu. Lütfen tekrar deneyin.';
            setSubmitError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                    Yeni Kullanıcı Oluştur
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
                                                helperText={errors.password}
                                                required
                                                size="medium"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Role and Department */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ mb: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Rol ve Departman
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
                                                        required
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
                                                value={formData.location}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="Kat"
                                                name="floor"
                                                value={formData.floor}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="Oda"
                                                name="room"
                                                value={formData.room}
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
                                                value={formData.city}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="İlçe"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Adres"
                                                name="address"
                                                value={formData.address}
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
                                    Kullanıcı Oluştur
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}

export default CreateUserPage;
