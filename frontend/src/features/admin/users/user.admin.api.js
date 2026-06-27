import axiosClient from '@/lib/axios.js';

export async function getAdminUsers(params = {}) {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
}

export async function getAdminUserById(id) {
    const response = await axiosClient.get(`/admin/users/${id}`);
    return response.data;
}

export async function createAdminUser(payload) {
    const response = await axiosClient.post('/admin/users', payload);
    return response.data;
}

export async function updateAdminUser(id, payload) {
    const response = await axiosClient.patch(`/admin/users/${id}`, payload);
    return response.data;
}

export async function updateAdminUserStatus(id, payload) {
    const response = await axiosClient.patch(`/admin/users/${id}/status`, payload);
    return response.data;
}

export async function deleteAdminUser(id) {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
}