import axiosClient from '@/lib/axios.js';

export async function getPendingHandoverBookings(params = {}) {
    const response = await axiosClient.get('/staff/bookings/pending-handover', { params });
    return response.data;
}

export async function confirmHandover(id, payload) {
    const response = await axiosClient.patch(`/staff/bookings/${id}/confirm-handover`, payload);
    return response.data;
}

export async function confirmReturn(id, payload) {
    const response = await axiosClient.patch(`/staff/bookings/${id}/confirm-return`, payload);
    return response.data;
}