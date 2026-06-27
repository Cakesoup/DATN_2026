import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { RefreshCcw, CircleAlert, MessageSquare, Plus } from 'lucide-react';
import { getMyTickets } from './support.api.js';
import CreateTicketModal from './components/CreateTicketModal.jsx';

const PAGE_SIZE = 8;

function getStatusLabel(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'open') return 'Chờ trả lời';
    if (v === 'answered') return 'Đã trả lời';
    if (v === 'closed') return 'Đã đóng';
    return s || '---';
}
function getStatusBadge(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'open') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    if (v === 'answered') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}
function formatDateTime(v) {
    if (!v) return '---';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '---';
    return d.toLocaleString('vi-VN');
}

export default function CustomerSupportPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [openCreate, setOpenCreate] = useState(false);

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['customer', 'support', { page: currentPage }],
        queryFn: () => getMyTickets({ page: currentPage, limit: PAGE_SIZE }),
        placeholderData: keepPreviousData,
    });

    const tickets = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: tickets.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được thắc mắc' : '';

    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Hỗ trợ & thắc mắc</h1>
                        <p className="mt-1 text-sm text-slate-500">Gửi câu hỏi và xem phản hồi từ nhân viên.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => refetch()} disabled={isFetching}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Làm mới
                        </button>
                        <button onClick={() => setOpenCreate(true)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                            <Plus className="h-4 w-4" /> Gửi thắc mắc
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Đang tải...</div>
            ) : errorMessage ? (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div>{errorMessage}</div></div>
            ) : tickets.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" /> Bạn chưa gửi thắc mắc nào.
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {tickets.map((t) => (
                            <div key={t.id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{t.subject}</span>
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(t.status)}`}>{getStatusLabel(t.status)}</span>
                                        </div>
                                        {t.bookings ? <div className="text-xs text-slate-500">Chuyến: {t.bookings.booking_code}</div> : null}
                                        <div className="text-xs text-slate-400">{formatDateTime(t.created_at)}</div>
                                    </div>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{t.content}</p>

                                {t.reply ? (
                                    <div className="mt-3 rounded-2xl bg-slate-50 p-4">
                                        <div className="mb-1 text-xs font-semibold text-slate-500">
                                            Phản hồi từ {t.staff_user?.full_name || 'nhân viên'}
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm text-slate-700">{t.reply}</p>
                                    </div>
                                ) : (
                                    <div className="mt-3 text-xs italic text-slate-400">Đang chờ nhân viên phản hồi...</div>
                                )}
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

            <CreateTicketModal open={openCreate} onClose={() => setOpenCreate(false)} />
        </div>
    );
}