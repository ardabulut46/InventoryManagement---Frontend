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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../api/UserService';
import { getGroups } from '../../api/GroupService';

const ROLES = ['Admin', 'User'];

function CreateUserPage() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        location: '',
        groupId: 0,
        password: '',
        role: '',
        floor: '',
        room: '',
        city: '',
        district: '',
        address: '',
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
    });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await getGroups();
            setGroups(response.data);
        } catch (err) {
            console.error('Error fetching groups:', err);
            setSubmitError('Failed to fetch groups');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleGroupChange = (event, newValue) => {
        setSelectedGroup(newValue);
        setFormData(prev => ({
            ...prev,
            groupId: newValue?.id || 0
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.surname) newErrors.surname = 'Surname is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.role) newErrors.role = 'Role is required';
        if (!formData.groupId) newErrors.groupId = 'Group is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        if (!validateForm()) return;

        try {
            await createUser(formData);
            navigate('/users');
        } catch (err) {
            console.error('Error creating user:', err);
            setSubmitError('Failed to create user. Please try again.');
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                    Create New User
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
                                        Personal Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Name"
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
                                                label="Surname"
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
                                                label="Email"
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
                                                label="Password"
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
                                        Role and Department
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Role"
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                error={!!errors.role}
                                                helperText={errors.role}
                                                required
                                                size="medium"
                                            >
                                                {ROLES.map((role) => (
                                                    <MenuItem key={role} value={role}>
                                                        {role}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
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
                                                        label="Group"
                                                        error={!!errors.groupId}
                                                        helperText={errors.groupId}
                                                        required
                                                    />
                                                )}
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
                                        Location Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="Floor"
                                                name="floor"
                                                value={formData.floor}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField
                                                fullWidth
                                                label="Room"
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
                                        Address Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="District"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                size="medium"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Address"
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

                        {/* Permissions Section */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ mb: 1 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                                        Permissions
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.canView}
                                                    onChange={handleChange}
                                                    name="canView"
                                                    color="primary"
                                                />
                                            }
                                            label="Can View"
                                            sx={{ minWidth: '120px' }}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.canCreate}
                                                    onChange={handleChange}
                                                    name="canCreate"
                                                    color="primary"
                                                />
                                            }
                                            label="Can Create"
                                            sx={{ minWidth: '120px' }}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.canEdit}
                                                    onChange={handleChange}
                                                    name="canEdit"
                                                    color="primary"
                                                />
                                            }
                                            label="Can Edit"
                                            sx={{ minWidth: '120px' }}
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData.canDelete}
                                                    onChange={handleChange}
                                                    name="canDelete"
                                                    color="primary"
                                                />
                                            }
                                            label="Can Delete"
                                            sx={{ minWidth: '120px' }}
                                        />
                                    </Box>
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
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                >
                                    Create User
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
