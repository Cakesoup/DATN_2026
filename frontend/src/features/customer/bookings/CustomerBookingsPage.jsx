import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCcw, CircleAlert, CalendarDays, XCircle, Star, CarFront } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from './booking.api.js';
import ReviewModal from './components/ReviewModal.jsx';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xác nhận', value: 'pending' },
    { label: 'Đã xác nhận', value: 'confirmed' },
    { label: 'Đang thuê', value: 'in_progress' },
    { label: 'Hoàn tất', value: 'completed' },
    { label: 'Đã xuất hóa đơn', value: 'invoiced' },
    { label: 'Đã hủy', value: 'cancelled' },
];

const PAGE_SIZE = 8;

function getStatusLabel(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'pending') return 'Chờ xác nhận';
    if (v === 'confirmed') return 'Đã xác nhận';
    if (v === 'handover_pending') return 'Chờ bàn giao';
    if (v === 'in_progress') return 'Đang thuê';
    if (v === 'completed') return 'Hoàn tất';
    if (v === 'invoiced') return 'Đã xuất hóa đơn';
    if (v === 'cancelled') return 'Đã hủy';
    return s || '---';
}

function getStatusBadge(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'pending') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    if (v === 'confirmed') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    if (v === 'handover_pending') return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    if (v === 'in_progress') return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
    if (v === 'completed') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    if (v === 'invoiced') return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200';
    if (v === 'cancelled') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function formatMoney(v) { return Number(v || 0).toLocaleString('vi-VN'); }
function formatDateTime(v) {
    if (!v) return '---';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '---';
    return d.toLocaleString('vi-VN');
}

export default function CustomerBookingsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [reviewBooking, setReviewBooking] = useState(null);

    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        booking_status: statusFilter === 'all' ? undefined : statusFilter,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['customer', 'bookings', queryParams],
        queryFn: () => getMyBookings(queryParams),
        placeholderData: keepPreviousData,
    });

    const bookings = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: bookings.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được lịch sử thuê' : '';

    const cancelMutation = useMutation({
        mutationFn: (id) => cancelBooking(id),
        onSuccess: () => {
            toast.success('Hủy đơn thành công');
            queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] });
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Hủy đơn thất bại'),
    });

    const handleCancel = (b) => {
        if (window.confirm(`Hủy đơn ${b.booking_code}?`)) cancelMutation.mutate(b.id);
    };

    const canCancel = (s) => ['pending', 'confirmed', 'handover_pending'].includes(String(s || '').toLowerCase());
    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Chuyến của tôi</h1>
                        <p className="mt-1 text-sm text-slate-500">Lịch sử thuê xe, hủy đơn và đánh giá.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select value={statusFilter} onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value); }}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300">
                            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button onClick={() => refetch()} disabled={isFetching}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Đang tải...</div>
            ) : errorMessage ? (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div>{errorMessage}</div></div>
            ) : bookings.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Bạn chưa có chuyến thuê nào.</div>
            ) : (
                <>
                    <div className="space-y-4">
                        {bookings.map((b) => (
                            <div key={b.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        {b.vehicles?.image_url ? (
                                            <img src={b.vehicles.image_url} alt={b.vehicles?.name} className="h-20 w-28 rounded-2xl object-cover ring-1 ring-slate-200" />
                                        ) : (
                                            <div className="flex h-20 w-28 items-center justify-center rounded-2xl bg-slate-100 text-slate-300"><CarFront className="h-8 w-8" /></div>
                                        )}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-900">{b.vehicles?.name || '---'}</span>
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(b.booking_status)}`}>{getStatusLabel(b.booking_status)}</span>
                                            </div>
                                            <div className="text-xs text-slate-500">{b.booking_code}</div>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <CalendarDays className="h-3.5 w-3.5" /> {formatDateTime(b.start_at)} → {formatDateTime(b.end_at)}
                                            </div>
                                            <div className="text-sm font-semibold text-slate-900">{formatMoney(b.total_amount)} đ</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {canCancel(b.booking_status) ? (
                                            <button onClick={() => handleCancel(b)} disabled={cancelMutation.isPending}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">
                                                <XCircle className="h-3.5 w-3.5" /> Hủy đơn
                                            </button>
                                        ) : null}
                                        {b.can_review ? (
                                            <button onClick={() => setReviewBooking(b)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800">
                                                <Star className="h-3.5 w-3.5" /> Đánh giá
                                            </button>
                                        ) : null}
                                        {b.reviews ? (
                                            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                                                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Đã đánh giá
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <button disabled={page <= 1 || isFetching} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Trước</button>
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{page} / {totalPages}</span>
                        <button disabled={page >= totalPages || isFetching} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Sau</button>
                    </div>
                </>
            )}

            <ReviewModal open={Boolean(reviewBooking)} booking={reviewBooking} onClose={() => setReviewBooking(null)} />
        </div>
    );
}