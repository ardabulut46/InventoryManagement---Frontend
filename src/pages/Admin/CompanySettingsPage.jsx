import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    useTheme,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Business as BusinessIcon,
    AccountTree as DepartmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import your services
import { getCompanies } from '../../api/CompanyService';
import { getDepartments } from '../../api/DepartmentService';

function CompanySettingsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // States for different settings
    const [companies, setCompanies] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [companiesRes, departmentsRes] = await Promise.all([
                getCompanies(),
                getDepartments()
            ]);

            setCompanies(companiesRes.data);
            setDepartments(departmentsRes.data);
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Veriler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const settingsCards = [
        {
            title: 'Şirket Yönetimi',
            description: 'Şirketleri görüntüle, düzenle ve yönet',
            icon: <BusinessIcon sx={{ fontSize: 40 }} />,
            path: '/admin/companies',
            color: '#2e7d32',
            count: companies.length
        },
        {
            title: 'Departman Yönetimi',
            description: 'Departmanları görüntüle, düzenle ve yönet',
            icon: <DepartmentIcon sx={{ fontSize: 40 }} />,
            path: '/admin/departments',
            color: '#9c27b0',
            count: departments.length
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
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

                <Typography 
                    variant="h4" 
                    sx={{ 
                        mb: 4,
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    Şirket ve Konum Ayarları
                </Typography>

                <Grid container spacing={3}>
                    {settingsCards.map((card, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
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
                                <CardActionArea 
                                    onClick={() => navigate(card.path)}
                                    sx={{ height: '100%', p: 2 }}
                                >
                                    <CardContent>
                                        <Box 
                                            sx={{ 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                gap: 2
                                            }}
                                        >
                                            <Box 
                                                sx={{ 
                                                    p: 2,
                                                    borderRadius: '50%',
                                                    bgcolor: `${card.color}15`,
                                                    color: card.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {card.icon}
                                            </Box>
                                            <Box>
                                                <Typography 
                                                    variant="h6" 
                                                    component="div"
                                                    sx={{ 
                                                        mb: 1,
                                                        color: theme.palette.text.primary,
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {card.title}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary"
                                                    sx={{ mb: 2 }}
                                                >
                                                    {card.description}
                                                </Typography>
                                                <Typography 
                                                    variant="subtitle1"
                                                    sx={{ 
                                                        color: card.color,
                                                        fontWeight: 'medium'
                                                    }}
                                                >
                                                    {loading ? '...' : `${card.count} kayıt`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Container>
    );
}

export default CompanySettingsPage; 