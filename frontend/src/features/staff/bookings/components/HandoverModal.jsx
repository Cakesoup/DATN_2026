import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { confirmHandover } from '../booking.staff.api.js';

export default function HandoverModal({ open, booking, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ handover_battery: '', handover_odo: '', handover_note: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setForm({
                handover_battery: booking?.vehicles?.battery_level ?? '',
                handover_odo: '',
                handover_note: '',
            });
            setError('');
        }
    }, [open, booking?.id, booking?.vehicles?.battery_level]);

    const mutation = useMutation({
        mutationFn: () => confirmHandover(booking.id, {
            handover_battery: form.handover_battery === '' ? undefined : Number(form.handover_battery),
            handover_odo: form.handover_odo === '' ? undefined : Number(form.handover_odo),
            handover_note: form.handover_note || null,
        }),
        onSuccess: () => {
            toast.success('Bàn giao xe thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'bookings'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Bàn giao thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open || !booking) return null;

    const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><ArrowRightCircle size={18} /></div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Bàn giao xe cho khách</h2>
                            <p className="text-sm text-slate-500">{booking.booking_code} — {booking.vehicles?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={18} /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4 p-6">
                    <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Ghi nhận tình trạng xe tại thời điểm giao cho khách hàng.
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Mức pin khi giao (%)</label>
                            <input type="number" min="0" max="100" value={form.handover_battery} onChange={(e) => setField('handover_battery', e.target.value)}
                                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Số km (odo) khi giao</label>
                            <input type="number" min="0" value={form.handover_odo} onChange={(e) => setField('handover_odo', e.target.value)}
                                   className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Ghi chú tình trạng xe</label>
                        <textarea rows={3} value={form.handover_note} onChange={(e) => setField('handover_note', e.target.value)}
                                  placeholder="Ngoại thất, trầy xước sẵn có, phụ kiện kèm theo..."
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                    </div>

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang xử lý...' : 'Xác nhận bàn giao'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}