import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, MessageSquarePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createTicket } from '../support.api.js';
import { getMyBookings } from '@/features/customer/bookings/booking.api.js';

export default function CreateTicketModal({ open, onClose }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ subject: '', content: '', booking_id: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setForm({ subject: '', content: '', booking_id: '' });
            setError('');
        }
    }, [open]);

    const { data: bookingsData } = useQuery({
        queryKey: ['customer', 'bookings', 'for-ticket'],
        queryFn: () => getMyBookings({ limit: 50 }),
        enabled: open,
    });
    const bookings = bookingsData?.data || [];

    const mutation = useMutation({
        mutationFn: () => createTicket({
            subject: form.subject.trim(),
            content: form.content.trim(),
            booking_id: form.booking_id || null,
        }),
        onSuccess: () => {
            toast.success('Gửi thắc mắc thành công');
            queryClient.invalidateQueries({ queryKey: ['customer', 'support'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Gửi thắc mắc thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open) return null;

    const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.subject.trim()) return setError('Vui lòng nhập tiêu đề');
        if (!form.content.trim()) return setError('Vui lòng nhập nội dung');
        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><MessageSquarePlus size={18} /></div>
                        <h2 className="text-xl font-semibold text-slate-900">Gửi thắc mắc</h2>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Tiêu đề</label>
                        <input type="text" value={form.subject} onChange={(e) => setField('subject', e.target.value)}
                               placeholder="Vấn đề bạn gặp phải..."
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Liên quan đến chuyến (tùy chọn)</label>
                        <select value={form.booking_id} onChange={(e) => setField('booking_id', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400">
                            <option value="">-- Không gắn chuyến --</option>
                            {bookings.map((b) => <option key={b.id} value={b.id}>{b.booking_code} — {b.vehicles?.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nội dung</label>
                        <textarea rows={4} value={form.content} onChange={(e) => setField('content', e.target.value)}
                                  placeholder="Mô tả chi tiết thắc mắc của bạn..."
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                    </div>

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang gửi...' : 'Gửi thắc mắc'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}