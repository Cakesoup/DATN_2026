import axiosClient from '@/lib/axios.js';

export async function getAdminVehicles() {
    const response = await axiosClient.get('/admin/vehicles');
    return response.data;
}

export async function createAdminVehicle(payload) {
    const response = await axiosClient.post('/admin/vehicles', payload);
    return response.data;
}

export async function updateAdminVehicle(id, payload) {
    const response = await axiosClient.put(`/admin/vehicles/${id}`, payload);
    return response.data;
}

export async function deleteAdminVehicle(id) {
    const response = await axiosClient.delete(`/admin/vehicles/${id}`);
    return response.data;
}