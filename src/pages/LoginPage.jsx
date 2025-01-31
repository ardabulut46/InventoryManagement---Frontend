import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Alert,
    CircularProgress,
    useTheme,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LockOutlined as LockIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

const LoginPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                padding: 3,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={24}
                    sx={{
                        padding: { xs: 3, sm: 6 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: theme.palette.mode === 'dark' 
                            ? 'rgba(18, 18, 18, 0.95)' 
                            : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'hidden',
                        color: theme.palette.text.primary,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: theme.shadows[3],
                        }}
                    >
                        <LockIcon sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'white', fontSize: 30 }} />
                    </Box>

                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ 
                            mb: 1,
                            fontWeight: 'bold',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Welcome Back
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            mb: 4,
                            color: theme.palette.text.secondary,
                            textAlign: 'center'
                        }}
                    >
                        Sign in to Inventory Management System
                    </Typography>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                width: '100%', 
                                mb: 3,
                                borderRadius: 2,
                                animation: 'slideDown 0.5s ease-out',
                                '@keyframes slideDown': {
                                    from: { transform: 'translateY(-20px)', opacity: 0 },
                                    to: { transform: 'translateY(0)', opacity: 1 }
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box 
                        component="form" 
                        onSubmit={handleSubmit} 
                        sx={{ 
                            width: '100%',
                            mt: 1
                        }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: theme.palette.primary.main,
                                        }
                                    }
                                }
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: theme.palette.primary.main,
                                        }
                                    }
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                position: 'relative',
                                overflow: 'hidden',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: theme.shadows[8],
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                }
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginPage; 