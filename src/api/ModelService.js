import httpClient from './httpClient'

const endpoint = '/api/Model'

const getAllModels = () => {
    return httpClient.get(endpoint);
}

const getModel = (id) => {
    return httpClient.get(`${endpoint}/${id}`);
}

const createModel = (modelDto) => {
    return httpClient.post(endpoint, modelDto);
}

const updateModel = (id, modelDto) => {
    return httpClient.put(`${endpoint}/${id}`, modelDto);
}

const deleteModel = (id) => {
    return httpClient.delete(`${endpoint}/${id}`);
}

const getActiveModels = () => {
    return httpClient.get(`${endpoint}/active`);
}

const getModelsByBrand = (brandId) => {
    return httpClient.get(`${endpoint}/by-brand/${brandId}`);
}

const ModelService = {
    getAllModels,
    getModel,
    createModel,
    updateModel,
    deleteModel,
    getActiveModels,
    getModelsByBrand
}

export default ModelService 