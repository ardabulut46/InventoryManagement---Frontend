import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getDepartmentTickets } from '../api/TicketService';

const NotificationContext = createContext(null);

// Define the hook at the top level
const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [lastKnownTickets, setLastKnownTickets] = useState([]);

    const fetchDepartmentTickets = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await getDepartmentTickets();
            const currentTickets = response.data;

            // Compare with last known tickets to find new ones
            if (lastKnownTickets.length > 0) {
                const newTickets = currentTickets.filter(
                    ticket => !lastKnownTickets.some(
                        lastTicket => lastTicket.id === ticket.id
                    )
                );

                // Add notifications for new tickets
                newTickets.forEach(ticket => {
                    setNotifications(prev => [{
                        id: Date.now(),
                        createdAt: new Date(),
                        isRead: false,
                        type: 'NewTicket',
                        message: `New ticket: ${ticket.subject}`,
                        referenceId: ticket.id
                    }, ...prev]);
                });
            } 

            setLastKnownTickets(currentTickets);
        } catch (error) {
            // Silent fail for polling
        }
    }, [lastKnownTickets]);

    // Initial fetch and setup polling
    useEffect(() => {
        fetchDepartmentTickets();

        // Poll every 30 seconds
        const interval = setInterval(fetchDepartmentTickets, 30000);

        return () => clearInterval(interval);
    }, [fetchDepartmentTickets]);

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );
    }, []);

    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );
    }, []);

    const getUnreadCount = useCallback(() => {
        return notifications.filter(n => !n.isRead).length;
    }, [notifications]);

    // Save notifications to localStorage
    useEffect(() => {
        if (notifications.length > 0) {
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    }, [notifications]);

    // Load notifications from localStorage on init
    useEffect(() => {
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            try {
                const parsed = JSON.parse(savedNotifications);
                // Only load notifications from the last 24 hours
                const recentNotifications = parsed.filter(n => 
                    new Date(n.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
                );
                setNotifications(recentNotifications);
            } catch (error) {
                // Silent fail for localStorage parsing
            }
        }
    }, []);

    const value = {
        notifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
        getUnreadCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export { NotificationProvider, useNotifications }; 