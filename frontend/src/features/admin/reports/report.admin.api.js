import axiosClient from '@/lib/axios.js';

export async function getOverviewReport() {
    const response = await axiosClient.get('/admin/reports/overview');
    return response.data;
}

export async function getRevenueReport(params = {}) {
    const response = await axiosClient.get('/admin/reports/revenue', { params });
    return response.data;
}