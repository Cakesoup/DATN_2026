import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmReturn } from '../booking.staff.api.js';

function formatDateTime(value) {
    if (!value) return '---';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '---';
    return d.toLocaleString('vi-VN');
}

export default function ConfirmReturnModal({ open, booking, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        vehicle_status_after_return: 'available',
        return_battery: '',
        return_odo: '',
        has_damage: false,
        damage_note: '',
        note: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setForm({
                vehicle_status_after_return: 'available',
                return_battery: '',
                return_odo: '',
                has_damage: false,
                damage_note: '',
                note: '',
            });
            setError('');
        }
    }, [open, booking?.id]);

    // Ước lượng trễ giờ ngay trên giao diện (backend sẽ tính lại chính xác)
    const now = new Date();
    const endAt = booking ? new Date(booking.end_at) : null;
    const isLate = endAt && now > endAt;
    const lateHours = isLate ? Math.ceil((now - endAt) / (1000 * 60 * 60)) : 0;

    const mutation = useMutation({
        mutationFn: () => confirmReturn(booking.id, {
            vehicle_status_after_return: form.vehicle_status_after_return,
            return_battery: form.return_battery === '' ? undefined : Number(form.return_battery),
            return_odo: form.return_odo === '' ? undefined : Number(form.return_odo),
            has_damage: form.has_damage,
            damage_note: form.has_damage ? (form.damage_note || null) : null,
            note: form.note || null,
        }),
        onSuccess: () => {
            toast.success('Xác nhận trả xe thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'bookings'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Xác nhận trả xe thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open || !booking) return null;

    const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><RotateCcw size={18} /></div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Tiếp nhận xe trả</h2>
                            <p className="text-sm text-slate-500">{booking.booking_code} — {booking.vehicles?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={18} /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4 p-6">
                    <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                        <div>Hạn trả: <span className="font-medium text-slate-800">{formatDateTime(booking.end_at)}</span></div>
                        {booking.handover_battery != null ? <div className="mt-1">Pin khi giao: <span className="font-medium text-slate-800">{booking.handover_battery}%</span></div> : null}
                    </div>

                    {isLate ? (
                        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                            <div>Khách trả trễ khoảng <strong>{lateHours} giờ</strong>. Phí trả muộn sẽ được tính tự động vào hóa đơn.</div>
                        </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mức pin khi trả (%)</label>
                            <input type="number" min="0" max="100" value={form.return_battery} onChange={(e) => setField('return_battery', e.target.value)}
                                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Số km (odo) khi trả</label>
                            <input type="number" min="0" value={form.return_odo} onChange={(e) => setField('return_odo', e.target.value)}
                                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <input type="checkbox" checked={form.has_damage} onChange={(e) => setField('has_damage', e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                        <span className="text-sm font-medium text-slate-700">Xe có hỏng hóc / hư hại</span>
                    </label>

                    {form.has_damage ? (
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả hỏng hóc</label>
                            <textarea rows={2} value={form.damage_note} onChange={(e) => setField('damage_note', e.target.value)}
                                      placeholder="Mô tả hư hại để làm căn cứ tính phí phạt..."
                                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                        </div>
                    ) : null}

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Trạng thái xe sau khi trả</label>
                        <select value={form.vehicle_status_after_return} onChange={(e) => setField('vehicle_status_after_return', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400">
                            <option value="available">Sẵn sàng cho thuê</option>
                            <option value="maintenance">Cần bảo trì</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú chung</label>
                        <textarea rows={2} value={form.note} onChange={(e) => setField('note', e.target.value)}
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                    </div>

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang xử lý...' : 'Xác nhận trả xe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}