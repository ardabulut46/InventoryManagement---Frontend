import httpClient from './httpClient';

class ApprovalService {
    async getPendingApprovals() {
        const response = await httpClient.get('/api/approvals/pending');
        return response.data;
    }

    async approveRequest(id) {
        const response = await httpClient.post(`/api/approvals/${id}/approve`);
        return response.data;
    }

    async rejectRequest(id, comments) {
        const response = await httpClient.post(`/api/approvals/${id}/reject`, { comments });
        return response.data;
    }
}

export default new ApprovalService(); 