import httpClient from './httpClient';

const BASE_URL = '/api/DelayReason';

const DelayReasonService = {
    getAllDelayReasons: async () => {
        return await httpClient.get(BASE_URL);
    },

    getDelayReasonById: async (id) => {
        return await httpClient.get(`${BASE_URL}/${id}`);
    },

    createDelayReason: async (delayReason) => {
        return await httpClient.post(BASE_URL, delayReason);
    },

    updateDelayReason: async (id, delayReason) => {
        return await httpClient.put(`${BASE_URL}/${id}`, delayReason);
    },

    deleteDelayReason: async (id) => {
        return await httpClient.delete(`${BASE_URL}/${id}`);
    },

    getActiveDelayReasons: async () => {
        return await httpClient.get(`${BASE_URL}/active`);
    }
};

export default DelayReasonService; 