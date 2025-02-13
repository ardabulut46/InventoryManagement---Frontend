import httpClient from './httpClient';

export const getWarrantyExpiringInventories = async (days = 30) => {
    return await httpClient.get(`/api/Inventory/warranty-expiring?days=${days}`);
};

export const getWarrantyExpiredInventories = async () => {
    return await httpClient.get('/api/Inventory/warranty-expired');
}; 