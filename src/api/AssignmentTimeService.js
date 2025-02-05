import httpClient from './httpClient';

const endpoint = '/api/AssignmentTimes';

export const getAssignmentTimes = () => {
    return httpClient.get(endpoint);
};

export const getAssignmentTimeById = (id) => {
    return httpClient.get(`${endpoint}/${id}`);
};

export const getAssignmentTimeByProblemType = (problemTypeId) => {
    return httpClient.get(`${endpoint}/problem-type/${problemTypeId}`);
};

export const createAssignmentTime = (createDto) => {
    return httpClient.post(endpoint, createDto);
};

export const updateAssignmentTime = (id, updateDto) => {
    return httpClient.put(`${endpoint}/${id}`, updateDto);
};

export const deleteAssignmentTime = (id) => {
    return httpClient.delete(`${endpoint}/${id}`);
}; 