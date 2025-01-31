// src/Layout.jsx
import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    useTheme as useMuiTheme,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Tooltip,
    alpha,
    Menu,
    MenuItem,
    Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    Business as BusinessIcon,
    ConfirmationNumber as TicketIcon,
    People as PeopleIcon,
    ExitToApp as LogoutIcon,
    Category as CategoryIcon,
    Person as PersonIcon,
    Group as GroupIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    AdminPanelSettings as AdminPanelIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { logout } from './api/auth';
import { jwtDecode } from "jwt-decode";
import { useTheme as useColorMode } from './contexts/ThemeContext';
import NotificationBell from './components/NotificationBell';

function Layout() {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [menuOpenState, setMenuOpenState] = useState({
        Tickets: false,
    });
    const theme = useMuiTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode, toggleDarkMode } = useColorMode();

    useEffect(() => {
        checkAdminRole();
        getUserFromToken();
    }, []);

    const checkAdminRole = () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = jwtDecode(token);
                setIsAdmin(decodedToken.role === 'Admin');
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            setIsAdmin(false);
        }
    };

    const getUserFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUser({
                    name: decodedToken.given_name,
                    surname: decodedToken.family_name
                });
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            setUser(null);
        }
    };

    const handleLogoutClick = () => {
        setLogoutDialogOpen(true);
    };

    const handleLogoutConfirm = () => {
        setLogoutDialogOpen(false);
        logout();
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };

    const handleProfileClick = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setProfileAnchorEl(null);
    };

    const handleProfileMenuClick = (path) => {
        handleProfileClose();
        navigate(path);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Companies', icon: <BusinessIcon />, path: '/companies' },
        { text: 'Inventories', icon: <InventoryIcon />, path: '/inventories' },
        { text: 'Tickets', icon: <TicketIcon />, path: '/tickets' },
        { text: 'Users', icon: <PeopleIcon />, path: '/users', adminOnly: true },
        { text: 'Groups', icon: <GroupIcon />, path: '/groups', adminOnly: true },
        { text: 'Admin Panel', icon: <AdminPanelIcon />, path: '/admin', adminOnly: true },
    ];

    return (
        <Box sx={{ display: 'flex', bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: theme.zIndex.drawer + 1,
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                    backgroundImage: 'none'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ marginRight: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={toggleDarkMode} color="inherit">
                            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                        <NotificationBell />
                        <Button
                            color="inherit"
                            onClick={handleProfileClick}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'rgba(0,0,0,0.05)',
                                }
                            }}
                        >
                            {user?.name} {user?.surname}
                        </Button>
                        <Menu
                            anchorEl={profileAnchorEl}
                            open={Boolean(profileAnchorEl)}
                            onClose={handleProfileClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    minWidth: 180,
                                    borderRadius: 2,
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 4px 24px rgba(0,0,0,0.3)'
                                        : '0 4px 24px rgba(0,0,0,0.1)',
                                }
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem 
                                onClick={() => handleProfileMenuClick('/profile')}
                                sx={{ 
                                    py: 1,
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.1)'
                                            : 'rgba(0,0,0,0.05)',
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <PersonIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>My Profile</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem 
                                onClick={handleLogoutClick}
                                sx={{ 
                                    py: 1,
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" color="error" />
                                </ListItemIcon>
                                <ListItemText>Logout</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="persistent"
                anchor="left"
                open={drawerOpen}
                sx={{
                    width: 280,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                        borderRight: 'none',
                        boxShadow: darkMode ? '2px 0 8px rgba(0,0,0,0.2)' : '2px 0 8px rgba(0,0,0,0.08)',
                        bgcolor: theme.palette.background.paper,
                        backgroundImage: 'none',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box 
                        sx={{ 
                            p: 3, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ 
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                fontWeight: 700,
                                letterSpacing: '0.5px'
                            }}
                        >
                            Inventory System
                        </Typography>
                    </Box>
                    <Divider sx={{ mx: 2, mb: 2 }} />
                    <List sx={{ flex: 1, px: 2 }}>
                        {menuItems.map((item) => (
                            (!item.adminOnly || (item.adminOnly && isAdmin)) && (
                                <ListItem
                                    key={item.text}
                                    button
                                    component={Link}
                                    to={item.path}
                                    selected={location.pathname === item.path}
                                    sx={{
                                        borderRadius: '8px',
                                        mx: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {drawerOpen && <ListItemText primary={item.text} />}
                                </ListItem>
                            )
                        ))}
                    </List>
                    <Divider sx={{ mx: 2, mb: 2 }} />
                    <List sx={{ px: 2 }}>
                        <ListItem
                            button
                            component={Link}
                            to="/profile"
                            sx={{
                                minHeight: 48,
                                borderRadius: 2,
                                mb: 2,
                                bgcolor: location.pathname === '/profile'
                                    ? alpha(theme.palette.primary.main, darkMode ? 0.15 : 0.1)
                                    : 'transparent',
                                color: location.pathname === '/profile' ? theme.palette.primary.main : theme.palette.text.primary,
                                boxShadow: location.pathname === '/profile' && !darkMode ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                '&:hover': {
                                    bgcolor: location.pathname === '/profile'
                                        ? alpha(theme.palette.primary.main, darkMode ? 0.2 : 0.15)
                                        : alpha(theme.palette.primary.main, darkMode ? 0.08 : 0.05),
                                    boxShadow: !darkMode ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                                    transform: !darkMode ? 'translateY(-1px)' : 'none',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            <ListItemIcon 
                                sx={{ 
                                    minWidth: 40,
                                    color: location.pathname === '/profile' 
                                        ? theme.palette.primary.main 
                                        : theme.palette.text.secondary,
                                    transition: 'color 0.2s ease-in-out',
                                }}
                            >
                                <PersonIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary="My Profile" 
                                primaryTypographyProps={{
                                    sx: {
                                        fontWeight: location.pathname === '/profile' ? 600 : 400,
                                        transition: 'font-weight 0.2s ease-in-out',
                                    }
                                }}
                            />
                        </ListItem>
                        <Box sx={{ px: 1, mb: 3 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogoutClick}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    py: 1,
                                    borderWidth: '1.5px',
                                    '&:hover': {
                                        borderWidth: '1.5px',
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                        boxShadow: !darkMode ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                                        transform: !darkMode ? 'translateY(-1px)' : 'none',
                                    }
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    </List>
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 0,
                    width: `calc(100% - ${drawerOpen ? 280 : 0}px)`,
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    bgcolor: theme.palette.background.default,
                    minHeight: '100vh'
                }}
            >
                <Toolbar />
                <Box sx={{ p: 3 }}>
                    <Outlet />
                </Box>
            </Box>

            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 24px rgba(0,0,0,0.3)'
                            : '0 4px 24px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleLogoutCancel}
                        sx={{ 
                            textTransform: 'none',
                            borderRadius: 2,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleLogoutConfirm} 
                        variant="contained" 
                        color="error"
                        sx={{ 
                            textTransform: 'none',
                            borderRadius: 2,
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Layout;
