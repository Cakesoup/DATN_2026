import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateStaffVehicleStatus } from '../vehicle.staff.api.js';

const STATUS_OPTIONS = [
    { label: 'Sẵn sàng', value: 'available' },
    { label: 'Đã đặt', value: 'reserved' },
    { label: 'Chờ bàn giao', value: 'handover_pending' },
    { label: 'Đang sử dụng', value: 'in_use' },
    { label: 'Bảo trì', value: 'maintenance' },
];

function getStatusLabel(status) {
    return STATUS_OPTIONS.find((o) => o.value === String(status || '').toLowerCase())?.label || status || 'Không rõ';
}

export default function UpdateVehicleStatusModal({ open, vehicle, onClose }) {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && vehicle) {
            setStatus(vehicle.status || 'available');
            setError('');
        }
    }, [open, vehicle]);

    const mutation = useMutation({
        mutationFn: () => updateStaffVehicleStatus(vehicle.id, { status }),
        onSuccess: () => {
            toast.success('Cập nhật trạng thái xe thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'vehicles'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Cập nhật trạng thái thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open || !vehicle) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><RefreshCw size={18} /></div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Cập nhật trạng thái xe</h2>
                            <p className="text-sm text-slate-500">{vehicle.vehicle_code} — {vehicle.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                        <div className="text-xs text-slate-500">Trạng thái hiện tại</div>
                        <div className="mt-1 font-semibold text-slate-900">{getStatusLabel(vehicle.status)}</div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Chuyển sang trạng thái</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400">
                            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={mutation.isPending}
                                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}