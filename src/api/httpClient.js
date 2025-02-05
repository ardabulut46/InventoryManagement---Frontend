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
            '/api/Inventory$',  // Only match exact endpoint
            '/api/Inventory/assigned',
            '/api/Notification',
            '/api/User',
            '/api/ProblemType',
            '/api/SolutionType',
            '/api/Company',
            '/api/Group',
            '/api/Department',
            '/api/Role'
        ];

        // Check if the URL matches any of the array endpoints using regex
        const shouldBeArray = arrayEndpoints.some(endpoint => 
            new RegExp(endpoint, 'i').test(response.config.url)
        );

        if (shouldBeArray) {
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

        // Return a user-friendly error message
        const errorMessage = error.response?.data?.message 
            || error.response?.data?.error 
            || error.message 
            || 'An unexpected error occurred';

        return Promise.reject(new Error(errorMessage));
    }
);

export default httpClient;
