import httpClient from './httpClient'

const ENDPOINT = '/api/Department'

export const getDepartments = () => {
    return httpClient.get(ENDPOINT)
}

export const getDepartmentById = (id) => {
    return httpClient.get(`${ENDPOINT}/${id}`)
}

export const createDepartment = (department) => {
    return httpClient.post(ENDPOINT, department)
}

export const updateDepartment = (id, department) => {
    return httpClient.put(`${ENDPOINT}/${id}`, department)
}

export const deleteDepartment = (id) => {
    return httpClient.delete(`${ENDPOINT}/${id}`)
} 