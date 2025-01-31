import axios from 'axios';
import { API_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const getNotifications = async () => {
    return axios.get(`${API_URL}/notification`, getHeaders());
};

export const getUnreadCount = async () => {
    return axios.get(`${API_URL}/notification/unread-count`, getHeaders());
};

export const markAsRead = async (notificationId) => {
    return axios.put(`${API_URL}/notification/${notificationId}/mark-read`, {}, getHeaders());
};

export const markAllAsRead = async () => {
    return axios.put(`${API_URL}/notification/mark-all-read`, {}, getHeaders());
};

export const deleteNotification = async (notificationId) => {
    return axios.delete(`${API_URL}/notification/${notificationId}`, getHeaders());
}; 