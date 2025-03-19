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
    Timer as TimerIcon,
    Category as CategoryIcon,
    Build as BuildIcon,
    Schedule as ScheduleIcon,
    Group as GroupIcon,
    HourglassEmpty as DelayIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import your services
import SolutionTimeService from '../../api/SolutionTimeService';
import { getProblemTypes } from '../../api/ProblemTypeService';
import SolutionTypeService from '../../api/SolutionTypeService';
import { getAssignmentTimes } from '../../api/AssignmentTimeService';
import { getGroups } from '../../api/GroupService';
import DelayReasonService from '../../api/DelayReasonService';
import CancelReasonService from '../../api/CancelReasonService';

function TicketSettingsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // States for different settings
    const [solutionTimes, setSolutionTimes] = useState([]);
    const [problemTypes, setProblemTypes] = useState([]);
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [assignmentTimes, setAssignmentTimes] = useState([]);
    const [groups, setGroups] = useState([]);
    const [delayReasons, setDelayReasons] = useState([]);
    const [cancelReasons, setCancelReasons] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [
                solutionTimesRes,
                problemTypesRes,
                solutionTypesRes,
                assignmentTimesRes,
                groupsRes,
                delayReasonsRes,
                cancelReasonsRes
            ] = await Promise.all([
                SolutionTimeService.getAllSolutionTimes(),
                getProblemTypes(),
                SolutionTypeService.getSolutionTypes(),
                getAssignmentTimes(),
                getGroups(),
                DelayReasonService.getAllDelayReasons(),
                CancelReasonService.getAllCancelReasons()
            ]);

            setSolutionTimes(solutionTimesRes.data);
            setProblemTypes(problemTypesRes.data);
            setSolutionTypes(solutionTypesRes.data);
            setAssignmentTimes(assignmentTimesRes.data);
            setGroups(groupsRes.data);
            setDelayReasons(delayReasonsRes.data);
            setCancelReasons(cancelReasonsRes.data);
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
            title: 'Çözüm Süreleri',
            description: 'Problem tiplerine göre çözüm sürelerini yönet',
            icon: <TimerIcon sx={{ fontSize: 40 }} />,
            path: '/admin/ticket-settings/solution-times',
            color: '#1976d2',
            count: solutionTimes.length
        },
        {
            title: 'Problem Tipleri',
            description: 'Çağrı problem tiplerini yönet',
            icon: <CategoryIcon sx={{ fontSize: 40 }} />,
            path: '/admin/ticket-settings/problem-types',
            color: '#2e7d32',
            count: problemTypes.length
        },
        {
            title: 'Çözüm Tipleri',
            description: 'Çağrı çözüm tiplerini yönet',
            icon: <BuildIcon sx={{ fontSize: 40 }} />,
            path: '/admin/ticket-settings/solution-types',
            color: '#ed6c02',
            count: solutionTypes.length
        },
        {
            title: 'Atama Süreleri',
            description: 'Problem tiplerine göre atama sürelerini yönet',
            icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
            path: '/admin/ticket-settings/assignment-times',
            color: '#9c27b0',
            count: assignmentTimes.length
        },
        {
            title: 'Grup Atama Ayarları',
            description: 'Grup atamalarını görüntüle, düzenle ve yönet',
            icon: <GroupIcon sx={{ fontSize: 40 }} />,
            path: '/admin/groups',
            color: '#ed6c02',
            count: groups.length
        },
        {
            title: 'Gecikme Sebepleri',
            description: 'Çağrı gecikme sebeplerini yönet',
            icon: <DelayIcon sx={{ fontSize: 40 }} />,
            path: '/admin/ticket-settings/delay-reasons',
            color: '#f44336',
            count: delayReasons.length
        },
        {
            title: 'İptal Etme Sebepleri',
            description: 'Çağrı iptal etme sebeplerini yönet',
            icon: <CancelIcon sx={{ fontSize: 40 }} />,
            path: '/admin/ticket-settings/cancel-reasons',
            color: '#795548',
            count: cancelReasons.length
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
                    Çağrı Ayarları
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

export default TicketSettingsPage; 