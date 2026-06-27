import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MessageSquareReply } from 'lucide-react';
import toast from 'react-hot-toast';
import { replyStaffTicket } from '../support.staff.api.js';

function formatDateTime(value) {
    if (!value) return '---';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '---';
    return d.toLocaleString('vi-VN');
}

export default function ReplyTicketModal({ open, ticket, onClose }) {
    const queryClient = useQueryClient();
    const [reply, setReply] = useState('');
    const [error, setError] = useState('');

    const isAnswered = ticket?.status === 'answered' || ticket?.status === 'closed';

    useEffect(() => {
        if (open) {
            setReply(ticket?.reply || '');
            setError('');
        }
    }, [open, ticket?.id, ticket?.reply]);

    const mutation = useMutation({
        mutationFn: () => replyStaffTicket(ticket.id, { reply: reply.trim() }),
        onSuccess: () => {
            toast.success('Trả lời thắc mắc thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'support'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Trả lời thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open || !ticket) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reply.trim()) return setError('Vui lòng nhập nội dung trả lời');
        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><MessageSquareReply size={18} /></div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Trả lời thắc mắc</h2>
                            <p className="text-sm text-slate-500">Từ: {ticket.user?.full_name || '---'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                        <div>
                            <div className="text-xs text-slate-500">Tiêu đề</div>
                            <div className="mt-1 font-semibold text-slate-900">{ticket.subject}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Nội dung</div>
                            <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{ticket.content}</div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            {ticket.bookings ? <div>Booking: <span className="text-slate-700">{ticket.bookings.booking_code}</span></div> : null}
                            <div>Gửi lúc: <span className="text-slate-700">{formatDateTime(ticket.created_at)}</span></div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Nội dung trả lời {isAnswered ? '(đã trả lời, có thể cập nhật)' : ''}
                        </label>
                        <textarea rows={5} value={reply} onChange={(e) => setReply(e.target.value)}
                                  placeholder="Nhập câu trả lời cho khách hàng..."
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                    </div>

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Đóng</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang gửi...' : 'Gửi trả lời'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}