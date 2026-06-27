import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
    Search,
    RefreshCcw,
    CalendarDays,
    CircleAlert,
    ArrowRightLeft,
    Receipt,
    Star,
} from 'lucide-react';
import { getAdminBookings } from './booking.admin.api.js';
import UpdateBookingStatusModal from './components/UpdateBookingStatusModal.jsx';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xác nhận', value: 'pending' },
    { label: 'Đã xác nhận', value: 'confirmed' },
    { label: 'Chờ bàn giao', value: 'handover_pending' },
    { label: 'Đang thuê', value: 'in_progress' },
    { label: 'Hoàn tất', value: 'completed' },
    { label: 'Đã xuất hóa đơn', value: 'invoiced' },
    { label: 'Đã hủy', value: 'cancelled' },
];

const PAGE_SIZE = 10;

function getStatusLabel(status) {
    const value = String(status || '').toLowerCase();

    if (value === 'pending') return 'Chờ xác nhận';
    if (value === 'confirmed') return 'Đã xác nhận';
    if (value === 'handover_pending') return 'Chờ bàn giao';
    if (value === 'in_progress') return 'Đang thuê';
    if (value === 'completed') return 'Hoàn tất';
    if (value === 'invoiced') return 'Đã xuất hóa đơn';
    if (value === 'cancelled') return 'Đã hủy';

    return status || 'Không rõ';
}

function getStatusBadge(status) {
    const value = String(status || '').toLowerCase();

    if (value === 'pending') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    if (value === 'confirmed') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    if (value === 'handover_pending') return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    if (value === 'in_progress') return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
    if (value === 'completed') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    if (value === 'invoiced') return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200';
    if (value === 'cancelled') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';

    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function getPaymentStatusLabel(status) {
    const value = String(status || '').toLowerCase();

    if (value === 'paid') return 'Đã thanh toán';
    if (value === 'partially_paid') return 'Thanh toán một phần';
    if (value === 'unpaid') return 'Chưa thanh toán';

    return status || 'Chưa có';
}

function getPaymentStatusBadge(status) {
    const value = String(status || '').toLowerCase();

    if (value === 'paid') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    if (value === 'partially_paid') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    if (value === 'unpaid') return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';

    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

function formatDateTime(value) {
    if (!value) return '---';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '---';

    return date.toLocaleString('vi-VN');
}

export default function AdminBookingsPage() {
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [openStatusModal, setOpenStatusModal] = useState(false);

    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        booking_status: statusFilter === 'all' ? undefined : statusFilter,
        keyword: keyword || undefined,
    };

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['admin', 'bookings', queryParams],
        queryFn: () => getAdminBookings(queryParams),
        placeholderData: keepPreviousData,
    });

    const bookings = data?.data || [];
    const pagination = data?.pagination || {
        page: currentPage,
        limit: PAGE_SIZE,
        total: bookings.length,
        totalPages: 1,
    };

    const errorMessage = isError
        ? error?.response?.data?.message || 'Không tải được danh sách booking'
        : '';

    const stats = useMemo(() => {
        const countBy = (status) =>
            bookings.filter(
                (item) => String(item.booking_status || '').toLowerCase() === status
            ).length;

        return {
            total: pagination.total || 0,
            pending: countBy('pending'),
            inProgress: countBy('in_progress'),
            completed: countBy('completed'),
        };
    }, [bookings, pagination.total]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setKeyword(searchInput.trim());
    };

    const handleStatusChange = (value) => {
        setCurrentPage(1);
        setStatusFilter(value);
    };

    const handleOpenStatusModal = (booking) => {
        setSelectedBooking(booking);
        setOpenStatusModal(true);
    };

    const handleCloseModal = () => {
        setOpenStatusModal(false);
        setSelectedBooking(null);
    };

    const invoicePaymentStatus = (booking) => booking?.invoices?.payment_status || '';
    const hasReview = (booking) => Boolean(booking?.reviews);

    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý đơn đặt xe</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Theo dõi đơn đặt xe, trạng thái thuê và hóa đơn liên quan.
                        </p>
                    </div>

                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">Tổng đơn đặt xe</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>

                <div className="rounded-3xl bg-amber-50 p-5 shadow-sm ring-1 ring-amber-100">
                    <p className="text-sm text-amber-700">Chờ xác nhận</p>
                    <p className="mt-2 text-3xl font-bold text-amber-700">{stats.pending}</p>
                </div>

                <div className="rounded-3xl bg-sky-50 p-5 shadow-sm ring-1 ring-sky-100">
                    <p className="text-sm text-sky-700">Đang thuê</p>
                    <p className="mt-2 text-3xl font-bold text-sky-700">{stats.inProgress}</p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
                    <p className="text-sm text-emerald-700">Hoàn tất</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.completed}</p>
                </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Danh sách đặt xe</h2>
                        <p className="text-sm text-slate-500">
                            Tìm theo mã booking, khách hàng, tên xe hoặc mã xe.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Tìm booking..."
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-300 md:w-80"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                            Tìm kiếm
                        </button>
                    </form>
                </div>

                {isLoading ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        Đang tải danh sách booking...
                    </div>
                ) : errorMessage ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
                        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>{errorMessage}</div>
                    </div>
                ) : (
                    <>
                        <div className="mt-5 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                <tr className="text-left text-sm font-semibold text-slate-600">
                                    <th className="px-4 py-3">Mã booking</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Xe</th>
                                    <th className="px-4 py-3">Thời gian</th>
                                    <th className="px-4 py-3">Địa điểm</th>
                                    <th className="px-4 py-3">Thanh toán</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Hành động</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {bookings.length > 0 ? (
                                    bookings.map((booking) => (
                                        <tr key={booking.id} className="align-top text-sm text-slate-700">
                                            <td className="px-4 py-4">
                                                <div className="font-semibold text-slate-900">
                                                    {booking.booking_code}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500">
                                                    Tạo lúc {formatDateTime(booking.created_at)}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="font-medium text-slate-900">
                                                    {booking.users?.full_name || '---'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {booking.users?.phone || '---'}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {booking.users?.email || '---'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="font-medium text-slate-900">
                                                    {booking.vehicles?.name || '---'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {booking.vehicles?.vehicle_code || '---'}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {booking.vehicles?.brand || '---'}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-start gap-2">
                                                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-slate-500">
                                                            Nhận xe:{' '}
                                                            <span className="text-slate-700">
                                                                {formatDateTime(booking.start_at)}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            Trả xe:{' '}
                                                            <span className="text-slate-700">
                                                                {formatDateTime(booking.end_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="space-y-1 text-xs">
                                                    <div>
                                                        <span className="text-slate-500">Nhận:</span>{' '}
                                                        <span className="text-slate-700">
                                                            {booking.pickup_location || '---'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500">Trả:</span>{' '}
                                                        <span className="text-slate-700">
                                                            {booking.return_location || '---'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="space-y-2">
                                                    <div className="text-xs text-slate-500">
                                                        Tổng tiền:{' '}
                                                        <span className="font-medium text-slate-900">
                                                            {formatMoney(booking.total_amount)} VNĐ
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Cọc:{' '}
                                                        <span className="font-medium text-slate-900">
                                                            {formatMoney(booking.deposit_amount)} VNĐ
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusBadge(
                                                                invoicePaymentStatus(booking)
                                                            )}`}
                                                        >
                                                            {getPaymentStatusLabel(invoicePaymentStatus(booking))}
                                                        </span>

                                                        {booking.invoices ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                                                                <Receipt className="h-3.5 w-3.5" />
                                                                Có hóa đơn
                                                            </span>
                                                        ) : null}

                                                        {hasReview(booking) ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                                                <Star className="h-3.5 w-3.5" />
                                                                Có đánh giá
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                                                        booking.booking_status
                                                    )}`}
                                                >
                                                    {getStatusLabel(booking.booking_status)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenStatusModal(booking)}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        <ArrowRightLeft className="h-4 w-4" />
                                                        Cập nhật trạng thái
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">
                                            Không có booking phù hợp.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>
                                Trang {page} / {totalPages} — Tổng {pagination.total || 0} booking
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1 || isFetching}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Trước
                                </button>

                                <span className="rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700">
                                    {page}
                                </span>

                                <button
                                    disabled={page >= totalPages || isFetching}
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                    }
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <UpdateBookingStatusModal
                open={openStatusModal}
                booking={selectedBooking}
                onClose={handleCloseModal}
            />
        </div>
    );
}