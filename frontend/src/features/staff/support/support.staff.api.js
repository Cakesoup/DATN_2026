import axiosClient from '@/lib/axios.js';

export async function getStaffTickets(params = {}) {
    const response = await axiosClient.get('/staff/support', { params });
    return response.data;
}

export async function replyStaffTicket(id, payload) {
    const response = await axiosClient.patch(`/staff/support/${id}/reply`, payload);
    return response.data;
}