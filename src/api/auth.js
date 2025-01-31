import axios from 'axios';
import { API_URL } from '../config';


export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/api/Auth/login`, {
            email,
            password
        });
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Store any user data if needed
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

// Add axios interceptor to include token in requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
); 