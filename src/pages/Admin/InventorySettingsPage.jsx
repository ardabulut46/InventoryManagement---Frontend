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
    Category as CategoryIcon,
    Inventory as InventoryIcon,
    BrandingWatermark as BrandingIcon,
    DeviceHub as DeviceHubIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import services
import FamilyService from '../../api/FamilyService';
import BrandService from '../../api/BrandService';
import ModelService from '../../api/ModelService';
import InventoryTypeService from '../../api/InventoryTypeService';

function InventorySettingsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // States for different settings
    const [families, setFamilies] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [types, setTypes] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [
                familiesRes,
                brandsRes,
                modelsRes,
                typesRes
            ] = await Promise.all([
                FamilyService.getAllFamilies(),
                BrandService.getAllBrands(),
                ModelService.getAllModels(),
                InventoryTypeService.getAllTypes()
            ]);

            setFamilies(familiesRes.data);
            setBrands(brandsRes.data);
            setModels(modelsRes.data);
            setTypes(typesRes.data);
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
            title: 'Envanter Aileleri',
            description: 'Envanter ailelerini yönet',
            icon: <CategoryIcon sx={{ fontSize: 40 }} />,
            path: '/admin/inventory-settings/families',
            color: '#1976d2',
            count: families.length
        },
        {
            title: 'Envanter Tipleri',
            description: 'Envanter tiplerini yönet',
            icon: <InventoryIcon sx={{ fontSize: 40 }} />,
            path: '/admin/inventory-settings/types',
            color: '#2e7d32',
            count: types.length
        },
        {
            title: 'Markalar',
            description: 'Envanter markalarını yönet',
            icon: <BrandingIcon sx={{ fontSize: 40 }} />,
            path: '/admin/inventory-settings/brands',
            color: '#ed6c02',
            count: brands.length
        },
        {
            title: 'Modeller',
            description: 'Envanter modellerini yönet',
            icon: <DeviceHubIcon sx={{ fontSize: 40 }} />,
            path: '/admin/inventory-settings/models',
            color: '#9c27b0',
            count: models.length
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
                    Envanter Ayarları
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

export default InventorySettingsPage; 