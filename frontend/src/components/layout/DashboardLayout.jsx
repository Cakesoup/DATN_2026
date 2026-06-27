import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    CarFront,
    CalendarDays,
    BadgeDollarSign,
    Users,
    BarChart3,
    UserCircle2,
    LogOut,
    LayoutGrid,
    MessageSquare,
    Receipt,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth.store.js';

const adminMenus = [
    { to: '/admin/vehicles', label: 'Quản lý xe', icon: CarFront },
    { to: '/admin/bookings', label: 'Đơn đặt xe', icon: CalendarDays },
    { to: '/admin/pricing', label: 'Bảng giá', icon: BadgeDollarSign },
    { to: '/admin/users', label: 'Người dùng', icon: Users },
    { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
    { to: '/admin/profile', label: 'Hồ sơ', icon: UserCircle2 },
];

const staffMenus = [
    { to: '/staff/vehicles', label: 'Quản lý xe', icon: CarFront },
    { to: '/staff/bookings', label: 'Bàn giao & trả xe', icon: CalendarDays },
    { to: '/staff/profile', label: 'Hồ sơ', icon: UserCircle2 },
    { to: '/staff/support', label: 'Phản hồi thắc mắc', icon: MessageSquare },
];

const customerMenus = [
    { to: '/customer/vehicles', label: 'Thuê xe', icon: CarFront },
    { to: '/customer/bookings', label: 'Chuyến của tôi', icon: CalendarDays },
    { to: '/customer/invoices', label: 'Hóa đơn', icon: Receipt },
    { to: '/customer/pricing', label: 'Bảng giá', icon: BadgeDollarSign },
    { to: '/customer/support', label: 'Hỗ trợ', icon: MessageSquare },
    { to: '/customer/profile', label: 'Hồ sơ', icon: UserCircle2 },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menus = user?.role === 'admin' ? adminMenus
          : user?.role === 'staff'
          ? staffMenus
            : user?.role === 'customer'
                ? customerMenus
                : [];

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-900 p-2 text-white">
                            <LayoutGrid size={18} />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-slate-900">Smart Brain</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700 md:block">
                            {user?.full_name} ({user?.role})
                        </div>

                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                            <LogOut size={16} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 p-6">
                <aside className="col-span-12 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3">
                    <div className="mb-4 border-b border-slate-100 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Điều hướng
                        </p>
                        <h2 className="mt-2 text-lg font-semibold text-slate-900">
                            Quản trị hệ thống
                        </h2>
                    </div>

                    <nav className="space-y-2">
                        {menus.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-slate-900 text-white shadow-sm'
                                                : 'text-slate-700 hover:bg-slate-100'
                                        }`
                                    }
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </aside>

                <main className="col-span-12 lg:col-span-9">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}