import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStaffInvoice } from '@/features/staff/invoices/invoice.staff.api.js';

function formatMoney(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

export default function CreateInvoiceModal({ open, booking, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ extra_fee: '', penalty_fee: '', discount_amount: '', payment_status: 'unpaid', note: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setForm({ extra_fee: '', penalty_fee: '', discount_amount: '', payment_status: 'unpaid', note: '' });
            setError('');
        }
    }, [open, booking?.id]);

    const subtotal = Number(booking?.total_amount || 0);
    const lateFee = Number(booking?.late_fee || 0);
    const finalAmount = Math.max(
        subtotal + lateFee + Number(form.penalty_fee || 0) - Number(form.discount_amount || 0),
        0
    );

    const mutation = useMutation({
        mutationFn: () => createStaffInvoice({
            booking_id: booking.id,
            extra_fee: Number(form.extra_fee || 0),
            penalty_fee: Number(form.penalty_fee || 0),
            discount_amount: Number(form.discount_amount || 0),
            payment_status: form.payment_status,
            note: form.note || null,
        }),
        onSuccess: () => {
            toast.success('Tạo hóa đơn thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'bookings'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Tạo hóa đơn thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open || !booking) return null;

    const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><Receipt size={18} /></div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Tạo hóa đơn</h2>
                            <p className="text-sm text-slate-500">{booking.booking_code}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={18} /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4 p-6">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500">Tạm tính (tiền thuê)</span><span className="font-semibold text-slate-900">{formatMoney(subtotal)} đ</span></div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-slate-500">Tiền thuê</span><span className="font-semibold text-slate-900">{formatMoney(subtotal)} đ</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Phí trả muộn {booking.is_late ? `(${booking.late_hours} giờ)` : ''}</span><span className="font-semibold text-amber-700">{formatMoney(lateFee)} đ</span></div>
                        {booking.has_damage ? <div className="text-xs text-rose-600">⚠ Xe có hỏng hóc: {booking.damage_note || 'không mô tả'}</div> : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phí phạt hỏng hóc</label>
                            <input type="number" min="0" value={form.penalty_fee} onChange={(e) => setField('penalty_fee', e.target.value)}
                                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Giảm giá</label>
                            <input type="number" min="0" value={form.discount_amount} onChange={(e) => setField('discount_amount', e.target.value)}
                                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Trạng thái thanh toán</label>
                        <select value={form.payment_status} onChange={(e) => setField('payment_status', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400">
                            <option value="unpaid">Chưa thanh toán</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="partially_paid">Thanh toán một phần</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú</label>
                        <textarea rows={2} value={form.note} onChange={(e) => setField('note', e.target.value)}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
                        <span className="text-sm">Thành tiền</span>
                        <span className="text-lg font-bold">{formatMoney(finalAmount)} đ</span>
                    </div>

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang tạo...' : 'Tạo hóa đơn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}