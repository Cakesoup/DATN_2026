import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteStaffVehicle } from '../vehicle.staff.api.js';

export default function DeleteVehicleModal({ open, vehicle, onClose }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteStaffVehicle(vehicle.id),
        onSuccess: () => {
            toast.success('Xóa xe thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'vehicles'] });
            onClose?.();
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Xóa xe thất bại'),
    });

    if (!open || !vehicle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-rose-50 p-2"><Trash2 className="h-5 w-5 text-rose-600" /></div>
                        <h2 className="text-lg font-semibold text-slate-900">Xóa xe</h2>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-600">
                        Bạn chắc chắn muốn xóa xe <span className="font-semibold text-slate-900">{vehicle.vehicle_code} — {vehicle.name}</span>? Hành động này không thể hoàn tác.
                    </p>
                    <div className="mt-5 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Hủy</button>
                        <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
                            {mutation.isPending ? 'Đang xóa...' : 'Xóa xe'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}