import axiosClient from '@/lib/axios.js';

export async function getStaffVehicles(params = {}) {
    const response = await axiosClient.get('/staff/vehicles', { params });
    return response.data;
}

export async function getStaffVehicleById(id) {
    const response = await axiosClient.get(`/staff/vehicles/${id}`);
    return response.data;
}

export async function createStaffVehicle(payload) {
    const response = await axiosClient.post('/staff/vehicles', payload);
    return response.data;
}

export async function updateStaffVehicle(id, payload) {
    const response = await axiosClient.put(`/staff/vehicles/${id}`, payload);
    return response.data;
}

export async function updateStaffVehicleStatus(id, payload) {
    const response = await axiosClient.patch(`/staff/vehicles/${id}/status`, payload);
    return response.data;
}

export async function deleteStaffVehicle(id) {
    const response = await axiosClient.delete(`/staff/vehicles/${id}`);
    return response.data;
}