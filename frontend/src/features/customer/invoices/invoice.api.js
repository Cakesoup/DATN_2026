import axiosClient from '@/lib/axios.js';

export async function getMyInvoices(params = {}) {
    const response = await axiosClient.get('/customer/invoices', { params });
    return response.data;
}

export async function getMyInvoiceById(id) {
    const response = await axiosClient.get(`/customer/invoices/${id}`);
    return response.data;
}