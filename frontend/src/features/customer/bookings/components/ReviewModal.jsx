import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { createReview } from '@/features/customer/reviews/review.api.js';

export default function ReviewModal({ open, booking, onClose }) {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setRating(5);
            setHover(0);
            setComment('');
            setError('');
        }
    }, [open, booking?.id]);

    const mutation = useMutation({
        mutationFn: () => createReview({ booking_id: booking.id, rating, comment: comment || null }),
        onSuccess: () => {
            toast.success('Đánh giá thành công');
            queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Đánh giá thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open || !booking) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Đánh giá chuyến thuê</h2>
                        <p className="text-sm text-slate-500">{booking.vehicles?.name} — {booking.booking_code}</p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={18} /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Chấm điểm</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                                        className="p-1">
                                    <Star className={`h-8 w-8 transition ${n <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Nhận xét</label>
                        <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)}
                                  placeholder="Chia sẻ trải nghiệm của bạn về chiếc xe..."
                                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
                    </div>

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}