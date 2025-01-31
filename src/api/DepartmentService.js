import httpClient from './httpClient'

const endpoint = '/api/Department'

export const getDepartments = () => {
    return httpClient.get(endpoint)
}

export const getDepartmentById = (id) => {
    return httpClient.get(`${endpoint}/${id}`)
} 