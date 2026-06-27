import axiosClient from '@/lib/axios.js';

export async function createBooking(payload) {
    const response = await axiosClient.post('/customer/bookings', payload);
    return response.data;
}

export async function getMyBookings(params = {}) {
    const response = await axiosClient.get('/customer/bookings', { params });
    return response.data;
}

export async function getMyBookingById(id) {
    const response = await axiosClient.get(`/customer/bookings/${id}`);
    return response.data;
}

export async function cancelBooking(id) {
    const response = await axiosClient.patch(`/customer/bookings/${id}/cancel`);
    return response.data;
}