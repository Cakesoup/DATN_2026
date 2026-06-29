import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/components/layout/AuthLayout.jsx';
import DashboardLayout from '@/components/layout/DashboardLayout.jsx';
import AdminVehiclesPage from '@/features/admin/vehicles/AdminVehiclesPage.jsx';
import ProtectedRoute from '@/routes/ProtectedRoute.jsx';
import RoleRoute from '@/routes/RoleRoute.jsx';
import LoginPage from '@/features/auth/LoginPage.jsx';
import RegisterPage from '@/features/auth/RegisterPage.jsx';
import AdminUsersPage from '@/features/admin/users/AdminUsersPage.jsx';
import AdminPricingPage from '@/features/admin/pricing/AdminPricingPage.jsx';
import AdminReportsPage from '@/features/admin/reports/AdminReportsPage.jsx';
import AdminProfilePage from '@/features/admin/profile/AdminProfilePage.jsx';
import StaffVehiclesPage from '@/features/staff/vehicles/StaffVehiclesPage.jsx';
import StaffHandoverPage from '@/features/staff/handover/StaffHandoverPage.jsx';
import StaffReturnsPage from '@/features/staff/returns/StaffReturnsPage.jsx';
import StaffProfilePage from '@/features/staff/profile/StaffProfilePage.jsx';
import StaffSupportPage from '@/features/staff/support/StaffSupportPage.jsx';
import CustomerVehiclesPage from '@/features/customer/vehicles/CustomerVehiclesPage.jsx';
import CustomerBookingsPage from '@/features/customer/bookings/CustomerBookingsPage.jsx';
import CustomerInvoicesPage from '@/features/customer/invoices/CustomerInvoicesPage.jsx';
import CustomerPricingPage from '@/features/customer/pricing/CustomerPricingPage.jsx';
import CustomerProfilePage from '@/features/customer/profile/CustomerProfilePage.jsx';
import CustomerSupportPage from '@/features/customer/support/CustomerSupportPage.jsx';
import HomePage from '@/features/home/HomePage.jsx';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage.jsx';
import VehicleDetailPage from '@/features/customer/vehicles/VehicleDetailPage.jsx';
import PublicVehiclesPage from '@/features/public/PublicVehiclesPage.jsx';
import PublicVehicleDetailPage from '@/features/public/PublicVehicleDetailPage.jsx';

function UnauthorizedPage() {
    return <div className="p-6 text-red-600">Bạn không có quyền truy cập.</div>;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/vehicles',
        element: <PublicVehiclesPage />,
    },
    {
        path: '/vehicles/:id',
        element: <PublicVehicleDetailPage />,
    },
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
    },
    {
        path: '/unauthorized',
        element: <UnauthorizedPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        element: <RoleRoute allowedRoles={['customer']} />,
                        children: [
                            { path: '/customer/vehicles', element: <CustomerVehiclesPage /> },
                            { path: '/customer/vehicles/:id', element: <VehicleDetailPage /> },
                            { path: '/customer/bookings', element: <CustomerBookingsPage /> },
                            { path: '/customer/invoices', element: <CustomerInvoicesPage /> },
                            { path: '/customer/pricing', element: <CustomerPricingPage /> },
                            { path: '/customer/support', element: <CustomerSupportPage /> },
                            { path: '/customer/profile', element: <CustomerProfilePage /> },
                        ],
                    },
                    {
                        element: <RoleRoute allowedRoles={['staff']} />,
                        children: [
                            { path: '/staff/vehicles', element: <StaffVehiclesPage /> },
                            { path: '/staff/handover', element: <StaffHandoverPage /> },
                            { path: '/staff/returns', element: <StaffReturnsPage /> },
                            { path: '/staff/profile', element: <StaffProfilePage /> },
                            { path: '/staff/support', element: <StaffSupportPage /> },
                        ],
                    },
                    {
                        element: <RoleRoute allowedRoles={['admin']} />,
                        children: [
                            { path: '/admin/vehicles', element: <AdminVehiclesPage /> },
                            { path: '/admin/pricing', element: <AdminPricingPage /> },
                            { path: '/admin/users', element: <AdminUsersPage /> },
                            { path: '/admin/reports', element: <AdminReportsPage /> },
                            { path: '/admin/profile', element: <AdminProfilePage /> },
                        ],
                    },
                ],
            },
        ],
    },
]);