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
    Tooltip,
    useTheme,
    Grid,
    Card,
    CardContent,
    Fade,
    LinearProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
    Business as BusinessIcon,
    LocalShipping as SupplierIcon,
    Support as SupportIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getCompanies, deleteCompany } from '../../api/CompanyService';

const typeColors = {
    'Supplier': 'primary',
    'Support': 'secondary',
};

const typeIcons = {
    'Supplier': <SupplierIcon />,
    'Support': <SupportIcon />,
};

function CompaniesPage() {
    const theme = useTheme();
    const [companies, setCompanies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        suppliers: 0,
        support: 0
    });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await getCompanies();
            setCompanies(response.data);
            
            // Calculate stats
            const companyStats = response.data.reduce((acc, company) => ({
                total: acc.total + 1,
                suppliers: acc.suppliers + (company.type === 'Supplier' ? 1 : 0),
                support: acc.support + (company.type === 'Support' ? 1 : 0)
            }), { total: 0, suppliers: 0, support: 0 });
            
            setStats(companyStats);
            setError('');
        } catch (err) {
            setError('Şirketler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu şirketi silmek istediğinizden emin misiniz?')) {
            try {
                await deleteCompany(id);
                setSuccessMessage('Şirket başarıyla silindi');
                fetchCompanies();
            } catch (err) {
                setError('Şirket silinirken bir hata oluştu');
            }
        }
    };

    const filteredCompanies = companies.filter(company =>
        Object.values(company).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                        <Typography align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                            Şirketler yükleniyor...
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <IconButton
                        component={Link}
                        to="/admin"
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <BusinessIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Şirket Yönetimi
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        to="/admin/companies/create"
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                            }
                        }}
                    >
                        Yeni Şirket
                    </Button>
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: theme.palette.primary.light }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText }}>
                                    Toplam Şirket
                                </Typography>
                                <Typography variant="h3" sx={{ color: theme.palette.primary.contrastText }}>
                                    {stats.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: theme.palette.success.light }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.palette.success.contrastText }}>
                                    Tedarikçi Şirketler
                                </Typography>
                                <Typography variant="h3" sx={{ color: theme.palette.success.contrastText }}>
                                    {stats.suppliers}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: theme.palette.secondary.light }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: theme.palette.secondary.contrastText }}>
                                    Destek Şirketleri
                                </Typography>
                                <Typography variant="h3" sx={{ color: theme.palette.secondary.contrastText }}>
                                    {stats.support}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Alerts */}
                {error && (
                    <Fade in={true}>
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    </Fade>
                )}
                {successMessage && (
                    <Fade in={true}>
                        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                            {successMessage}
                        </Alert>
                    </Fade>
                )}

                {/* Search */}
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Şirket ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 3 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Şirket Adı</TableCell>
                                <TableCell>Tür</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Telefon</TableCell>
                                <TableCell>Adres</TableCell>
                                <TableCell align="right">İşlemler</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCompanies.map((company) => (
                                <TableRow 
                                    key={company.id}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {typeIcons[company.type]}
                                            <Typography>{company.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={company.type === 'Supplier' ? 'Tedarikçi' : 'Destek'}
                                            color={typeColors[company.type]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{company.email}</TableCell>
                                    <TableCell>{company.phone}</TableCell>
                                    <TableCell>{company.address}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Düzenle">
                                            <IconButton
                                                component={Link}
                                                to={`/admin/companies/edit/${company.id}`}
                                                sx={{ color: theme.palette.primary.main }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Sil">
                                            <IconButton
                                                onClick={() => handleDelete(company.id)}
                                                sx={{ color: theme.palette.error.main }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCompanies.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            {searchTerm ? 'Arama kriterlerine uygun şirket bulunamadı.' : 'Henüz şirket bulunmuyor.'}
                                        </Typography>
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
