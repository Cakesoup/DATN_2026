import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { createBooking } from '@/features/customer/bookings/booking.api.js';
import { getActivePricingPlans } from '@/features/customer/pricing/pricing.api.js';

function formatMoney(v) { return Number(v || 0).toLocaleString('vi-VN'); }
const DEPOSIT_RATE = 0.3;

export default function BookingModal({ open, vehicle, onClose }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [form, setForm] = useState({ start_at: '', end_at: '', pickup_location: '', return_location: '', note: '', pricing_plan_id: '' });
    const [error, setError] = useState('');

    // Lấy các gói chu kỳ (chỉ gói có duration_days + package_price mới là gói dài ngày)
    const { data: plansData } = useQuery({
        queryKey: ['customer', 'pricing', 'packages'],
        queryFn: () => getActivePricingPlans({ limit: 50 }),
        enabled: open,
    });
    const packages = (plansData?.data || []).filter((p) => p.duration_days && p.package_price != null);

    useEffect(() => {
        if (open) {
            setForm({
                start_at: '', end_at: '',
                pickup_location: vehicle?.current_location || '',
                return_location: vehicle?.current_location || '',
                note: '', pricing_plan_id: '',
            });
            setError('');
        }
    }, [open, vehicle?.id, vehicle?.current_location]);

    const selectedPlan = useMemo(
        () => packages.find((p) => String(p.id) === String(form.pricing_plan_id)) || null,
        [packages, form.pricing_plan_id]
    );

    const pricePerDay = Number(vehicle?.effective_price_per_day ?? vehicle?.price_per_day ?? 0);

    // Tính ngày trả + tổng tiền
    const computed = useMemo(() => {
        if (!form.start_at) return null;
        const start = new Date(form.start_at);
        if (Number.isNaN(start.getTime())) return null;

        if (selectedPlan) {
            const end = new Date(start.getTime() + Number(selectedPlan.duration_days) * 86400000);
            const total = Number(selectedPlan.package_price);
            return { end, total, deposit: total * DEPOSIT_RATE, days: Number(selectedPlan.duration_days), isPackage: true };
        }
        // không gói: cần end_at
        if (!form.end_at) return null;
        const end = new Date(form.end_at);
        if (Number.isNaN(end.getTime()) || end <= start) return null;
        const days = Math.max(1, Math.ceil((end - start) / 86400000));
        const total = pricePerDay * days;
        return { end, total, deposit: total * DEPOSIT_RATE, days, isPackage: false };
    }, [form.start_at, form.end_at, selectedPlan, pricePerDay]);

    const mutation = useMutation({
        mutationFn: () => createBooking({
            vehicle_id: vehicle.id,
            pricing_plan_id: form.pricing_plan_id || undefined,
            start_at: new Date(form.start_at).toISOString(),
            // gói tự tính end ở backend; gửi end client cho trường hợp không gói
            end_at: computed ? computed.end.toISOString() : new Date(form.end_at).toISOString(),
            pickup_location: form.pickup_location.trim(),
            return_location: form.return_location.trim(),
            note: form.note || null,
        }),
        onSuccess: () => {
            toast.success('Đặt xe thành công');
            queryClient.invalidateQueries({ queryKey: ['customer', 'vehicles'] });
            queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] });
            onClose?.();
            navigate('/customer/bookings');
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Đặt xe thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open || !vehicle) return null;

    const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.start_at) return setError('Vui lòng chọn thời gian nhận xe');
        if (!selectedPlan && !form.end_at) return setError('Vui lòng chọn thời gian trả xe (hoặc chọn gói thuê dài ngày)');
        if (!selectedPlan && new Date(form.end_at) <= new Date(form.start_at)) return setError('Thời gian trả phải sau thời gian nhận');
        if (!form.pickup_location.trim() || !form.return_location.trim()) return setError('Vui lòng nhập địa điểm nhận và trả xe');
        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600"><CalendarCheck size={18} /></div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Đặt xe</h2>
                            <p className="text-sm text-slate-500">{vehicle.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Chọn gói thuê dài ngày (tùy chọn) */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Hình thức thuê</label>
                        <div className="space-y-2">
                            <button type="button" onClick={() => setField('pricing_plan_id', '')}
                                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                        !form.pricing_plan_id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50'
                                    }`}>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">Thuê theo ngày</div>
                                    <div className="text-xs text-slate-500">Tự chọn ngày nhận và trả</div>
                                </div>
                                <div className="text-sm font-bold text-emerald-600">{formatMoney(pricePerDay)}đ/ngày</div>
                            </button>

                            {packages.map((p) => {
                                const checked = String(form.pricing_plan_id) === String(p.id);
                                return (
                                    <button key={p.id} type="button" onClick={() => setField('pricing_plan_id', String(p.id))}
                                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                                checked ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:bg-slate-50'
                                            }`}>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">{p.name}</div>
                                            <div className="text-xs text-slate-500">Gói {p.duration_days} ngày · cọc {Math.round(Number(p.deposit_rate || DEPOSIT_RATE) * 100)}%</div>
                                        </div>
                                        <div className="text-sm font-bold text-emerald-600">{formatMoney(p.package_price)}đ</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`grid gap-4 ${selectedPlan ? '' : 'md:grid-cols-2'}`}>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Thời gian nhận xe</label>
                            <input type="datetime-local" value={form.start_at} onChange={(e) => setField('start_at', e.target.value)}
                                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
                        </div>
                        {!selectedPlan ? (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Thời gian trả xe</label>
                                <input type="datetime-local" value={form.end_at} onChange={(e) => setField('end_at', e.target.value)}
                                       className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
                            </div>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa điểm nhận xe</label>
                        <input type="text" value={form.pickup_location} onChange={(e) => setField('pickup_location', e.target.value)}
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Địa điểm trả xe</label>
                        <input type="text" value={form.return_location} onChange={(e) => setField('return_location', e.target.value)}
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú</label>
                        <textarea rows={2} value={form.note} onChange={(e) => setField('note', e.target.value)}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
                    </div>

                    {computed ? (
                        <div className="space-y-1 rounded-2xl bg-slate-50 p-4 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Hình thức</span><span className="font-medium text-slate-900">{computed.isPackage ? `Gói ${computed.days} ngày` : `Thuê ${computed.days} ngày`}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Ngày trả (dự kiến)</span><span className="font-medium text-slate-900">{computed.end.toLocaleString('vi-VN')}</span></div>
                            <div className="flex justify-between border-t border-slate-200 pt-1"><span className="text-slate-500">Tạm tính</span><span className="font-semibold text-emerald-600">{formatMoney(computed.total)} đ</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Cọc (30%)</span><span className="font-medium text-slate-900">{formatMoney(computed.deposit)} đ</span></div>
                        </div>
                    ) : null}

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60">
                            {mutation.isPending ? 'Đang đặt...' : 'Xác nhận đặt xe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}