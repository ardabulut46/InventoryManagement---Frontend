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
import { logout, getCurrentUser } from './api/auth';
import { jwtDecode } from "jwt-decode";
import { useTheme as useColorMode } from './contexts/ThemeContext';
import NotificationBell from './components/NotificationBell';
import ChatWidget from './components/ChatWidget';

function Layout() {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [adminPanelOpen, setAdminPanelOpen] = useState(false);
    const [menuOpenState, setMenuOpenState] = useState({
        Tickets: false,
        'Admin Panel': false,
        'Genel Ayarlar': false,
        'Çağrı Ayarları': false,
    });
    const theme = useMuiTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode, toggleDarkMode } = useColorMode();

    useEffect(() => {
        checkAdminRole();
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }, []);

    const checkAdminRole = () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = jwtDecode(token);
                console.log('Decoded token:', decodedToken); // Log the token structure for debugging
                
                // Direct check for AdminPanel:View permission
                if (decodedToken.Permission && Array.isArray(decodedToken.Permission) && 
                    decodedToken.Permission.includes('AdminPanel:View')) {
                    setIsAdmin(true);
                    return;
                }
                
                // Direct check for "Süper Yönetici" role
                if (decodedToken.role === "Süper Yönetici") {
                    setIsAdmin(true);
                    return;
                }
                
                // Define admin role names in different languages
                const adminRoleNames = ['admin', 'administrator', 'süper yönetici', 'yönetici', 'super admin', 'super administrator'];
                
                // Check for role property
                if (decodedToken.role) {
                    // If role is a string
                    if (typeof decodedToken.role === 'string') {
                        const roleLower = decodedToken.role.toLowerCase();
                        if (adminRoleNames.some(adminRole => roleLower.includes(adminRole))) {
                            setIsAdmin(true);
                            return;
                        }
                    } 
                    // If role is an array
                    else if (Array.isArray(decodedToken.role)) {
                        if (decodedToken.role.some(r => 
                            adminRoleNames.some(adminRole => r.toLowerCase().includes(adminRole))
                        )) {
                            setIsAdmin(true);
                            return;
                        }
                    }
                } 
                // Check for roles property (plural)
                else if (decodedToken.roles) {
                    // If roles is a string
                    if (typeof decodedToken.roles === 'string') {
                        const rolesLower = decodedToken.roles.toLowerCase();
                        if (adminRoleNames.some(adminRole => rolesLower.includes(adminRole))) {
                            setIsAdmin(true);
                            return;
                        }
                    } 
                    // If roles is an array
                    else if (Array.isArray(decodedToken.roles)) {
                        if (decodedToken.roles.some(r => 
                            adminRoleNames.some(adminRole => r.toLowerCase().includes(adminRole))
                        )) {
                            setIsAdmin(true);
                            return;
                        }
                    }
                }
                // Check for http://schemas.microsoft.com/ws/2008/06/identity/claims/role
                else if (decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
                    const rolesClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                    if (typeof rolesClaim === 'string') {
                        const claimLower = rolesClaim.toLowerCase();
                        if (adminRoleNames.some(adminRole => claimLower.includes(adminRole))) {
                            setIsAdmin(true);
                            return;
                        }
                    } else if (Array.isArray(rolesClaim)) {
                        if (rolesClaim.some(r => 
                            adminRoleNames.some(adminRole => r.toLowerCase().includes(adminRole))
                        )) {
                            setIsAdmin(true);
                            return;
                        }
                    }
                }
                
                // Check for Permission array (specific to your token structure)
                if (decodedToken.Permission && Array.isArray(decodedToken.Permission)) {
                    // Count admin-level permissions (Create, Edit, Delete)
                    const adminPermissions = decodedToken.Permission.filter(p => 
                        p.includes(':Create') || p.includes(':Delete') || p.includes(':Edit')
                    );
                    
                    // Count unique permission domains
                    const permissionDomains = new Set(decodedToken.Permission.map(p => p.split(':')[0]));
                    
                    // If user has at least 5 admin-level permissions across at least 2 domains, consider them an admin
                    const hasSignificantAdminPermissions = adminPermissions.length >= 5 && permissionDomains.size >= 2;
                    
                    // If user has permissions for all major domains, consider them an admin
                    const hasMajorDomainPermissions = 
                        permissionDomains.has('Users') && 
                        permissionDomains.has('Roles') && 
                        (permissionDomains.has('Inventory') || permissionDomains.has('Tickets'));
                    
                    setIsAdmin(hasSignificantAdminPermissions || hasMajorDomainPermissions);
                }
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            setIsAdmin(false);
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
        { text: 'Anasayfa', icon: <DashboardIcon />, path: '/' },
        { 
            text: 'Envanterler', 
            icon: <InventoryIcon />, 
            path: '/inventories',
            subItems: [
                { text: 'Tüm Envanterler', path: '/inventories' },
                { text: 'Üzerimdeki Envanterler', path: '/inventories/assigned' },
                { text: 'Grubumun Envanterleri', path: '/inventories/group' },
                { text: 'Fatura Yükle', path: '/inventories/upload-invoice' },
            ]
        },
        { 
            text: 'Çağrılar', 
            icon: <TicketIcon />, 
            path: '/tickets',
            subItems: [
                { text: 'Tüm Çağrılar', path: '/tickets' },
                { text: 'Grubumun Çağrıları', path: '/tickets/department' },
                { text: 'Üzerimdeki Çağrılar', path: '/tickets/my-tickets' },
                { text: 'Açtığım Çağrılar', path: '/tickets/my-created-tickets' },
            ]
        },
        { 
            text: 'Admin Paneli', 
            icon: <AdminPanelIcon />, 
            adminOnly: true,
            requiredPermissions: ['AdminPanel:View'],
            subItems: [
                { 
                    text: 'Genel Ayarlar', 
                    path: '/admin',
                    requiredPermissions: ['AdminPanel:View']
                },
                { 
                    text: 'Çağrı Ayarları', 
                    path: '/admin/ticket-settings',
                    requiredPermissions: ['AdminPanel:View', 'Tickets:View']
                },
                { 
                    text: 'Envanter Ayarları', 
                    path: '/admin/inventory-settings',
                    requiredPermissions: ['AdminPanel:View', 'Inventory:View']
                }
            ]
        },
    ];

    const renderMenuItem = (item, level = 0) => {
        // Special case for Admin Panel - check for AdminPanel:View permission
        if (item.text === 'Admin Paneli' || (item.requiredPermissions && item.requiredPermissions.includes('AdminPanel:View'))) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    // If user doesn't have AdminPanel:View permission and is not an admin, don't show the item
                    if (!isAdmin && (!decodedToken.Permission || !decodedToken.Permission.includes('AdminPanel:View'))) {
                        return null;
                    }
                } else {
                    return null;
                }
            } catch (error) {
                console.error('Error checking AdminPanel:View permission:', error);
                return null;
            }
        }
        
        // Check if the item should be shown based on permissions
        if (item.adminOnly || item.requiredPermissions) {
            // If we already know the user is an admin and there are no specific required permissions for this item
            if (isAdmin && !item.requiredPermissions) {
                // Continue rendering
            } 
            // Otherwise, check for specific permissions
            else {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const decodedToken = jwtDecode(token);
                        
                        // If the item requires specific permissions
                        if (item.requiredPermissions && Array.isArray(item.requiredPermissions)) {
                            // Check if user has ANY of the required permissions (not ALL)
                            const hasAnyRequiredPermission = item.requiredPermissions.some(permission => 
                                decodedToken.Permission && decodedToken.Permission.includes(permission)
                            );
                            
                            // For non-admin users, also check if they have admin-level permissions
                            const hasAdminLevelPermissions = !item.adminOnly || (
                                decodedToken.Permission && decodedToken.Permission.some(p => 
                                    p.includes(':Create') || p.includes(':Edit') || p.includes(':Delete')
                                )
                            );
                            
                            // Allow access if user has any required permission AND (is not an admin-only item OR has admin-level permissions)
                            if (!(hasAnyRequiredPermission && hasAdminLevelPermissions)) {
                                return null;
                            }
                        } 
                        // If no specific permissions are defined but the item is adminOnly, don't show it to non-admins
                        else if (item.adminOnly && !isAdmin) {
                            return null;
                        }
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.error('Error checking permissions:', error);
                    return null;
                }
            }
        }
        
        // Check if any sub-items would be visible
        if (item.subItems) {
            const visibleSubItems = item.subItems.filter(subItem => {
                // Recursively check if the sub-item would be visible
                return renderMenuItem(subItem, level + 1) !== null;
            });
            
            // If no sub-items would be visible, don't show this item
            if (visibleSubItems.length === 0) {
                return null;
            }
        }
        
        const isSelected = location.pathname === item.path || 
            (item.subItems && item.subItems.some(subItem => 
                subItem.path === location.pathname || 
                (subItem.subItems && subItem.subItems.some(nestedItem => nestedItem.path === location.pathname))
            ));

        return (
            <React.Fragment key={item.text}>
                <ListItem
                    button
                    onClick={() => {
                        if (item.subItems) {
                            setMenuOpenState(prev => ({
                                ...prev,
                                [item.text]: !prev[item.text]
                            }));
                        } else if (item.path) {
                            navigate(item.path);
                        }
                    }}
                    sx={{
                        mb: 0.5,
                        borderRadius: 2,
                        mx: 1,
                        pl: 2 + level * 2,
                        color: isSelected ? 'primary.main' : 'text.primary',
                        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        '&:hover': {
                            bgcolor: isSelected 
                                ? alpha(theme.palette.primary.main, 0.15) 
                                : alpha(theme.palette.primary.main, 0.08)
                        }
                    }}
                >
                    {level === 0 && (
                        <ListItemIcon sx={{ color: isSelected ? 'primary.main' : 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                    )}
                    <ListItemText 
                        primary={item.text} 
                        sx={{ 
                            '& .MuiTypography-root': {
                                fontSize: level > 0 ? '0.9rem' : '1rem',
                                fontWeight: level > 0 ? 400 : 500
                            }
                        }}
                    />
                    {item.subItems && (
                        menuOpenState[item.text] ? <ExpandLessIcon /> : <ExpandMoreIcon />
                    )}
                </ListItem>
                {item.subItems && (
                    <Collapse in={menuOpenState[item.text]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.subItems.map(subItem => renderMenuItem(subItem, level + 1))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

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
                                <ListItemText>Profilim</ListItemText>
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
                                <ListItemText>Çıkış Yap</ListItemText>
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
                            Hizmet Yönetim Sistemi
                        </Typography>
                    </Box>
                    <Divider sx={{ mx: 2, mb: 2 }} />
                    <List sx={{ flex: 1, px: 2 }}>
                        {menuItems.map(item => renderMenuItem(item))}
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
                                primary="Profil" 
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
                                Çıkış Yap
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
                    marginLeft: drawerOpen ? 0 : `-${280}px`,
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
                <DialogTitle>Çıkış Onayı</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Çıkış yapmak istediğinizden emin misiniz?
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
                        İptal
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
                        Çıkış Yap
                    </Button>
                </DialogActions>
            </Dialog>
            <ChatWidget />
        </Box>
    );
}

export default Layout;
