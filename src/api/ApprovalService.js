import httpClient from './httpClient';

class ApprovalService {
    async getPendingApprovals() {
        const response = await httpClient.get('/api/approvals/pending');
        return response.data;
    }

    async getAllRequests() {
        const response = await httpClient.get('/api/approvals/all-requests');
        return response.data;
    }

    async approveRequest(id, comments) {
        const payload = comments ? { comments } : {};
        const response = await httpClient.post(`/api/approvals/${id}/approve`, payload);
        return response.data;
    }

    async rejectRequest(id, comments) {
        const response = await httpClient.post(`/api/approvals/${id}/reject`, { comments });
        return response.data;
    }
}

export default new ApprovalService(); 