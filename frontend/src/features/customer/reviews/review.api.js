import axiosClient from '@/lib/axios.js';

export async function getMyReviews() {
    const response = await axiosClient.get('/customer/reviews');
    return response.data;
}

export async function createReview(payload) {
    const response = await axiosClient.post('/customer/reviews', payload);
    return response.data;
}