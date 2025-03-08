import httpClient from './httpClient'

const endpoint = '/api/Brand'

const getAllBrands = () => {
    return httpClient.get(endpoint);
}

const getBrand = (id) => {
    return httpClient.get(`${endpoint}/${id}`);
}

const createBrand = (brandDto) => {
    return httpClient.post(endpoint, brandDto);
}

const updateBrand = (id, brandDto) => {
    return httpClient.put(`${endpoint}/${id}`, brandDto);
}

const deleteBrand = (id) => {
    return httpClient.delete(`${endpoint}/${id}`);
}

const getActiveBrands = () => {
    return httpClient.get(`${endpoint}/active`);
}

const getBrandModels = (brandId) => {
    return httpClient.get(`${endpoint}/${brandId}/models`);
}

const BrandService = {
    getAllBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand,
    getActiveBrands,
    getBrandModels
}

export default BrandService 