import httpClient from './httpClient'

const endpoint = '/api/TicketSolutions'

export const getTicketSolutions = () => {
    return httpClient.get(endpoint)
}

export const getTicketSolutionById = (id) => {
    return httpClient.get(`${endpoint}/${id}`)
}

export const getSolutionsByTicket = (ticketId) => {
    return httpClient.get(`${endpoint}/by-ticket/${ticketId}`)
}

export const getSolutionsByAssignedUser = () => {
    return httpClient.get(`${endpoint}/by-assigned-user`)
}

export const createTicketSolution = (createSolutionDto) => {
    return httpClient.post(endpoint, createSolutionDto)
}

export const updateTicketSolution = (id, updateSolutionDto) => {
    return httpClient.put(`${endpoint}/${id}`, updateSolutionDto)
}

export const deleteTicketSolution = (id) => {
    return httpClient.delete(`${endpoint}/${id}`)
} 