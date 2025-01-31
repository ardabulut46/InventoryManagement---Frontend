import httpClient from './httpClient'

const endpoint = '/api/Company'

export const getCompanies = () => {
    return httpClient.get(endpoint)
}

export const getCompanyById = (id) => {
    return httpClient.get(`${endpoint}/${id}`)
}

export const createCompany = (createCompanyDto) => {
    return httpClient.post(endpoint, createCompanyDto)
}

export const updateCompany = (id, updateCompanyDto) => {
    return httpClient.put(`${endpoint}/${id}`, updateCompanyDto)
}

export const deleteCompany = (id) => {
    return httpClient.delete(`${endpoint}/${id}`)
}
