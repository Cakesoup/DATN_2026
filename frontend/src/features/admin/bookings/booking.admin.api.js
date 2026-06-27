import axiosClient from '@/lib/axios.js';

export async function getAdminBookings(params = {}) {
    const response = await axiosClient.get('/admin/bookings', { params });
    return response.data;
}

export async function getAdminBookingById(id) {
    const response = await axiosClient.get(`/admin/bookings/${id}`);
    return response.data;
}

export async function updateAdminBookingStatus(id, payload) {
    const response = await axiosClient.patch(`/admin/bookings/${id}/status`, payload);
    return response.data;
}