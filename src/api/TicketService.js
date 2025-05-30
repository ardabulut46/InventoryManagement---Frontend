import httpClient from './httpClient'
import axios from 'axios'

const endpoint = '/api/Ticket'

export const getTickets = () => {
    return httpClient.get(endpoint)
}

export const getTicketById = async (id) => {
    try {
        console.log('Fetching ticket with ID:', id);
        const response = await httpClient.get(`${endpoint}/${id}`);
        console.log('Ticket response:', response);
        return response;
    } catch (error) {
        console.error('Error fetching ticket:', error);
        throw error;
    }
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
    return httpClient.get('/api/Ticket/my-tickets')
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

export const getMyAllTickets = () => {
    return httpClient.get(`${endpoint}/my-all-tickets`)
}

export const transferTicket = (ticketId, transferTicketDto) => {
    return httpClient.post(`${endpoint}/${ticketId}/transfer`, transferTicketDto)
}

export const getHighPriorityTickets = () => {
    return httpClient.get(`/api/Ticket/high-priority-tickets`);
}

export const getMostOpenedByGroup = () => {
    return httpClient.get(`${endpoint}/most-opened-by-group`);
};

export const getMostOpenedToGroup = () => {
    return httpClient.get(`${endpoint}/most-opened-to-group`);
};


export const getMostAssignedTicketsToUser = () => {
    return httpClient.get(`${endpoint}/most-assigned-to-user`);
};

// Add more ticket-specific operations as needed
