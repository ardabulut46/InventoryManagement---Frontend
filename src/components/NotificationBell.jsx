import React, { useState } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
    useTheme,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

function NotificationBell() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const { 
        notifications, 
        markAsRead, 
        markAllAsRead, 
        getUnreadCount 
    } = useNotifications();

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        markAsRead(notification.id);
        if (notification.type === 'NewTicket') {
            navigate(`/tickets/${notification.referenceId}`);
        }
        handleClose();
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                sx={{
                    position: 'relative',
                    '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.05)',
                    }
                }}
            >
                <Badge 
                    badgeContent={getUnreadCount()} 
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            backgroundColor: theme.palette.error.main,
                            color: theme.palette.error.contrastText,
                            fontWeight: 'bold',
                        }
                    }}
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        width: 360,
                        maxHeight: 400,
                        borderRadius: 2,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 24px rgba(0,0,0,0.3)'
                            : '0 4px 24px rgba(0,0,0,0.1)',
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Notifications
                    </Typography>
                    {getUnreadCount() > 0 && (
                        <Button 
                            size="small" 
                            onClick={handleMarkAllRead}
                            sx={{ 
                                textTransform: 'none',
                                fontWeight: 500,
                            }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </Box>
                <Divider />
                {notifications.length === 0 ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            No notifications
                        </Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                py: 1.5,
                                px: 2,
                                borderLeft: !notification.isRead ? `3px solid ${theme.palette.primary.main}` : 'none',
                                backgroundColor: !notification.isRead 
                                    ? theme.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(0,0,0,0.02)'
                                    : 'transparent',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? 'rgba(255,255,255,0.1)'
                                        : 'rgba(0,0,0,0.05)',
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: !notification.isRead ? 600 : 400 }}>
                                        {notification.message}
                                    </Typography>
                                    {!notification.isRead && (
                                        <CircleIcon 
                                            sx={{ 
                                                fontSize: 8, 
                                                color: theme.palette.primary.main,
                                                ml: 1,
                                                mt: 0.5
                                            }} 
                                        />
                                    )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}

export default NotificationBell; 