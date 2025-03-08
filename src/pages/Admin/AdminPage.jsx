import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Container,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Divider,
    InputAdornment,
    Autocomplete,
    Fade,
    Grid,
    Card,
    CardContent,
    Tooltip,
    CardHeader,
    CardActionArea,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    AdminPanelSettings as AdminIcon,
    Timer as TimerIcon,
    Category as CategoryIcon,
    People as PeopleIcon,
    Schedule as ScheduleIcon,
    Group as GroupIcon,
    Business as BusinessIcon,
    AccountTree as DepartmentIcon,
    Settings as SettingsIcon,
    Inventory as InventoryIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SolutionTimeService from '../../api/SolutionTimeService';
import { getProblemTypes, createProblemType, updateProblemType, deleteProblemType } from '../../api/ProblemTypeService';
import SolutionTypeService from '../../api/SolutionTypeService';
import { getUsers, deleteUser } from '../../api/UserService';
import UserDetailsDialog from '../../components/UserDetailsDialog';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/DepartmentService';
import { getAssignmentTimes, createAssignmentTime, updateAssignmentTime, deleteAssignmentTime } from '../../api/AssignmentTimeService';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../../api/GroupService';
import { getCompanies } from '../../api/CompanyService';

// TabPanel component for tab content
function TabPanel({ children, value, index }) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
            {value === index && children}
        </Box>
    );
}

function AdminPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeSection = searchParams.get('section') || 'general';
    const [activeTab, setActiveTab] = useState(0);
    
    // Solution Times state
    const [solutionTimes, setSolutionTimes] = useState([]);
    const [solutionTimeDialog, setSolutionTimeDialog] = useState(false);
    const [selectedSolutionTime, setSelectedSolutionTime] = useState(null);
    const [solutionTimeForm, setSolutionTimeForm] = useState({
        problemTypeId: '',
        hours: 0,
        minutes: 0
    });

    // Problem Types state
    const [problemTypes, setProblemTypes] = useState([]);
    const [problemTypeDialog, setProblemTypeDialog] = useState(false);
    const [selectedProblemType, setSelectedProblemType] = useState(null);
    const [problemTypeForm, setProblemTypeForm] = useState({
        name: '',
        groupId: ''
    });
    const [departments, setDepartments] = useState([]);
    const [departmentDialog, setDepartmentDialog] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [departmentForm, setDepartmentForm] = useState({
        name: ''
    });

    // Solution Types state
    const [solutionTypes, setSolutionTypes] = useState([]);
    const [solutionTypeDialog, setSolutionTypeDialog] = useState(false);
    const [selectedSolutionType, setSelectedSolutionType] = useState(null);
    const [solutionTypeForm, setSolutionTypeForm] = useState({
        name: '',
        description: ''
    });

    // Users state
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Assignment Times state
    const [assignmentTimes, setAssignmentTimes] = useState([]);
    const [assignmentTimeDialog, setAssignmentTimeDialog] = useState(false);
    const [selectedAssignmentTime, setSelectedAssignmentTime] = useState(null);
    const [assignmentTimeForm, setAssignmentTimeForm] = useState({
        problemTypeId: '',
        hours: 0,
        minutes: 0
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Groups state
    const [groups, setGroups] = useState([]);
    const [groupDialog, setGroupDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({
        name: '',
        departmentId: null,
    });

    // Companies state
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            let tabIndex = 0;
            switch (activeSection) {
                case 'general':
                    tabIndex = tab === 'users' ? 0 : tab === 'groups' ? 1 : tab === 'companies' ? 2 : 0;
                    break;
                case 'ticket':
                    tabIndex = tab === 'solution-times' ? 0 
                        : tab === 'problem-types' ? 1 
                        : tab === 'solution-types' ? 2 
                        : tab === 'assignment-times' ? 3 : 0;
                    break;
            }
            setActiveTab(tabIndex);
        }
    }, [location.search, activeSection]);

    const fetchAllData = async () => {
        try {
            const [solutionTimesRes, problemTypesRes, solutionTypesRes, usersRes, departmentsRes, assignmentTimesRes, companiesRes] = await Promise.all([
                SolutionTimeService.getAllSolutionTimes(),
                getProblemTypes(),
                SolutionTypeService.getSolutionTypes(),
                getUsers(),
                getDepartments(),
                getAssignmentTimes(),
                getCompanies()
            ]);
            setSolutionTimes(solutionTimesRes.data);
            setProblemTypes(problemTypesRes.data);
            setSolutionTypes(solutionTypesRes.data);
            setUsers(usersRes.data);
            setDepartments(departmentsRes.data);
            setAssignmentTimes(assignmentTimesRes.data);
            setCompanies(companiesRes.data);
            const groupsResponse = await getGroups();
            setGroups(groupsResponse.data);
            setError('');
        } catch (err) {
            console.error('Error fetching data:', err);
            const errorDetail = err.response?.data?.detail || err.response?.data || err.message;
            const errorStatus = err.response?.status;
            const errorMessage = `Failed to fetch data (${errorStatus}): ${errorDetail}`;
            setError(errorMessage);
        }
    };

    // Solution Times handlers
    const handleSolutionTimeSubmit = async () => {
        try {
            const timeToSolve = `${solutionTimeForm.hours.toString().padStart(2, '0')}:${solutionTimeForm.minutes.toString().padStart(2, '0')}:00`;
            if (selectedSolutionTime) {
                await SolutionTimeService.updateSolutionTime(selectedSolutionTime.id, {
                    ...solutionTimeForm,
                    timeToSolve
                });
            } else {
                await SolutionTimeService.createSolutionTime({
                    ...solutionTimeForm,
                    timeToSolve
                });
            }
            setSolutionTimeDialog(false);
            fetchAllData();
            setSuccessMessage('Çözüm süresi başarıyla kaydedildi');
        } catch (err) {
            setError('Çözüm süresi kaydedilemedi');
        }
    };

    // Problem Types handlers
    const handleProblemTypeSubmit = async () => {
        try {
            if (selectedProblemType) {
                await updateProblemType(selectedProblemType.id, problemTypeForm);
            } else {
                await createProblemType(problemTypeForm);
            }
            setProblemTypeDialog(false);
            fetchAllData();
            setSuccessMessage('Problem tipi başarıyla kaydedildi');
        } catch (err) {
            setError('Problem tipi kaydedilemedi');
        }
    };

    const handleDeleteProblemType = async (id) => {
        if (window.confirm('Bu problem tipini silmek istediğinizden emin misiniz?')) {
            try {
                await deleteProblemType(id);
                fetchAllData();
                setSuccessMessage('Problem tipi başarıyla silindi');
            } catch (err) {
                setError('Problem tipi silinemedi');
            }
        }
    };

    // Solution Types handlers
    const handleSolutionTypeSubmit = async () => {
        try {
            if (selectedSolutionType) {
                await SolutionTypeService.updateSolutionType(selectedSolutionType.id, solutionTypeForm);
            } else {
                await SolutionTypeService.createSolutionType(solutionTypeForm);
            }
            setSolutionTypeDialog(false);
            fetchAllData();
            setSuccessMessage('Çözüm tipi başarıyla kaydedildi');
        } catch (err) {
            setError('Çözüm tipi kaydedilemedi');
        }
    };

    const handleDeleteSolutionType = async (id) => {
        if (window.confirm('Bu çözüm tipini silmek istediğinizden emin misiniz?')) {
            try {
                await SolutionTypeService.deleteSolutionType(id);
                fetchAllData();
                setSuccessMessage('Çözüm tipi başarıyla silindi');
            } catch (err) {
                setError('Çözüm tipi silinemedi');
            }
        }
    };

    // Users handlers
    const handleUserDetails = (user) => {
        setSelectedUser(user);
        setIsDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteUser(id);
                fetchAllData();
                setSuccessMessage('Kullanıcı başarıyla silindi');
            } catch (err) {
                setError('Kullanıcı silinemedi');
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        const departmentName = user.department?.name?.toString().toLowerCase() || '';
        const departmentValue = (typeof user.department === 'string' ? user.department : '').toLowerCase();
        
        return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.surname?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            departmentName.includes(searchLower) ||
            departmentValue.includes(searchLower)
        );
    });

    // Assignment Times handlers
    const handleAssignmentTimeSubmit = async () => {
        try {
            // Validate time span is not over 24 hours
            if (assignmentTimeForm.hours >= 24) {
                setError('Atama süresi 24 saat veya daha fazla olamaz. Lütfen 24 saatten az bir süre girin.');
                return;
            }

            const timeToAssign = `${assignmentTimeForm.hours.toString().padStart(2, '0')}:${assignmentTimeForm.minutes.toString().padStart(2, '0')}:00`;
            const submitData = {
                problemTypeId: assignmentTimeForm.problemTypeId,
                timeToAssign
            };

            if (selectedAssignmentTime) {
                await updateAssignmentTime(selectedAssignmentTime.id, submitData);
            } else {
                await createAssignmentTime(submitData);
            }
            setAssignmentTimeDialog(false);
            fetchAllData();
            setSuccessMessage('Atama süresi başarıyla kaydedildi');
        } catch (err) {
            if (err.response?.status === 400) {
                setError('Geçersiz zaman formatı. Lütfen 24 saatten az bir zaman girin.');
            } else {
                setError(err.message || 'Atama süresi kaydedilemedi');
            }
        }
    };

    const handleDeleteAssignmentTime = async (id) => {
        if (window.confirm('Bu atama süresini silmek istediğinizden emin misiniz?')) {
            try {
                await deleteAssignmentTime(id);
                fetchAllData();
                setSuccessMessage('Atama süresi başarıyla silindi');
            } catch (err) {
                setError('Atama süresi silinemedi');
            }
        }
    };

    // Groups handlers
    const handleGroupSubmit = async () => {
        try {
            if (!groupForm.name || !groupForm.departmentId) {
                setError('Lütfen tüm gerekli alanları doldurun');
                return;
            }

            if (selectedGroup) {
                await updateGroup(selectedGroup.id, {
                    id: selectedGroup.id,
                    ...groupForm
                });
            } else {
                await createGroup(groupForm);
            }
            setGroupDialog(false);
            fetchAllData();
            setSuccessMessage('Grup başarıyla kaydedildi');
        } catch (err) {
            setError('Grup kaydedilemedi');
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('Bu grubu silmek istediğinizden emin misiniz?')) {
            try {
                await deleteGroup(id);
                fetchAllData();
                setSuccessMessage('Grup başarıyla silindi');
            } catch (err) {
                setError('Grup silinemedi');
            }
        }
    };

    const handleDepartmentChange = (event, newValue) => {
        setSelectedDepartment(newValue);
        setGroupForm(prev => ({
            ...prev,
            departmentId: newValue?.id || null
        }));
    };

    // Department handlers
    const handleDepartmentSubmit = async () => {
        try {
            if (selectedDepartment) {
                await updateDepartment(selectedDepartment.id, departmentForm);
                setSuccessMessage('Departman başarıyla güncellendi');
            } else {
                await createDepartment(departmentForm);
                setSuccessMessage('Departman başarıyla oluşturuldu');
            }
            setDepartmentDialog(false);
            setSelectedDepartment(null);
            setDepartmentForm({ name: '' });
            fetchAllData();
        } catch (error) {
            setError('Departman kaydedilemedi');
        }
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await deleteDepartment(id);
            setSuccessMessage('Departman başarıyla silindi');
            fetchAllData();
        } catch (error) {
            setError('Departman silinemedi');
        }
    };

    const adminCards = [
        {
            title: 'Kullanıcı Yönetimi',
            description: 'Kullanıcıları görüntüle, düzenle ve yönet',
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            path: '/admin/users',
            color: '#1976d2'
        },
        {
            title: 'Şirket ve Konum Ayarları',
            description: 'Şirket ve departman yönetimini yapılandır',
            icon: <BusinessIcon sx={{ fontSize: 40 }} />,
            path: '/admin/company-settings',
            color: '#2e7d32'
        },
        {
            title: 'Rol Ayarları',
            description: 'Kullanıcı rollerini ve yetkilerini yönet',
            icon: <AdminIcon sx={{ fontSize: 40 }} />,
            path: '/admin/roles',
            color: '#9c27b0'
        },
        {
            title: 'Firma Yönetimi',
            description: 'Firmaları görüntüle, düzenle ve yönet',
            icon: <BusinessIcon sx={{ fontSize: 40 }} />,
            path: '/admin/companies',
            color: '#ed6c02'
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
                        Admin Paneli
                    </Typography>

                    <Grid container spacing={3}>
                {adminCards.map((card, index) => (
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
                                            >
                                                {card.description}
                                            </Typography>
                                            </Box>
                                        </Box>
                                </CardContent>
                            </CardActionArea>
                            </Card>
                        </Grid>
                ))}
                        </Grid>
        </Container>
    );
}

export default AdminPage; 
