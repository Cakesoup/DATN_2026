import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search, RefreshCcw, CircleAlert, Receipt } from 'lucide-react';
import { getMyInvoices } from './invoice.api.js';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đã thanh toán', value: 'paid' },
    { label: 'Chưa thanh toán', value: 'unpaid' },
    { label: 'Một phần', value: 'partially_paid' },
];

const PAGE_SIZE = 10;

function getPayLabel(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'paid') return 'Đã thanh toán';
    if (v === 'unpaid') return 'Chưa thanh toán';
    if (v === 'partially_paid') return 'Một phần';
    return s || '---';
}
function getPayBadge(s) {
    const v = String(s || '').toLowerCase();
    if (v === 'paid') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    if (v === 'partially_paid') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}
function formatMoney(v) { return Number(v || 0).toLocaleString('vi-VN'); }
function formatDateTime(v) {
    if (!v) return '---';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '---';
    return d.toLocaleString('vi-VN');
}

export default function CustomerInvoicesPage() {
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        payment_status: statusFilter === 'all' ? undefined : statusFilter,
        keyword: keyword || undefined,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['customer', 'invoices', queryParams],
        queryFn: () => getMyInvoices(queryParams),
        placeholderData: keepPreviousData,
    });

    const invoices = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: invoices.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được hóa đơn' : '';

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
                        <h1 className="text-2xl font-bold text-slate-900">Hóa đơn của tôi</h1>
                        <p className="mt-1 text-sm text-slate-500">Xem các hóa đơn từ chuyến thuê của bạn.</p>
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
                               placeholder="Tìm theo mã hóa đơn, mã booking, tên xe..."
                               className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-300" />
                    </div>
                    <select value={statusFilter} onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value); }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300">
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button type="submit" className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">Tìm kiếm</button>
                </form>

                {isLoading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Đang tải hóa đơn...</div>
                ) : errorMessage ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div>{errorMessage}</div></div>
                ) : invoices.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        <Receipt className="mx-auto mb-2 h-8 w-8 text-slate-300" /> Chưa có hóa đơn nào.
                    </div>
                ) : (
                    <>
                        <div className="mt-5 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                <tr className="text-left text-sm font-semibold text-slate-600">
                                    <th className="px-4 py-3">Mã HĐ</th>
                                    <th className="px-4 py-3">Xe</th>
                                    <th className="px-4 py-3">Chi tiết</th>
                                    <th className="px-4 py-3">Thành tiền</th>
                                    <th className="px-4 py-3">Thanh toán</th>
                                    <th className="px-4 py-3">Ngày xuất</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="align-top text-sm text-slate-700">
                                        <td className="px-4 py-4 font-semibold text-slate-900">{inv.invoice_code}</td>
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900">{inv.bookings?.vehicles?.name || '---'}</div>
                                            <div className="text-xs text-slate-500">{inv.bookings?.booking_code}</div>
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-500">
                                            <div>Tạm tính: {formatMoney(inv.subtotal)} đ</div>
                                            {Number(inv.extra_fee) > 0 ? <div>Phụ phí: {formatMoney(inv.extra_fee)} đ</div> : null}
                                            {Number(inv.penalty_fee) > 0 ? <div>Phạt: {formatMoney(inv.penalty_fee)} đ</div> : null}
                                            {Number(inv.discount_amount) > 0 ? <div>Giảm: {formatMoney(inv.discount_amount)} đ</div> : null}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-900">{formatMoney(inv.final_amount)} đ</td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPayBadge(inv.payment_status)}`}>{getPayLabel(inv.payment_status)}</span>
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-500">{formatDateTime(inv.issued_at)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>Trang {page} / {totalPages} — Tổng {pagination.total || 0} hóa đơn</div>
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
        </div>
    );
}