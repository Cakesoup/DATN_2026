import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store.js';

export default function RoleRoute({ allowedRoles = [] }) {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}