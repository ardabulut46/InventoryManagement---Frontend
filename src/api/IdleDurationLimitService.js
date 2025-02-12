import httpClient from './httpClient';

const endpoint = '/api/IdleDurationLimit';

export const getIdleBreachTickets = () => {
    return httpClient.get(`${endpoint}/idle-breach-tickets`);
};

export default {
    getIdleBreachTickets
}; 