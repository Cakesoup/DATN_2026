import axiosClient from '@/lib/axios.js';

export async function getActivePricingPlans(params = {}) {
    const response = await axiosClient.get('/customer/pricing', { params });
    return response.data;
}