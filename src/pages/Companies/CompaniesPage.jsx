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
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getCompanies, deleteCompany } from '../../api/CompanyService';

const typeColors = {
    'Supplier': 'primary',
    'Support': 'secondary',
};

function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await getCompanies();
            setCompanies(response.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch companies.');
            console.error('Error fetching companies:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this company?')) return;
        try {
            await deleteCompany(id);
            fetchCompanies();
            setError('');
        } catch (err) {
            setError('Failed to delete company.');
            console.error('Error deleting company:', err);
        }
    };

    const filteredCompanies = companies.filter(company =>
        Object.values(company).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
                        Companies
                    </Typography>
                    <Button
                        component={Link}
                        to="/admin/companies/create"
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
                        Add Company
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
                    placeholder="Search companies..."
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
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Address</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCompanies.map((company) => (
                                <TableRow 
                                    key={company.id}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{company.name}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Chip 
                                            label={company.type}
                                            color={typeColors[company.type] || 'default'}
                                            size="small"
                                            sx={{ 
                                                borderRadius: 1,
                                                '& .MuiChip-label': {
                                                    px: 2
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{company.email}</TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{company.phone}</TableCell>
                                    <TableCell sx={{ py: 2, color: 'text.primary' }}>{company.address}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                component={Link}
                                                to={`/admin/companies/edit/${company.id}`}
                                                color="primary"
                                                size="small"
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
                                                onClick={() => handleDelete(company.id)}
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
                            {filteredCompanies.length === 0 && (
                                <TableRow>
                                    <TableCell 
                                        colSpan={6} 
                                        align="center"
                                        sx={{ 
                                            py: 4,
                                            color: 'text.secondary',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        No companies found.
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

export default CompaniesPage;
