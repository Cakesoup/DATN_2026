import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCcw, CircleAlert, CalendarDays, ArrowRightCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStaffBookings, confirmBooking } from '../bookings/booking.staff.api.js';
import HandoverModal from '../bookings/components/HandoverModal.jsx';

const STATUS_OPTIONS = [
    { label: 'Chờ xác nhận', value: 'pending' },
    { label: 'Đã xác nhận', value: 'confirmed' },
    { label: 'Tất cả (chờ bàn giao)', value: 'all' },
];

const PAGE_SIZE = 10;

function getStatusLabel(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'pending') return 'Chờ xác nhận';
    if (v === 'confirmed') return 'Đã xác nhận';
    if (v === 'handover_pending') return 'Chờ bàn giao';
    return s || 'Không rõ';
}
function getStatusBadge(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'pending') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    if (v === 'confirmed') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    if (v === 'handover_pending') return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}
function formatDateTime(value) {
    if (!value) return '---';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '---' : d.toLocaleString('vi-VN');
}

export default function StaffHandoverPage() {
    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [handoverBooking, setHandoverBooking] = useState(null);

    // 'all' ở trang này = đơn chờ bàn giao (pending + confirmed + handover_pending)
    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        booking_status: statusFilter === 'all' ? undefined : statusFilter,
        stage: 'handover', // backend lọc nhóm chờ bàn giao
        keyword: keyword || undefined,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['staff', 'handover', queryParams],
        queryFn: () => getStaffBookings(queryParams),
        placeholderData: keepPreviousData,
    });

    const confirmMutation = useMutation({
        mutationFn: (id) => confirmBooking(id),
        onSuccess: () => {
            toast.success('Đã xác nhận đơn');
            queryClient.invalidateQueries({ queryKey: ['staff', 'handover'] });
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Xác nhận thất bại'),
    });

    const bookings = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: bookings.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được danh sách' : '';

    const handleSearch = (e) => { e.preventDefault(); setCurrentPage(1); setKeyword(searchInput.trim()); };
    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    const renderActions = (b) => {
        const status = String(b.booking_status || '').toLowerCase();
        if (status === 'pending') {
            return (
                <button onClick={() => confirmMutation.mutate(b.id)} disabled={confirmMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Xác nhận đơn
                </button>
            );
        }
        if (['confirmed', 'handover_pending'].includes(status)) {
            return (
                <button onClick={() => setHandoverBooking(b)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800">
                    <ArrowRightCircle className="h-3.5 w-3.5" /> Bàn giao xe
                </button>
            );
        }
        return <span className="text-xs text-slate-400">—</span>;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Bàn giao xe</h1>
                        <p className="mt-1 text-sm text-slate-500">Xác nhận đơn và bàn giao xe cho khách.</p>
                    </div>
                    <button onClick={() => refetch()} disabled={isFetching}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                        <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Làm mới
                    </button>
                </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                               placeholder="Tìm mã booking, khách hàng, xe..."
                               className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-300" />
                    </div>
                    <select value={statusFilter} onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value); }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300">
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button type="submit" className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">Tìm kiếm</button>
                </form>

                {isLoading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Đang tải danh sách...</div>
                ) : errorMessage ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div>{errorMessage}</div></div>
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
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {bookings.length > 0 ? bookings.map((b) => (
                                    <tr key={b.id} className="align-top text-sm text-slate-700">
                                        <td className="px-4 py-4 font-semibold text-slate-900">{b.booking_code}</td>
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900">{b.users?.full_name || '---'}</div>
                                            <div className="text-xs text-slate-500">{b.users?.phone || '---'}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900">{b.vehicles?.name || '---'}</div>
                                            <div className="text-xs text-slate-500">{b.vehicles?.vehicle_code || '---'}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-start gap-2">
                                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                <div className="space-y-1 text-xs text-slate-500">
                                                    <div>Nhận: <span className="text-slate-700">{formatDateTime(b.start_at)}</span></div>
                                                    <div>Trả: <span className="text-slate-700">{formatDateTime(b.end_at)}</span></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(b.booking_status)}`}>{getStatusLabel(b.booking_status)}</span>
                                        </td>
                                        <td className="px-4 py-4"><div className="flex justify-end">{renderActions(b)}</div></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Không có đơn phù hợp.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>Trang {page} / {totalPages} — Tổng {pagination.total || 0} đơn</div>
                            <div className="flex items-center gap-2">
                                <button disabled={page <= 1 || isFetching} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Trước</button>
                                <span className="rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700">{page}</span>
                                <button disabled={page >= totalPages || isFetching} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Sau</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <HandoverModal open={Boolean(handoverBooking)} booking={handoverBooking} onClose={() => setHandoverBooking(null)} />
        </div>
    );
}