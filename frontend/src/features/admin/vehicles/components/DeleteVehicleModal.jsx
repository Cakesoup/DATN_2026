import { Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { deleteAdminVehicle } from '../admin.api.js';
import toast from 'react-hot-toast';

export default function DeleteVehicleModal({ open, vehicle, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!open || !vehicle) return null;

    const handleDelete = async () => {
        try {
            setLoading(true);
            setError('');

            await deleteAdminVehicle(vehicle.id);

            toast.success('Xóa xe thành công');
            onDeleted?.();
            onClose?.();
        } catch (err) {
            const message = err?.response?.data?.message || 'Xóa xe thất bại';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-red-50 p-2 text-red-600">
                            <Trash2 size={18} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Xóa xe</h2>
                            <p className="text-sm text-slate-500">Hành động này không thể hoàn tác.</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 p-6">
                    <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Bạn đang xóa xe</p>
                        <p className="mt-1 font-semibold text-slate-900">
                            {vehicle.vehicle_code} - {vehicle.name}
                        </p>
                    </div>

                    <p className="text-sm text-slate-600">
                        Bạn có chắc muốn xóa xe này khỏi hệ thống không?
                    </p>

                    {error ? (
                        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}