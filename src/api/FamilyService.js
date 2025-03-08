import httpClient from './httpClient'

const endpoint = '/api/Family'

const getAllFamilies = () => {
    return httpClient.get(endpoint);
}

const getFamily = (id) => {
    return httpClient.get(`${endpoint}/${id}`);
}

const createFamily = (familyDto) => {
    return httpClient.post(endpoint, familyDto);
}

const updateFamily = (id, familyDto) => {
    return httpClient.put(`${endpoint}/${id}`, familyDto);
}

const deleteFamily = (id) => {
    return httpClient.delete(`${endpoint}/${id}`);
}

const getActiveFamilies = () => {
    return httpClient.get(`${endpoint}/active`);
}

const FamilyService = {
    getAllFamilies,
    getFamily,
    createFamily,
    updateFamily,
    deleteFamily,
    getActiveFamilies
}

export default FamilyService 