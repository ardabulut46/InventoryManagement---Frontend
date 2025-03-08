import httpClient from './httpClient'

const endpoint = '/api/InventoryType'

const getAllTypes = () => {
    return httpClient.get(endpoint);
}

const getType = (id) => {
    return httpClient.get(`${endpoint}/${id}`);
}

const createType = (typeDto) => {
    return httpClient.post(endpoint, typeDto);
}

const updateType = (id, typeDto) => {
    return httpClient.put(`${endpoint}/${id}`, typeDto);
}

const deleteType = (id) => {
    return httpClient.delete(`${endpoint}/${id}`);
}

const getActiveTypes = () => {
    return httpClient.get(`${endpoint}/active`);
}

const InventoryTypeService = {
    getAllTypes,
    getType,
    createType,
    updateType,
    deleteType,
    getActiveTypes
}

export default InventoryTypeService 