import httpClient from './httpClient'

const endpoint = '/api/Ticket'

export const getTickets = () => {
    return httpClient.get(endpoint)
}

export const getTicketById = (id) => {
    return httpClient.get(`${endpoint}/${id}`)
}

export const createTicket = (createTicketDto) => {
    return httpClient.post(endpoint, createTicketDto)
}

export const updateTicket = (id, updateTicketDto) => {
    return httpClient.put(`${endpoint}/${id}`, updateTicketDto)
}

export const deleteTicket = (id) => {
    return httpClient.delete(`${endpoint}/${id}`)
}

export const getMyTickets = () => {
    return httpClient.get(`${endpoint}/my-tickets`)
}

export const getDepartmentTickets = () => {
    return httpClient.get(`${endpoint}/department-tickets`)
}

export const getAssignedToMeTickets = () => {
    return httpClient.get(`${endpoint}/my-tickets`)
}

export const assignTicket = (ticketId) => {
    return httpClient.post(`${endpoint}/${ticketId}/assign`)
}

export const updateTicketPriority = (ticketId, priority) => {
    return httpClient.put(`${endpoint}/${ticketId}/priority`, priority, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

// Add more ticket-specific operations as needed
