import { useEffect, useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { updateAdminVehicle } from '../admin.api.js';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/common/ImageUploader.jsx';

const STATUS_OPTIONS = [
    { label: 'Sẵn sàng', value: 'available' },
    { label: 'Đã đặt', value: 'reserved' },
    { label: 'Chờ bàn giao', value: 'handover_pending' },
    { label: 'Đang sử dụng', value: 'in_use' },
    { label: 'Bảo trì', value: 'maintenance' },
];

const initialForm = {
    vehicle_code: '',
    name: '',
    brand: '',
    model: '',
    battery_level: '',
    range_km: '',
    price_per_hour: '',
    price_per_day: '',
    status: 'available',
    current_location: '',
    description: '',
    image_url: '',
};

export default function EditVehicleModal({ open, onClose, onUpdated, vehicle }) {
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (vehicle && open) {
            setForm({
                vehicle_code: vehicle.vehicle_code || '',
                name: vehicle.name || '',
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                battery_level: vehicle.battery_level ?? '',
                range_km: vehicle.range_km ?? '',
                price_per_hour: vehicle.price_per_hour ?? '',
                price_per_day: vehicle.price_per_day ?? '',
                status: vehicle.status || 'available',
                current_location: vehicle.current_location || '',
                description: vehicle.description || '',
                image_url: vehicle.image_url || '',
            });
        }
    }, [vehicle, open]);

    if (!open || !vehicle) return null;

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await updateAdminVehicle(vehicle.id, {
                ...form,
                battery_level: form.battery_level === '' ? undefined : Number(form.battery_level),
                range_km: form.range_km === '' ? undefined : Number(form.range_km),
                price_per_hour: form.price_per_hour === '' ? undefined : Number(form.price_per_hour),
                price_per_day: form.price_per_day === '' ? undefined : Number(form.price_per_day),
            });

            toast.success('Cập nhật xe thành công');
            onUpdated?.();
            onClose?.();
        } catch (err) {
            const message = err?.response?.data?.message || 'Cập nhật xe thất bại';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2">
                            <Pencil className="h-5 w-5 text-slate-700" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Chỉnh sửa xe</h2>
                            <p className="text-sm text-slate-500">Chỉnh sửa thông tin xe trong hệ thống.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
                    {error && (
                        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input
                            name="vehicle_code"
                            value={form.vehicle_code}
                            onChange={handleChange}
                            placeholder="Mã xe"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                            required
                        />
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Tên xe"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                            required
                        />
                        <input
                            name="brand"
                            value={form.brand}
                            onChange={handleChange}
                            placeholder="Hãng xe"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                            required
                        />
                        <input
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            placeholder="Model"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                        />
                        <input
                            name="battery_level"
                            type="number"
                            value={form.battery_level}
                            onChange={handleChange}
                            placeholder="Pin (%)"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                        />
                        <input
                            name="range_km"
                            type="number"
                            value={form.range_km}
                            onChange={handleChange}
                            placeholder="Tầm chạy (km)"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                        />
                        <input
                            name="price_per_hour"
                            type="number"
                            value={form.price_per_hour}
                            onChange={handleChange}
                            placeholder="Giá/giờ"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                        />
                        <input
                            name="price_per_day"
                            type="number"
                            value={form.price_per_day}
                            onChange={handleChange}
                            placeholder="Giá/ngày"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                        />
                        <input
                            name="current_location"
                            value={form.current_location}
                            onChange={handleChange}
                            placeholder="Vị trí hiện tại"
                            className="h-11 rounded-xl border border-slate-200 px-4"
                        />

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="h-11 rounded-xl border border-slate-200 bg-white px-4"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Ảnh xe</label>
                        <ImageUploader
                            value={form.image_url}
                            onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
                        />
                    </div>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Mô tả"
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}