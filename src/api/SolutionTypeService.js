import httpClient from './httpClient';

const endpoint = '/api/SolutionTypes';

const SolutionTypeService = {
    getSolutionTypes: () => {
        return httpClient.get(endpoint);
    },

    getSolutionTypeById: (id) => {
        return httpClient.get(`${endpoint}/${id}`);
    },

    createSolutionType: (data) => {
        return httpClient.post(endpoint, data);
    },

    updateSolutionType: (id, data) => {
        return httpClient.put(`${endpoint}/${id}`, data);
    },

    deleteSolutionType: (id) => {
        return httpClient.delete(`${endpoint}/${id}`);
    }
};

export default SolutionTypeService; 