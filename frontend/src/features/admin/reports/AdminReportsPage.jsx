import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, CircleAlert, Users, CarFront, CalendarDays, Receipt } from 'lucide-react';
import { getOverviewReport, getRevenueReport } from './report.admin.api.js';

function formatMoney(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

function formatDateTime(value) {
    if (!value) return '---';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '---';
    return date.toLocaleString('vi-VN');
}

function getPaymentStatusLabel(status) {
    const v = String(status || '').toLowerCase();
    if (v === 'paid') return 'Đã thanh toán';
    if (v === 'partially_paid') return 'Một phần';
    if (v === 'unpaid') return 'Chưa thanh toán';
    return status || '---';
}

function StatCard({ icon: Icon, label, value, tone = 'slate' }) {
    const tones = {
        slate: 'bg-white ring-slate-200 text-slate-900',
        amber: 'bg-amber-50 ring-amber-100 text-amber-700',
        sky: 'bg-sky-50 ring-sky-100 text-sky-700',
        emerald: 'bg-emerald-50 ring-emerald-100 text-emerald-700',
    };
    return (
        <div className={`rounded-3xl p-5 shadow-sm ring-1 ${tones[tone]}`}>
            <div className="flex items-center gap-2 text-sm opacity-80"><Icon className="h-4 w-4" />{label}</div>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
}

export default function AdminReportsPage() {
    const [filters, setFilters] = useState({ from: '', to: '', payment_status: '' });
    const [appliedFilters, setAppliedFilters] = useState({});

    const overviewQuery = useQuery({
        queryKey: ['admin', 'reports', 'overview'],
        queryFn: getOverviewReport,
    });

    const revenueQuery = useQuery({
        queryKey: ['admin', 'reports', 'revenue', appliedFilters],
        queryFn: () => getRevenueReport(appliedFilters),
    });

    const overview = overviewQuery.data?.data;
    const revenue = revenueQuery.data?.data;

    const handleApply = (e) => {
        e.preventDefault();
        const params = {};
        if (filters.from) params.from = filters.from;
        if (filters.to) params.to = filters.to;
        if (filters.payment_status) params.payment_status = filters.payment_status;
        setAppliedFilters(params);
    };

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Báo cáo & thống kê</h1>
                        <p className="mt-1 text-sm text-slate-500">Tổng quan hoạt động và doanh thu hệ thống.</p>
                    </div>
                    <button onClick={() => { overviewQuery.refetch(); revenueQuery.refetch(); }}
                            disabled={overviewQuery.isFetching || revenueQuery.isFetching}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                        <RefreshCcw className={`h-4 w-4 ${overviewQuery.isFetching ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {overviewQuery.isLoading ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Đang tải báo cáo...</div>
            ) : overviewQuery.isError ? (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100">
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>{overviewQuery.error?.response?.data?.message || 'Không tải được báo cáo tổng quan'}</div>
                </div>
            ) : overview ? (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <StatCard icon={Users} label="Người dùng" value={overview.summary.total_users} />
                        <StatCard icon={CarFront} label="Xe" value={overview.summary.total_vehicles} />
                        <StatCard icon={CalendarDays} label="Booking" value={overview.summary.total_bookings} />
                        <StatCard icon={Receipt} label="Hóa đơn" value={overview.summary.total_invoices} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <h3 className="mb-3 text-sm font-semibold text-slate-600">Tình trạng xe</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Sẵn sàng</span><span className="font-semibold text-emerald-600">{overview.vehicles.available}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Đang sử dụng</span><span className="font-semibold text-sky-600">{overview.vehicles.in_use}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Bảo trì</span><span className="font-semibold text-amber-600">{overview.vehicles.maintenance}</span></div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <h3 className="mb-3 text-sm font-semibold text-slate-600">Tình trạng booking</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Chờ xác nhận</span><span className="font-semibold text-amber-600">{overview.bookings.pending}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Đang thuê</span><span className="font-semibold text-sky-600">{overview.bookings.in_progress}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Hoàn tất</span><span className="font-semibold text-emerald-600">{overview.bookings.completed}</span></div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                            <h3 className="mb-3 text-sm font-semibold text-slate-600">Doanh thu</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500">Đã thu</span><span className="font-semibold text-emerald-600">{formatMoney(overview.revenue.paid_revenue)} đ</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Chưa thu</span><span className="font-semibold text-rose-600">{formatMoney(overview.revenue.unpaid_revenue)} đ</span></div>
                                <div className="flex justify-between border-t border-slate-100 pt-2"><span className="text-slate-500">Tổng</span><span className="font-semibold text-slate-900">{formatMoney(overview.revenue.final_amount)} đ</span></div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Chi tiết doanh thu theo hóa đơn</h2>
                <form onSubmit={handleApply} className="mt-3 flex flex-col gap-3 md:flex-row md:items-end">
                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">Từ ngày</label>
                        <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
                               className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-300" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">Đến ngày</label>
                        <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
                               className="h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-300" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">Trạng thái</label>
                        <select value={filters.payment_status} onChange={(e) => setFilters((f) => ({ ...f, payment_status: e.target.value }))}
                                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300">
                            <option value="">Tất cả</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="unpaid">Chưa thanh toán</option>
                            <option value="partially_paid">Một phần</option>
                        </select>
                    </div>
                    <button type="submit" className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">Lọc</button>
                </form>

                {revenueQuery.isLoading ? (
                    <div className="py-12 text-center text-sm text-slate-500">Đang tải...</div>
                ) : revenueQuery.isError ? (
                    <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{revenueQuery.error?.response?.data?.message || 'Không tải được doanh thu'}</div>
                ) : revenue ? (
                    <>
                        {revenue.totals ? (
                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm md:grid-cols-5">
                                <div><div className="text-xs text-slate-500">Tạm tính</div><div className="font-semibold text-slate-900">{formatMoney(revenue.totals.subtotal)} đ</div></div>
                                <div><div className="text-xs text-slate-500">Phụ phí</div><div className="font-semibold text-slate-900">{formatMoney(revenue.totals.extra_fee)} đ</div></div>
                                <div><div className="text-xs text-slate-500">Phạt</div><div className="font-semibold text-slate-900">{formatMoney(revenue.totals.penalty_fee)} đ</div></div>
                                <div><div className="text-xs text-slate-500">Giảm giá</div><div className="font-semibold text-slate-900">{formatMoney(revenue.totals.discount_amount)} đ</div></div>
                                <div><div className="text-xs text-slate-500">Thành tiền</div><div className="font-semibold text-emerald-600">{formatMoney(revenue.totals.final_amount)} đ</div></div>
                            </div>
                        ) : null}

                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                <tr className="text-left text-sm font-semibold text-slate-600">
                                    <th className="px-4 py-3">Mã HĐ</th>
                                    <th className="px-4 py-3">Khách hàng</th>
                                    <th className="px-4 py-3">Xe</th>
                                    <th className="px-4 py-3">Thành tiền</th>
                                    <th className="px-4 py-3">Thanh toán</th>
                                    <th className="px-4 py-3">Ngày xuất</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {(revenue.items || []).length > 0 ? revenue.items.map((inv) => (
                                    <tr key={inv.id} className="text-sm text-slate-700">
                                        <td className="px-4 py-3 font-medium text-slate-900">{inv.invoice_code}</td>
                                        <td className="px-4 py-3">{inv.bookings?.users?.full_name || '---'}</td>
                                        <td className="px-4 py-3">{inv.bookings?.vehicles?.name || '---'}</td>
                                        <td className="px-4 py-3 font-medium">{formatMoney(inv.final_amount)} đ</td>
                                        <td className="px-4 py-3">{getPaymentStatusLabel(inv.payment_status)}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(inv.issued_at)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Không có hóa đơn phù hợp.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}