import axiosClient from '@/lib/axios.js';

export async function createStaffInvoice(payload) {
    const response = await axiosClient.post('/staff/invoices', payload);
    return response.data;
}

export async function getStaffInvoiceById(id) {
    const response = await axiosClient.get(`/staff/invoices/${id}`);
    return response.data;
}