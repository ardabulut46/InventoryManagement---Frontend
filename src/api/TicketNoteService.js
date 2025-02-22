import httpClient from './httpClient'

const getEndpoint = (ticketId) => `/api/tickets/${ticketId}/notes`

export const getTicketNotes = (ticketId) => {
    return httpClient.get(getEndpoint(ticketId))
}

export const getTicketNoteById = (ticketId, noteId) => {
    return httpClient.get(`${getEndpoint(ticketId)}/${noteId}`)
}

export const createTicketNote = (ticketId, noteData, files = []) => {
    const formData = new FormData()
    formData.append('note', noteData.note)
    formData.append('noteType', noteData.noteType)
    
    files.forEach(file => {
        formData.append('files', file)
    })

    return httpClient.post(getEndpoint(ticketId), formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const downloadNoteAttachment = (ticketId, noteId, attachmentId) => {
    return httpClient.get(`${getEndpoint(ticketId)}/${noteId}/attachments/${attachmentId}/download`, {
        responseType: 'blob'
    })
}

export const deleteNoteAttachment = (ticketId, noteId, attachmentId) => {
    return httpClient.delete(`${getEndpoint(ticketId)}/${noteId}/attachments/${attachmentId}`)
} 