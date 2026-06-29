import axiosClient from '@/lib/axios.js';

export async function getPublicVehicles(params = {}) {
    const response = await axiosClient.get('/public/vehicles', { params });
    return response.data;
}

export async function getPublicVehicleById(id) {
    const response = await axiosClient.get(`/public/vehicles/${id}`, {});
    return response.data;
}