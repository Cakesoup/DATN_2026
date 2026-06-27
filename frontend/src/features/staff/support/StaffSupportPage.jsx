import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search, RefreshCcw, CircleAlert, MessageSquare, MessageSquareReply } from 'lucide-react';
import { getStaffTickets } from './support.staff.api.js';
import ReplyTicketModal from './components/ReplyTicketModal.jsx';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ trả lời', value: 'open' },
    { label: 'Đã trả lời', value: 'answered' },
    { label: 'Đã đóng', value: 'closed' },
];

const PAGE_SIZE = 10;

function getStatusLabel(status) {
    const v = String(status || '').toLowerCase();
    if (v === 'open') return 'Chờ trả lời';
    if (v === 'answered') return 'Đã trả lời';
    if (v === 'closed') return 'Đã đóng';
    return status || '---';
}

function getStatusBadge(status) {
    const v = String(status || '').toLowerCase();
    if (v === 'open') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    if (v === 'answered') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    if (v === 'closed') return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function formatDateTime(value) {
    if (!value) return '---';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '---';
    return d.toLocaleString('vi-VN');
}

export default function StaffSupportPage() {
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        status: statusFilter === 'all' ? undefined : statusFilter,
        keyword: keyword || undefined,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['staff', 'support', queryParams],
        queryFn: () => getStaffTickets(queryParams),
        placeholderData: keepPreviousData,
    });

    const tickets = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: tickets.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được danh sách thắc mắc' : '';

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setKeyword(searchInput.trim());
    };

    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Phản hồi thắc mắc</h1>
                        <p className="mt-1 text-sm text-slate-500">Tiếp nhận và trả lời thắc mắc của khách hàng.</p>
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
                               placeholder="Tìm theo tiêu đề, nội dung, khách hàng..."
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
                                    <th className="px-4 py-3">Thắc mắc</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Booking</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Gửi lúc</th>
                                    <th className="px-4 py-3 text-right">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {tickets.length > 0 ? tickets.map((t) => (
                                    <tr key={t.id} className="align-top text-sm text-slate-700">
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-900">{t.subject}</div>
                                            <div className="mt-1 line-clamp-2 max-w-xs text-xs text-slate-500">{t.content}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900">{t.user?.full_name || '---'}</div>
                                            <div className="text-xs text-slate-500">{t.user?.phone || '---'}</div>
                                        </td>
                                        <td className="px-4 py-4 text-xs">{t.bookings?.booking_code || '—'}</td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(t.status)}`}>{getStatusLabel(t.status)}</span>
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-500">{formatDateTime(t.created_at)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end">
                                                <button onClick={() => { setSelectedTicket(t); setOpenModal(true); }}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                                                    <MessageSquareReply className="h-3.5 w-3.5" />
                                                    {t.status === 'open' ? 'Trả lời' : 'Xem / sửa'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                                        <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                                        Chưa có thắc mắc nào.
                                    </td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>Trang {page} / {totalPages} — Tổng {pagination.total || 0} thắc mắc</div>
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

            <ReplyTicketModal open={openModal} ticket={selectedTicket} onClose={() => { setOpenModal(false); setSelectedTicket(null); }} />
        </div>
    );
}