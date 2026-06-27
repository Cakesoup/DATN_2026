import axiosClient from '@/lib/axios.js';

export async function getCustomerVehicles(params = {}) {
    const response = await axiosClient.get('/customer/vehicles', { params });
    return response.data;
}

export async function getCustomerVehicleById(id) {
    const response = await axiosClient.get(`/customer/vehicles/${id}`);
    return response.data;
}