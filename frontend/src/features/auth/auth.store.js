import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken'),

    setAuth: (data) => {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.token);

        set({
            user: data.user,
            accessToken: data.token,
        });
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');

        set({
            user: null,
            accessToken: null,
        });
    },
}));