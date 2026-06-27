import axiosClient from '@/lib/axios.js';

export async function getMyTickets(params = {}) {
    const response = await axiosClient.get('/customer/support', { params });
    return response.data;
}

export async function createTicket(payload) {
    const response = await axiosClient.post('/customer/support', payload);
    return response.data;
}