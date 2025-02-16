import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    InputAdornment,
    Alert,
    Container,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/UserService';
import UserDetailsDialog from '../../components/UserDetailsDialog';

function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch users.');
            console.error('Error fetching users:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteUser(id);
            fetchUsers();
            setError('');
        } catch (err) {
            setError('Failed to delete user.');
            console.error('Error deleting user:', err);
        }
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedUser(null);
    };

    const filteredUsers = users.filter(user =>
        Object.values(user).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <UserDetailsDialog
                open={isDetailsOpen}
                onClose={handleCloseDetails}
                user={selectedUser}
            />
            
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    mb: 3, 
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
                }}
            >
                <Button
                    onClick={() => navigate('/admin')}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        mb: 3,
                        color: 'text.secondary',
                        '&:hover': {
                            bgcolor: 'grey.100',
                        }
                    }}
                >
                    Geri
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Kullanıcı Yönetimi
                    </Typography>
                    <Button
                        component={Link}
                        to="/admin/users/create"
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                            }
                        }}
                    >
                        Yeni Kullanıcı
                    </Button>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                color: 'error.main'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            '&:hover': {
                                bgcolor: 'grey.100',
                            },
                            '& fieldset': {
                                borderColor: 'transparent',
                            },
                            '&:hover fieldset': {
                                borderColor: 'transparent',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                            },
                        }
                    }}
                    sx={{
                        mb: 3,
                        maxWidth: 500,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            '&:hover': {
                                bgcolor: 'background.default',
                            }
                        }
                    }}
                />

                <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Ad</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Soyad</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>E-posta</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Departman</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow 
                                    key={user.id}
                                    onClick={() => handleRowClick(user)}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            cursor: 'pointer'
                                        }
                                    }}
                                >
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.name}</TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.surname}</TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.email}</TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.department?.name || '-'}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                component={Link}
                                                to={`/admin/users/edit/${user.id}`}
                                                color="primary"
                                                size="small"
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{ 
                                                    bgcolor: 'primary.50',
                                                    '&:hover': {
                                                        bgcolor: 'primary.100',
                                                    }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(user.id);
                                                }}
                                                color="error"
                                                size="small"
                                                sx={{ 
                                                    bgcolor: 'error.50',
                                                    '&:hover': {
                                                        bgcolor: 'error.100',
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={5} 
                                        align="center"
                                        sx={{ 
                                            py: 4,
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        Kullanıcı bulunamadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}

export default UsersPage;
