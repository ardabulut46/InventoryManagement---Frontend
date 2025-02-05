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
import { Link, useNavigate } from 'react-router-dom';
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
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                color: 'error.main'
                            }
                        }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {successMessage && (
                    <Alert 
                        severity="success" 
                        sx={{ 
                            mb: 3,
                            borderRadius: 2,
                            '& .MuiAlert-icon': {
                                color: 'success.main'
                            }
                        }}
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
                        value={activeTab} 
                        onChange={(e, newValue) => setActiveTab(newValue)}
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
                        <Tab icon={<TimerIcon />} iconPosition="start" label="Çözüm Süreleri" />
                        <Tab icon={<CategoryIcon />} iconPosition="start" label="Problem Tipleri" />
                        <Tab icon={<CategoryIcon />} iconPosition="start" label="Çözüm Tipleri" />
                        <Tab icon={<PeopleIcon />} iconPosition="start" label="Kullanıcılar" />
                        <Tab icon={<ScheduleIcon />} iconPosition="start" label="Atama Süreleri" />
                        <Tab icon={<GroupIcon />} iconPosition="start" label="Gruplar" />
                        <Tab icon={<BusinessIcon />} iconPosition="start" label="Departmanlar" />
                    </Tabs>
                </Box>

                {/* Solution Times Tab */}
                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedSolutionTime(null);
                                setSolutionTimeForm({ problemTypeId: '', hours: 0, minutes: 0 });
                                setSolutionTimeDialog(true);
                            }}
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
                            Çözüm Süresi Ekle
                        </Button>
                    </Box>
                    <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Problem Tipi</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>Çözüm Süresi</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary' }}>İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {solutionTimes.map((time) => (
                                    <TableRow 
                                        key={time.id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>
                                            {problemTypes.find(pt => pt.id === time.problemTypeId)?.name || time.problemTypeName}
                                        </TableCell>
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>{time.timeToSolve}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
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
                                                    color="error"
                                                    onClick={() => handleDeleteSolutionTime(time.id)}
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
                                {solutionTimes.length === 0 && (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={3} 
                                            align="center"
                                            sx={{ 
                                                py: 4,
                                                color: 'text.secondary',
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            Çözüm süresi bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Problem Types Tab */}
                <TabPanel value={activeTab} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedProblemType(null);
                                setProblemTypeForm({ name: '', groupId: '' });
                                setProblemTypeDialog(true);
                            }}
                        >
                            Problem Tipi Ekle
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
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
                                                onClick={() => {
                                                    setSelectedProblemType(type);
                                                    setProblemTypeForm({
                                                        name: type.name,
                                                        groupId: type.groupId
                                                    });
                                                    setProblemTypeDialog(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteProblemType(type.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Solution Types Tab */}
                <TabPanel value={activeTab} index={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedSolutionType(null);
                                setSolutionTypeForm({ name: '', description: '' });
                                setSolutionTypeDialog(true);
                            }}
                        >
                            Çözüm Tipi Ekle
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
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
                                                onClick={() => {
                                                    setSelectedSolutionType(type);
                                                    setSolutionTypeForm({
                                                        name: type.name,
                                                        description: type.description
                                                    });
                                                    setSolutionTypeDialog(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteSolutionType(type.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Users Tab */}
                <TabPanel value={activeTab} index={3}>
                    <UserDetailsDialog
                        open={isDetailsOpen}
                        onClose={handleCloseDetails}
                        user={selectedUser}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <TextField
                            placeholder="Kullanıcı ara..."
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: 300,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
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
                            }}
                        >
                            Kullanıcı Ekle
                        </Button>
                    </Box>

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
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.name}</TableCell>
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.surname}</TableCell>
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.email}</TableCell>
                                        <TableCell sx={{ py: 2, color: 'text.primary' }}>{user.department?.name || user.department || '-'}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleUserDetails(user)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Assignment Times Tab */}
                <TabPanel value={activeTab} index={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedAssignmentTime(null);
                                setAssignmentTimeForm({ problemTypeId: '', hours: 0, minutes: 0 });
                                setAssignmentTimeDialog(true);
                            }}
                        >
                            Atama Süresi Ekle
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
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
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteAssignmentTime(time.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Groups Tab */}
                <TabPanel value={activeTab} index={5}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
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
                    <TableContainer>
                        <Table>
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
                                        <TableCell>
                                            {departments.find(d => d.id === group.departmentId)?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedGroup(group);
                                                    setGroupForm({
                                                        name: group.name,
                                                        departmentId: group.departmentId,
                                                    });
                                                    setSelectedDepartment(departments.find(d => d.id === group.departmentId));
                                                    setGroupDialog(true);
                                                }}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteGroup(group.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Departments Tab */}
                <TabPanel value={activeTab} index={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedDepartment(null);
                                setDepartmentForm({ name: '' });
                                setDepartmentDialog(true);
                            }}
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
                            Yeni Departman
                        </Button>
                    </Box>
                    <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary', pr: 0 }}>Departman Adı</TableCell>
                                    <TableCell sx={{ fontWeight: 600, py: 2, color: 'text.secondary', pl: 0 }}>İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {departments.map((department) => (
                                    <TableRow 
                                        key={department.id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ py: 1, color: 'text.primary', pr: 0 }}>{department.name}</TableCell>
                                        <TableCell sx={{ py: 1, pl: 0 }}>
                                            <Box sx={{ display: 'flex', gap: 0.25 }}>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedDepartment(department);
                                                        setDepartmentForm({ name: department.name });
                                                        setDepartmentDialog(true);
                                                    }}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: 'primary.50',
                                                        '&:hover': { bgcolor: 'primary.100' }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteDepartment(department.id)}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: 'error.50',
                                                        '&:hover': { bgcolor: 'error.100' }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {departments.length === 0 && (
                                    <TableRow>
                                        <TableCell 
                                            colSpan={2}
                                            align="center"
                                            sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}
                                        >
                                            Departman bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

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
            </Paper>
        </Container>
    );
}

export default AdminPage; 
