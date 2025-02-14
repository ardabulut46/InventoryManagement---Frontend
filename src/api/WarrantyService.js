import httpClient from './httpClient';

// Get inventories with active warranty (not expired and not expiring soon)
export const getActiveWarrantyInventories = async () => {
    try {
        const response = await httpClient.get('/api/Inventory/warranty-active');
        console.log('Active warranty response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching active warranties:', error);
        throw error;
    }
};

// Get inventories with expired warranty
export const getWarrantyExpiredInventories = async () => {
    try {
        const response = await httpClient.get('/api/Inventory/warranty-expired');
        console.log('Expired warranty response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching expired warranties:', error);
        throw error;
    }
};

// Get inventories with warranty expiring in 30 days
export const getWarrantyExpiringInMonth = async () => {
    try {
        const response = await httpClient.get('/api/Inventory/warranty-expiring?days=30');
        console.log('Expiring in month response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching warranties expiring in month:', error);
        throw error;
    }
};

// Get inventories with warranty expiring in 15 days
export const getWarrantyExpiringInFifteenDays = async () => {
    try {
        const response = await httpClient.get('/api/Inventory/warranty-expiring?days=15');
        console.log('Expiring in 15 days response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching warranties expiring in 15 days:', error);
        throw error;
    }
};

// Get most repaired inventories
export const getMostRepairedInventories = async () => {
    try {
        const response = await httpClient.get('/api/Inventory/most-repaired');
        console.log('Most repaired response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching most repaired inventories:', error);
        throw error;
    }
}; 