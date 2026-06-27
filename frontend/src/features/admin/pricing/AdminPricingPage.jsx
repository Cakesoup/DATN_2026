import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCcw, CircleAlert, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminPricingPlans, deleteAdminPricingPlan } from './pricing.admin.api.js';
import PricingFormModal from './components/PricingFormModal.jsx';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang áp dụng', value: 'true' },
    { label: 'Ngừng áp dụng', value: 'false' },
];

const PAGE_SIZE = 10;

function formatMoney(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

function formatDateTime(value) {
    if (!value) return '---';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '---';
    return date.toLocaleString('vi-VN');
}

export default function AdminPricingPage() {
    const queryClient = useQueryClient();

    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [openForm, setOpenForm] = useState(false);

    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        is_active: activeFilter === 'all' ? undefined : activeFilter,
        keyword: keyword || undefined,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['admin', 'pricing', queryParams],
        queryFn: () => getAdminPricingPlans(queryParams),
        placeholderData: keepPreviousData,
    });

    const plans = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: plans.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được danh sách bảng giá' : '';

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteAdminPricingPlan(id),
        onSuccess: () => {
            toast.success('Xóa bảng giá thành công');
            queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] });
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Không thể xóa bảng giá'),
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setKeyword(searchInput.trim());
    };

    const handleDelete = (plan) => {
        if (window.confirm(`Xóa bảng giá "${plan.name}"?`)) {
            deleteMutation.mutate(plan.id);
        }
    };

    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Quản lý bảng giá</h1>
                        <p className="mt-1 text-sm text-slate-500">Cấu hình các gói giá thuê xe của hệ thống.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => refetch()} disabled={isFetching}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                        <button onClick={() => { setSelectedPlan(null); setOpenForm(true); }}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                            <Plus className="h-4 w-4" />
                            Thêm bảng giá
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                               placeholder="Tìm theo mã hoặc tên bảng giá..."
                               className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-300" />
                    </div>
                    <select value={activeFilter} onChange={(e) => { setCurrentPage(1); setActiveFilter(e.target.value); }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300">
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button type="submit" className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                        Tìm kiếm
                    </button>
                </form>

                {isLoading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Đang tải danh sách bảng giá...</div>
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
                                    <th className="px-4 py-3">Bảng giá</th>
                                    <th className="px-4 py-3">Giá / giờ</th>
                                    <th className="px-4 py-3">Giá / ngày</th>
                                    <th className="px-4 py-3">Tỷ lệ cọc</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3">Ngày tạo</th>
                                    <th className="px-4 py-3 text-right">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {plans.length > 0 ? plans.map((plan) => (
                                    <tr key={plan.id} className="text-sm text-slate-700">
                                        <td className="px-4 py-4">
                                            <div className="font-semibold text-slate-900">{plan.name}</div>
                                            <div className="text-xs text-slate-500">{plan.plan_code}</div>
                                            {plan.description ? <div className="mt-1 text-xs text-slate-400">{plan.description}</div> : null}
                                        </td>
                                        <td className="px-4 py-4">{formatMoney(plan.price_per_hour)} đ</td>
                                        <td className="px-4 py-4">{formatMoney(plan.price_per_day)} đ</td>
                                        <td className="px-4 py-4">{Math.round(Number(plan.deposit_rate || 0) * 100)}%</td>
                                        <td className="px-4 py-4">
                                            {plan.is_active ? (
                                                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">Đang áp dụng</span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">Ngừng</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-slate-500">{formatDateTime(plan.created_at)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setSelectedPlan(plan); setOpenForm(true); }}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50">
                                                    <Pencil className="h-3.5 w-3.5" /> Sửa
                                                </button>
                                                <button onClick={() => handleDelete(plan)} disabled={deleteMutation.isPending}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50">
                                                    <Trash2 className="h-3.5 w-3.5" /> Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">Không có bảng giá phù hợp.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>Trang {page} / {totalPages} — Tổng {pagination.total || 0} bảng giá</div>
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

            <PricingFormModal open={openForm} plan={selectedPlan} onClose={() => { setOpenForm(false); setSelectedPlan(null); }} />
        </div>
    );
}