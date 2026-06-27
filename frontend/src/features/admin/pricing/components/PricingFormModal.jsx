import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, BadgeDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAdminPricingPlan, updateAdminPricingPlan } from '../pricing.admin.api.js';

const EMPTY_FORM = {
    plan_code: '',
    name: '',
    description: '',
    price_per_hour: '',
    price_per_day: '',
    deposit_rate: '0.3',
    is_active: true,
    duration_days: '',
    package_price: '',
};

export default function PricingFormModal({ open, plan, onClose }) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(plan);

    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;

        if (plan) {
            setForm({
                plan_code: plan.plan_code || '',
                name: plan.name || '',
                description: plan.description || '',
                price_per_hour: String(plan.price_per_hour ?? ''),
                price_per_day: String(plan.price_per_day ?? ''),
                deposit_rate: String(plan.deposit_rate ?? '0.3'),
                is_active: plan.is_active ?? true,
                duration_days: String(plan.duration_days ?? ''),
                package_price: String(plan.package_price ?? ''),
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setError('');
    }, [open, plan]);

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim() || null,
                price_per_hour: Number(form.price_per_hour || 0),
                price_per_day: Number(form.price_per_day || 0),
                deposit_rate: Number(form.deposit_rate || 0),
                is_active: form.is_active,
                duration_days: form.duration_days === '' ? undefined : Number(form.duration_days),
                package_price: form.package_price === '' ? undefined : Number(form.package_price),
            };

            if (isEdit) {
                return updateAdminPricingPlan(plan.id, payload);
            }
            return createAdminPricingPlan({ ...payload, plan_code: form.plan_code.trim() });
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Cập nhật bảng giá thành công' : 'Tạo bảng giá thành công');
            queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] });
            onClose?.();
        },
        onError: (err) => {
            const message = err?.response?.data?.message || 'Lưu bảng giá thất bại';
            setError(message);
            toast.error(message);
        },
    });

    if (!open) return null;

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isEdit && !form.plan_code.trim()) return setError('Vui lòng nhập mã bảng giá');
        if (!form.name.trim()) return setError('Vui lòng nhập tên bảng giá');

        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                            <BadgeDollarSign size={18} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {isEdit ? 'Cập nhật bảng giá' : 'Thêm bảng giá'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {isEdit ? 'Mã bảng giá không thể thay đổi.' : 'Tạo gói giá mới cho hệ thống.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mã bảng giá</label>
                            <input
                                type="text"
                                value={form.plan_code}
                                disabled={isEdit}
                                onChange={(e) => setField('plan_code', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="PLAN_BASIC"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên bảng giá</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                placeholder="Gói cơ bản"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setField('description', e.target.value)}
                            rows={2}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            placeholder="Mô tả ngắn về gói giá"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Giá / giờ (VNĐ)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.price_per_hour}
                                onChange={(e) => setField('price_per_hour', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Giá / ngày (VNĐ)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.price_per_day}
                                onChange={(e) => setField('price_per_day', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tỷ lệ cọc (0-1)</label>
                            <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.05"
                                value={form.deposit_rate}
                                onChange={(e) => setField('deposit_rate', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setField('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-700">Đang áp dụng</span>
                    </label>

                    {error ? (
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
                    ) : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                            Hủy
                        </button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo bảng giá'}
                        </button>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-4">
                        <div className="mb-3 text-sm font-semibold text-emerald-700">Gói thuê dài ngày (chu kỳ cố định)</div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Số ngày của gói</label>
                                <input type="number" min="1" value={form.duration_days} onChange={(e) => setField('duration_days', e.target.value)}
                                       placeholder="vd: 7, 30..." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Giá trọn gói (VNĐ)</label>
                                <input type="number" min="0" value={form.package_price} onChange={(e) => setField('package_price', e.target.value)}
                                       placeholder="vd: 700000" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Để trống nếu đây không phải gói thuê dài ngày.</p>
                    </div>
                </form>
            </div>
        </div>
    );
}