import axiosClient from '@/lib/axios.js';

export async function login(payload) {
    const response = await axiosClient.post('/auth/login', payload);
    return response.data;
}

export async function registerApi(payload) {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
}

export async function forgotPassword(payload) {
    const response = await axiosClient.post('/auth/forgot-password', payload);
    return response.data;
}