import httpClient from './httpClient'

const getEndpoint = (ticketId) => `/api/tickets/${ticketId}/notes`

export const getTicketNotes = (ticketId) => {
    return httpClient.get(getEndpoint(ticketId))
}

export const getTicketNoteById = (ticketId, noteId) => {
    return httpClient.get(`${getEndpoint(ticketId)}/${noteId}`)
}

export const createTicketNote = (ticketId, data, hasFiles = false) => {
    if (hasFiles) {
        // For file uploads, send as FormData
        return httpClient.post(getEndpoint(ticketId), data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
    
    // For text-only notes, send as JSON with application/json content type
    return httpClient.post(getEndpoint(ticketId), JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export const downloadNoteAttachment = (ticketId, noteId, attachmentId) => {
    return httpClient.get(
        `${getEndpoint(ticketId)}/${noteId}/attachments/${attachmentId}/download`,
        {
            responseType: 'blob'
        }
    )
}

export const deleteNoteAttachment = (ticketId, noteId, attachmentId) => {
    return httpClient.delete(
        `${getEndpoint(ticketId)}/${noteId}/attachments/${attachmentId}`
    )
} 