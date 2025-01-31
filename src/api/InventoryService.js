import httpClient from './httpClient'
import axios from 'axios'
import { API_URL } from '../config'

const endpoint = '/api/Inventory'

export const getInventories = () => {
    return httpClient.get(endpoint)
}

export const getInventoryById = (id) => {
    return httpClient.get(`${endpoint}/${id}`)
}

export const createInventory = (createInventoryDto) => {
    return httpClient.post(endpoint, createInventoryDto)
}

export const updateInventory = (id, updateInventoryDto) => {
    return httpClient.put(`${endpoint}/${id}`, updateInventoryDto)
}

export const deleteInventory = (id) => {
    return httpClient.delete(`${endpoint}/${id}`)
}

export const assignUser = (inventoryId, userId, notes) => {
    return httpClient.put(`${endpoint}/${inventoryId}/assign-user?userId=${userId}&notes=${notes || ''}`)
}

export const getInventoryHistory = (inventoryId) => {
    return httpClient.get(`${endpoint}/${inventoryId}/history`)
}

export const getAssignedInventories = () => {
    return httpClient.get(`${endpoint}/assigned`)
}

export const getAssignmentHistory = (inventoryId) => {
    return httpClient.get(`${endpoint}/${inventoryId}/assignment-history`)
}

export const getAllAssignmentHistory = () => {
    return httpClient.get(`${endpoint}/all-assignment-history`)
}

export const uploadInvoice = (inventoryId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post(`${endpoint}/${inventoryId}/upload-invoice`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const downloadInvoice = async (inventoryId) => {
    try {
        const response = await axios.get(`${API_URL}${endpoint}/${inventoryId}/download-invoice`, {
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': '*/*'  // Accept any content type
            }
        });
        return response;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Invoice not found or not attached to this inventory');
        }
        throw error;
    }
}

export const downloadExcelTemplate = async () => {
    try {
        const response = await axios.get(`${API_URL}${endpoint}/export-template`, {
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': '*/*'
            }
        });
        return response;
    } catch (error) {
        throw new Error('Failed to download template: ' + error.message);
    }
}

export const importExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post(`${API_URL}${endpoint}/import-excel`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}