import axiosClient from '@/lib/axios.js';

export async function getMyProfile() {
    const response = await axiosClient.get('/admin/profile/me');
    return response.data;
}

export async function updateMyProfile(payload) {
    const response = await axiosClient.patch('/admin/profile/me', payload);
    return response.data;
}

export async function changeMyPassword(payload) {
    const response = await axiosClient.patch('/admin/profile/me/change-password', payload);
    return response.data;
}