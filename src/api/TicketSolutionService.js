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

export const uploadSolutionAttachments = (solutionId, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    return httpClient.post(`${endpoint}/${solutionId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getAttachments = (solutionId) => {
    return httpClient.get(`${endpoint}/${solutionId}/attachments`);
};

export const downloadAttachment = (attachmentId) => {
    return httpClient.get(`${endpoint}/attachments/${attachmentId}`, {
        responseType: 'blob'
    });
};

export const deleteAttachment = (attachmentId) => {
    return httpClient.delete(`${endpoint}/attachments/${attachmentId}`);
}; 