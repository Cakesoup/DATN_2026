import axiosClient from '@/lib/axios.js';

export async function getAdminPricingPlans(params = {}) {
    const response = await axiosClient.get('/admin/pricing', { params });
    return response.data;
}

export async function getAdminPricingPlanById(id) {
    const response = await axiosClient.get(`/admin/pricing/${id}`);
    return response.data;
}

export async function createAdminPricingPlan(payload) {
    const response = await axiosClient.post('/admin/pricing', payload);
    return response.data;
}

export async function updateAdminPricingPlan(id, payload) {
    const response = await axiosClient.patch(`/admin/pricing/${id}`, payload);
    return response.data;
}

export async function deleteAdminPricingPlan(id) {
    const response = await axiosClient.delete(`/admin/pricing/${id}`);
    return response.data;
}