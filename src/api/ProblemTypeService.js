import httpClient from './httpClient'

const endpoint = '/api/ProblemTypes'

export const getProblemTypes = () => {
    return httpClient.get(endpoint)
}

export const getProblemTypeById = (id) => {
    return httpClient.get(`${endpoint}/${id}`)
}

export const createProblemType = (createProblemTypeDto) => {
    return httpClient.post(endpoint, createProblemTypeDto)
}

export const updateProblemType = (id, updateProblemTypeDto) => {
    return httpClient.put(`${endpoint}/${id}`, updateProblemTypeDto)
}

export const deleteProblemType = (id) => {
    return httpClient.delete(`${endpoint}/${id}`)
}

export const getProblemTypesByDepartment = (departmentId) => {
    return httpClient.get(`${endpoint}/department/${departmentId}`)
} 