import axiosClient from '@/lib/axios.js';

export async function getMyStaffProfile() {
    const response = await axiosClient.get('/staff/profile/me');
    return response.data;
}

export async function updateMyStaffProfile(payload) {
    const response = await axiosClient.patch('/staff/profile/me', payload);
    return response.data;
}

export async function changeMyStaffPassword(payload) {
    const response = await axiosClient.patch('/staff/profile/me/change-password', payload);
    return response.data;
}