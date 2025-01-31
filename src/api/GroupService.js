import httpClient from './httpClient';

const endpoint = '/api/Group';

export const getGroups = () => {
    return httpClient.get(endpoint);
};

export const getGroupById = (id) => {
    return httpClient.get(`${endpoint}/${id}`);
};

export const getGroupsByDepartment = (departmentId) => {
    return httpClient.get(`${endpoint}/department/${departmentId}`);
};

export const createGroup = (createGroupDto) => {
    return httpClient.post(endpoint, createGroupDto);
};

export const updateGroup = (id, groupDto) => {
    return httpClient.put(`${endpoint}/${id}`, groupDto);
};

export const deleteGroup = (id) => {
    return httpClient.delete(`${endpoint}/${id}`);
}; 