import httpClient from './httpClient';

const BASE_URL = '/api/CancelReason';

const CancelReasonService = {
    getAllCancelReasons: async () => {
        return await httpClient.get(BASE_URL);
    },

    getCancelReasonById: async (id) => {
        return await httpClient.get(`${BASE_URL}/${id}`);
    },

    createCancelReason: async (cancelReason) => {
        return await httpClient.post(BASE_URL, cancelReason);
    },

    updateCancelReason: async (id, cancelReason) => {
        return await httpClient.put(`${BASE_URL}/${id}`, cancelReason);
    },

    deleteCancelReason: async (id) => {
        return await httpClient.delete(`${BASE_URL}/${id}`);
    },

    getActiveCancelReasons: async () => {
        return await httpClient.get(`${BASE_URL}/active`);
    }
};

export default CancelReasonService; 