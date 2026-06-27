import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, CircleAlert, BadgeDollarSign, Check } from 'lucide-react';
import { getActivePricingPlans } from './pricing.api.js';

function formatMoney(v) { return Number(v || 0).toLocaleString('vi-VN'); }

export default function CustomerPricingPage() {
    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['customer', 'pricing'],
        queryFn: () => getActivePricingPlans({ limit: 50 }),
    });

    const plans = data?.data || [];
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được bảng giá' : '';

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Bảng giá thuê xe</h1>
                        <p className="mt-1 text-sm text-slate-500">Các gói giá đang áp dụng tại EV Rental.</p>
                    </div>
                    <button onClick={() => refetch()} disabled={isFetching}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                        <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Làm mới
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Đang tải bảng giá...</div>
            ) : errorMessage ? (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div>{errorMessage}</div></div>
            ) : plans.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Chưa có gói giá nào.</div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((p) => (
                        <div key={p.id} className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><BadgeDollarSign size={18} /></div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                                    <div className="text-xs text-slate-500">{p.plan_code}</div>
                                </div>
                            </div>

                            {p.description ? <p className="mb-4 text-sm text-slate-500">{p.description}</p> : null}

                            <div className="mb-4 space-y-2">
                                {p.duration_days && p.package_price != null ? (
                                    <>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-900">{formatMoney(p.package_price)} đ</span>
                                            <span className="text-sm text-slate-400">/ {p.duration_days} ngày</span>
                                        </div>
                                        <div className="text-sm text-emerald-600">Gói thuê dài ngày tiết kiệm</div>
                                    </>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-slate-900">{formatMoney(p.price_per_day)} đ</span>
                                        <span className="text-sm text-slate-400">/ ngày</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Cọc {Math.round(Number(p.deposit_rate || 0) * 100)}% giá trị thuê</div>
                                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Áp dụng toàn hệ thống</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}