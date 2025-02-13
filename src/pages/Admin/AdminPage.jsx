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
    const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'general');
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

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        const section = searchParams.get('section');
        const tab = searchParams.get('tab');
        
        if (section) {
            setActiveSection(section);
            
            // Set the active tab based on the URL parameter
            if (tab) {
                let tabIndex = 0;
                switch (section) {
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
        }
    }, [location.search]);

    const fetchAllData = async () => {
        try {
            const [solutionTimesRes, problemTypesRes, solutionTypesRes, usersRes, departmentsRes, assignmentTimesRes] = await Promise.all([
                SolutionTimeService.getAllSolutionTimes(),
                getProblemTypes(),
                SolutionTypeService.getSolutionTypes(),
                getUsers(),
                getDepartments(),
                getAssignmentTimes()
            ]);
            setSolutionTimes(solutionTimesRes.data);
            setProblemTypes(problemTypesRes.data);
            setSolutionTypes(solutionTypesRes.data);
            setUsers(usersRes.data);
            setDepartments(departmentsRes.data);
            setAssignmentTimes(assignmentTimesRes.data);
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

    // Update URL when section changes
    const handleSectionChange = (event, newValue) => {
        setActiveSection(newValue);
        setActiveTab(0);
        navigate(`/admin?section=${newValue}`);
    };

    // Update URL when tab changes
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        let tabParam = '';
        
        switch (activeSection) {
            case 'general':
                tabParam = newValue === 0 ? 'users' 
                    : newValue === 1 ? 'groups' 
                    : newValue === 2 ? 'companies' : '';
                break;
            case 'ticket':
                tabParam = newValue === 0 ? 'solution-times'
                    : newValue === 1 ? 'problem-types'
                    : newValue === 2 ? 'solution-types'
                    : newValue === 3 ? 'assignment-times' : '';
                break;
        }
        
        if (tabParam) {
            navigate(`/admin?section=${activeSection}&tab=${tabParam}`);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
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
                        Admin Paneli
                    </Typography>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert 
                        severity="success" 
                        sx={{ mb: 3, borderRadius: 2 }}
                        onClose={() => setSuccessMessage('')}
                    >
                        {successMessage}
                    </Alert>
                )}

                <Box sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    mb: 3,
                }}>
                    <Tabs 
                        value={activeSection} 
                        onChange={handleSectionChange}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                minHeight: 48,
                                fontWeight: 500,
                            },
                            '& .Mui-selected': {
                                color: 'primary.main',
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                            },
                        }}
                    >
                        <Tab value="general" label="Genel Ayarlar" />
                        <Tab value="ticket" label="Çağrı Ayarları" />
                        <Tab value="inventory" label="Envanter Ayarları" />
                    </Tabs>
                </Box>

                {/* Genel Ayarlar Section */}
                {activeSection === 'general' && (
                    <Grid container spacing={3}>
                        {/* Users Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PeopleIcon color="primary" />
                                                <Typography variant="h6">Kullanıcılar</Typography>
                                            </Box>
                                            <Button
                                                component={Link}
                                                to="/admin/users/create"
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                            >
                                                Kullanıcı Ekle
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <TextField
                                        size="small"
                                        placeholder="Kullanıcı ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                    />
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ad</TableCell>
                                                    <TableCell>Soyad</TableCell>
                                                    <TableCell>E-posta</TableCell>
                                                    <TableCell>İşlemler</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredUsers.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>{user.name}</TableCell>
                                                        <TableCell>{user.surname}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <IconButton size="small" onClick={() => handleUserDetails(user)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" onClick={() => handleDeleteUser(user.id)} color="error">
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Groups Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <GroupIcon color="primary" />
                                                <Typography variant="h6">Gruplar</Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedGroup(null);
                                                    setGroupForm({ name: '', departmentId: null });
                                                    setSelectedDepartment(null);
                                                    setGroupDialog(true);
                                                }}
                                            >
                                                Grup Ekle
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ad</TableCell>
                                                    <TableCell>Departman</TableCell>
                                                    <TableCell>İşlemler</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {groups.map((group) => (
                                                    <TableRow key={group.id}>
                                                        <TableCell>{group.name}</TableCell>
                                                        <TableCell>{group.department?.name || '-'}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedGroup(group);
                                                                    setGroupForm({
                                                                        name: group.name,
                                                                        departmentId: group.departmentId,
                                                                    });
                                                                    setSelectedDepartment(departments.find(d => d.id === group.departmentId));
                                                                    setGroupDialog(true);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteGroup(group.id)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Companies Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <BusinessIcon color="primary" />
                                                <Typography variant="h6">Şirketler</Typography>
                                            </Box>
                                            <Button
                                                component={Link}
                                                to="/admin/companies"
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                            >
                                                Şirketleri Yönet
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <Typography color="text.secondary">
                                        Şirket yönetimi için tıklayın.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Departments Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <BusinessIcon color="primary" />
                                                <Typography variant="h6">Departmanlar</Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedDepartment(null);
                                                    setDepartmentForm({ name: '' });
                                                    setDepartmentDialog(true);
                                                }}
                                            >
                                                Departman Ekle
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Departman Adı</TableCell>
                                                    <TableCell>İşlemler</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {departments.map((department) => (
                                                    <TableRow key={department.id}>
                                                        <TableCell>{department.name}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedDepartment(department);
                                                                    setDepartmentForm({ name: department.name });
                                                                    setDepartmentDialog(true);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteDepartment(department.id)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Çağrı Ayarları Section */}
                {activeSection === 'ticket' && (
                    <Grid container spacing={3}>
                        {/* Solution Times Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TimerIcon color="primary" />
                                                <Typography variant="h6">Çözüm Süreleri</Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedSolutionTime(null);
                                                    setSolutionTimeForm({ problemTypeId: '', hours: 0, minutes: 0 });
                                                    setSolutionTimeDialog(true);
                                                }}
                                            >
                                                Çözüm Süresi Ekle
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Problem Tipi</TableCell>
                                                    <TableCell>Çözüm Süresi</TableCell>
                                                    <TableCell>İşlemler</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {solutionTimes.map((time) => (
                                                    <TableRow key={time.id}>
                                                        <TableCell>
                                                            {problemTypes.find(pt => pt.id === time.problemTypeId)?.name || time.problemTypeName}
                                                        </TableCell>
                                                        <TableCell>{time.timeToSolve}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    const [hours, minutes] = time.timeToSolve.split(':');
                                                                    setSelectedSolutionTime(time);
                                                                    setSolutionTimeForm({
                                                                        problemTypeId: time.problemTypeId,
                                                                        hours: parseInt(hours),
                                                                        minutes: parseInt(minutes)
                                                                    });
                                                                    setSolutionTimeDialog(true);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteSolutionTime(time.id)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Problem Types Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CategoryIcon color="primary" />
                                                <Typography variant="h6">Problem Tipleri</Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedProblemType(null);
                                                    setProblemTypeForm({ name: '', groupId: '' });
                                                    setProblemTypeDialog(true);
                                                }}
                                            >
                                                Problem Tipi Ekle
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ad</TableCell>
                                                    <TableCell>Grup</TableCell>
                                                    <TableCell>İşlemler</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {problemTypes.map((type) => (
                                                    <TableRow key={type.id}>
                                                        <TableCell>{type.name}</TableCell>
                                                        <TableCell>{groups.find(g => g.id === type.groupId)?.name || '-'}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedProblemType(type);
                                                                    setProblemTypeForm({
                                                                        name: type.name,
                                                                        groupId: type.groupId
                                                                    });
                                                                    setProblemTypeDialog(true);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteProblemType(type.id)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Solution Types Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CategoryIcon color="primary" />
                                                <Typography variant="h6">Çözüm Tipleri</Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedSolutionType(null);
                                                    setSolutionTypeForm({ name: '', description: '' });
                                                    setSolutionTypeDialog(true);
                                                }}
                                            >
                                                Çözüm Tipi Ekle
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Ad</TableCell>
                                                    <TableCell>Açıklama</TableCell>
                                                    <TableCell>İşlemler</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {solutionTypes.map((type) => (
                                                    <TableRow key={type.id}>
                                                        <TableCell>{type.name}</TableCell>
                                                        <TableCell>{type.description}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setSelectedSolutionType(type);
                                                                    setSolutionTypeForm({
                                                                        name: type.name,
                                                                        description: type.description
                                                                    });
                                                                    setSolutionTypeDialog(true);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteSolutionType(type.id)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Assignment Times Card */}
                        <Grid item xs={12} md={6}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ScheduleIcon color="primary" />
                                                <Typography variant="h6">Atama Süreleri</Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon />}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedAssignmentTime(null);
                                                    setAssignmentTimeForm({ problemTypeId: '', hours: 0, minutes: 0 });
                                                    setAssignmentTimeDialog(true);
                                                }}
                                            >
                                                Atama Süresi Ekle
                                            </Button>
                                        </Box>
                                    }
                                />
                                <CardContent>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Problem Tipi</TableCell>
                                                    <TableCell>Atama Süresi</TableCell>
                                                    <TableCell>İşlemler</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {assignmentTimes.map((time) => (
                                                    <TableRow key={time.id}>
                                                        <TableCell>
                                                            {problemTypes.find(pt => pt.id === time.problemTypeId)?.name || time.problemTypeName}
                                                        </TableCell>
                                                        <TableCell>{time.timeToAssign}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    const [hours, minutes] = time.timeToAssign.split(':');
                                                                    setSelectedAssignmentTime(time);
                                                                    setAssignmentTimeForm({
                                                                        problemTypeId: time.problemTypeId,
                                                                        hours: parseInt(hours),
                                                                        minutes: parseInt(minutes)
                                                                    });
                                                                    setAssignmentTimeDialog(true);
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteAssignmentTime(time.id)}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}

                {/* Envanter Ayarları Section */}
                {activeSection === 'inventory' && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '200px',
                        color: 'text.secondary'
                    }}>
                        <Typography variant="h6">
                            Bu bölüm henüz hazır değil
                        </Typography>
                    </Box>
                )}

                {/* Solution Times Dialog */}
                <Dialog 
                    open={solutionTimeDialog} 
                    onClose={() => setSolutionTimeDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    TransitionComponent={Fade}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        }
                    }}
                >
                    <DialogTitle>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6">
                                {selectedSolutionTime ? 'Çözüm Süresini Düzenle' : 'Çözüm Süresi Ekle'}
                            </Typography>
                            <IconButton onClick={() => setSolutionTimeDialog(false)} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Problem Tipi</InputLabel>
                                <Select
                                    value={solutionTimeForm.problemTypeId}
                                    onChange={(e) => setSolutionTimeForm({
                                        ...solutionTimeForm,
                                        problemTypeId: e.target.value
                                    })}
                                    label="Problem Tipi"
                                >
                                    {problemTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Saat"
                                    type="number"
                                    value={solutionTimeForm.hours}
                                    onChange={(e) => setSolutionTimeForm({
                                        ...solutionTimeForm,
                                        hours: parseInt(e.target.value) || 0
                                    })}
                                    inputProps={{ min: 0 }}
                                    fullWidth
                                />
                                <TextField
                                    label="Dakika"
                                    type="number"
                                    value={solutionTimeForm.minutes}
                                    onChange={(e) => setSolutionTimeForm({
                                        ...solutionTimeForm,
                                        minutes: parseInt(e.target.value) || 0
                                    })}
                                    inputProps={{ min: 0, max: 59 }}
                                    fullWidth
                                />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, gap: 1 }}>
                        <Button 
                            onClick={() => setSolutionTimeDialog(false)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                            }}
                        >
                            İptal
                        </Button>
                        <Button 
                            onClick={handleSolutionTimeSubmit} 
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3,
                                background: 'linear-gradient(45deg, #1976d2, #64b5f6)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1565c0, #42a5f5)',
                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                                }
                            }}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Problem Types Dialog */}
                <Dialog open={problemTypeDialog} onClose={() => setProblemTypeDialog(false)}>
                    <DialogTitle>
                        {selectedProblemType ? 'Problem Tipini Düzenle' : 'Problem Tipi Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Ad"
                            value={problemTypeForm.name}
                            onChange={(e) => setProblemTypeForm({
                                ...problemTypeForm,
                                name: e.target.value
                            })}
                            sx={{ mt: 2 }}
                        />
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Grup</InputLabel>
                            <Select
                                value={problemTypeForm.groupId}
                                onChange={(e) => setProblemTypeForm({
                                    ...problemTypeForm,
                                    groupId: e.target.value
                                })}
                                label="Grup"
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setProblemTypeDialog(false)}>İptal</Button>
                        <Button onClick={handleProblemTypeSubmit} variant="contained">Kaydet</Button>
                    </DialogActions>
                </Dialog>

                {/* Solution Types Dialog */}
                <Dialog open={solutionTypeDialog} onClose={() => setSolutionTypeDialog(false)}>
                    <DialogTitle>
                        {selectedSolutionType ? 'Çözüm Tipini Düzenle' : 'Çözüm Tipi Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Ad"
                            value={solutionTypeForm.name}
                            onChange={(e) => setSolutionTypeForm({
                                ...solutionTypeForm,
                                name: e.target.value
                            })}
                            sx={{ mt: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Açıklama"
                            value={solutionTypeForm.description}
                            onChange={(e) => setSolutionTypeForm({
                                ...solutionTypeForm,
                                description: e.target.value
                            })}
                            sx={{ mt: 2 }}
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSolutionTypeDialog(false)}>İptal</Button>
                        <Button onClick={handleSolutionTypeSubmit} variant="contained">Kaydet</Button>
                    </DialogActions>
                </Dialog>

                {/* Assignment Times Dialog */}
                <Dialog open={assignmentTimeDialog} onClose={() => setAssignmentTimeDialog(false)}>
                    <DialogTitle>
                        {selectedAssignmentTime ? 'Atama Süresini Düzenle' : 'Atama Süresi Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Problem Tipi</InputLabel>
                            <Select
                                value={assignmentTimeForm.problemTypeId}
                                onChange={(e) => setAssignmentTimeForm({
                                    ...assignmentTimeForm,
                                    problemTypeId: e.target.value
                                })}
                                label="Problem Tipi"
                            >
                                {problemTypes.map((type) => (
                                    <MenuItem key={type.id} value={type.id}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField
                                label="Saat"
                                type="number"
                                value={assignmentTimeForm.hours}
                                onChange={(e) => {
                                    const hours = parseInt(e.target.value) || 0;
                                    if (hours >= 0 && hours < 24) {
                                        setAssignmentTimeForm({
                                            ...assignmentTimeForm,
                                            hours: hours
                                        });
                                    }
                                }}
                                inputProps={{ 
                                    min: 0,
                                    max: 23
                                }}
                                helperText="24 saatten az olmalıdır"
                                error={assignmentTimeForm.hours >= 24}
                            />
                            <TextField
                                label="Dakika"
                                type="number"
                                value={assignmentTimeForm.minutes}
                                onChange={(e) => {
                                    const minutes = parseInt(e.target.value) || 0;
                                    if (minutes >= 0 && minutes < 60) {
                                        setAssignmentTimeForm({
                                            ...assignmentTimeForm,
                                            minutes: minutes
                                        });
                                    }
                                }}
                                inputProps={{ 
                                    min: 0,
                                    max: 59
                                }}
                                helperText="0-59 dakika"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAssignmentTimeDialog(false)}>İptal</Button>
                        <Button 
                            onClick={handleAssignmentTimeSubmit} 
                            variant="contained"
                            disabled={assignmentTimeForm.hours >= 24}
                        >
                            Kaydet
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Groups Dialog */}
                <Dialog open={groupDialog} onClose={() => setGroupDialog(false)}>
                    <DialogTitle>
                        {selectedGroup ? 'Grupu Düzenle' : 'Grup Ekle'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <TextField
                                label="Ad"
                                value={groupForm.name}
                                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                fullWidth
                                required
                            />
                            <Autocomplete
                                options={departments}
                                getOptionLabel={(department) => department.name}
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Departman"
                                        required
                                    />
                                )}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setGroupDialog(false)}>İptal</Button>
                        <Button onClick={handleGroupSubmit} variant="contained">Kaydet</Button>
                    </DialogActions>
                </Dialog>

                {/* Department Dialog */}
                <Dialog
                    open={departmentDialog}
                    onClose={() => {
                        setDepartmentDialog(false);
                        setSelectedDepartment(null);
                        setDepartmentForm({ name: '' });
                    }}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        {selectedDepartment ? 'Departman Düzenle' : 'Yeni Departman'}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Departman Adı"
                            fullWidth
                            value={departmentForm.name}
                            onChange={(e) => setDepartmentForm({ name: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setDepartmentDialog(false);
                                setSelectedDepartment(null);
                                setDepartmentForm({ name: '' });
                            }}
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleDepartmentSubmit}
                            variant="contained"
                            disabled={!departmentForm.name.trim()}
                        >
                            {selectedDepartment ? 'Güncelle' : 'Kaydet'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* User Details Dialog */}
                <UserDetailsDialog
                    open={isDetailsOpen}
                    onClose={handleCloseDetails}
                    user={selectedUser}
                />
            </Paper>
        </Container>
    );
}

export default AdminPage; 
