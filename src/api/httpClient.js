import axios from 'axios';
import { API_BASE_URL } from '../config';

const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor
httpClient.interceptors.request.use(
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

// Add a response interceptor
httpClient.interceptors.response.use(
    (response) => {
        // If the endpoint typically returns an array, ensure we have an array
        const arrayEndpoints = [
            '/api/Ticket$',  // Only match exact endpoint
            '/api/Ticket/my-tickets',
            '/api/Ticket/department-tickets',
            '/api/IdleDurationLimit/idle-breach-tickets',
            '/api/Inventory$',  // Only match exact endpoint
            '/api/Inventory/assigned',
            '/api/Notification',
            '/api/User',
            '/api/ProblemType',
            '/api/SolutionType',
            '/api/Company',
            '/api/Group',
            '/api/Department',
            '/api/Role',
            '/api/Family/active',
            '/api/InventoryType/active',
            '/api/Brand/active',
            '/api/Model/by-brand'
        ];

        // Check if the URL matches any of the array endpoints using regex
        const shouldBeArray = arrayEndpoints.some(endpoint => 
            new RegExp(endpoint, 'i').test(response.config.url)
        );

        if (shouldBeArray && !Array.isArray(response.data)) {
            // Ensure we have an array, even for empty or null responses
            response.data = Array.isArray(response.data) ? response.data : 
                           (response.data ? [response.data] : []);
        }

        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return Promise.reject(new Error('Your session has expired. Please log in again.'));
        }

        // Preserve the original error structure to handle different response formats
        return Promise.reject(error);
    }
);

export default httpClient;
