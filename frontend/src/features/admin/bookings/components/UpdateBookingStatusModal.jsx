import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateAdminBookingStatus } from '../booking.admin.api.js';

const TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['handover_pending', 'cancelled'],
    handover_pending: ['in_progress', 'cancelled'],
    in_progress: ['completed'],
    completed: ['invoiced'],
    invoiced: [],
    cancelled: [],
};

function getStatusLabel(status) {
    const value = String(status || '').toLowerCase();

    if (value === 'pending') return 'Chờ xác nhận';
    if (value === 'confirmed') return 'Đã xác nhận';
    if (value === 'handover_pending') return 'Chờ bàn giao';
    if (value === 'in_progress') return 'Đang thuê';
    if (value === 'completed') return 'Hoàn tất';
    if (value === 'invoiced') return 'Đã xuất hóa đơn';
    if (value === 'cancelled') return 'Đã hủy';

    return status || 'Không rõ';
}

function formatMoney(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

function formatDateTime(value) {
    if (!value) return '---';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '---';

    return date.toLocaleString('vi-VN');
}

export default function UpdateBookingStatusModal({ open, booking, onClose }) {
    const queryClient = useQueryClient();
    const [nextStatus, setNextStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setNextStatus('');
            setError('');
        }
    }, [open, booking?.id]);

    const allowedStatuses = useMemo(() => {
        const current = String(booking?.booking_status || '').toLowerCase();
        return TRANSITIONS[current] || [];
    }, [booking]);

    const mutation = useMutation({
        mutationFn: () =>
            updateAdminBookingStatus(booking.id, { booking_status: nextStatus }),
        onSuccess: () => {
            toast.success('Cập nhật trạng thái booking thành công');
            queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
            onClose?.();
        },
        onError: (err) => {
            const message =
                err?.response?.data?.message || 'Cập nhật trạng thái booking thất bại';
            setError(message);
            toast.error(message);
        },
    });

    if (!open || !booking) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nextStatus) {
            setError('Vui lòng chọn trạng thái mới');
            return;
        }

        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                            <ArrowRightLeft size={18} />
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Cập nhật trạng thái booking
                            </h2>
                            <p className="text-sm text-slate-500">
                                Chỉ hiển thị các trạng thái được phép chuyển tiếp.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
                        <div>
                            <div className="text-xs text-slate-500">Mã booking</div>
                            <div className="mt-1 font-semibold text-slate-900">
                                {booking.booking_code}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">Trạng thái hiện tại</div>
                            <div className="mt-1 font-semibold text-slate-900">
                                {getStatusLabel(booking.booking_status)}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">Khách hàng</div>
                            <div className="mt-1 font-medium text-slate-900">
                                {booking.users?.full_name || '---'}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">Xe</div>
                            <div className="mt-1 font-medium text-slate-900">
                                {booking.vehicles?.vehicle_code || '---'} - {booking.vehicles?.name || '---'}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">Thời gian nhận xe</div>
                            <div className="mt-1 text-sm text-slate-700">
                                {formatDateTime(booking.start_at)}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">Thời gian trả xe</div>
                            <div className="mt-1 text-sm text-slate-700">
                                {formatDateTime(booking.end_at)}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">Tổng tiền</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">
                                {formatMoney(booking.total_amount)} VNĐ
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-slate-500">Tiền cọc</div>
                            <div className="mt-1 text-sm font-medium text-slate-900">
                                {formatMoney(booking.deposit_amount)} VNĐ
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Chuyển sang trạng thái
                        </label>

                        <select
                            value={nextStatus}
                            onChange={(e) => setNextStatus(e.target.value)}
                            disabled={allowedStatuses.length === 0}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
                        >
                            <option value="">-- Chọn trạng thái --</option>
                            {allowedStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {getStatusLabel(status)}
                                </option>
                            ))}
                        </select>

                        {allowedStatuses.length === 0 ? (
                            <p className="mt-2 text-sm text-slate-500">
                                Booking này không còn trạng thái kế tiếp hợp lệ.
                            </p>
                        ) : null}
                    </div>

                    {error ? (
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                            {error}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={mutation.isPending || allowedStatuses.length === 0}
                            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                        >
                            {mutation.isPending ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}