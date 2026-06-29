import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CarFront } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStaffVehicle, updateStaffVehicle } from '../vehicle.staff.api.js';
import ImageUploader from '@/components/common/ImageUploader.jsx';


const EMPTY_FORM = {
    vehicle_code: '',
    name: '',
    brand: '',
    model: '',
    battery_level: '',
    range_km: '',
    price_per_hour: '',
    price_per_day: '',
    current_location: '',
    description: '',
    image_url: '',
};

export default function VehicleFormModal({ open, vehicle, onClose }) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(vehicle);

    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        if (vehicle) {
            setForm({
                vehicle_code: vehicle.vehicle_code || '',
                name: vehicle.name || '',
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                battery_level: vehicle.battery_level ?? '',
                range_km: vehicle.range_km ?? '',
                price_per_hour: vehicle.price_per_hour ?? '',
                price_per_day: vehicle.price_per_day ?? '',
                current_location: vehicle.current_location || '',
                description: vehicle.description || '',
                image_url: vehicle.image_url || '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setError('');
    }, [open, vehicle]);

    const mutation = useMutation({
        mutationFn: () => {
            const payload = {
                ...form,
                battery_level: form.battery_level === '' ? undefined : Number(form.battery_level),
                range_km: form.range_km === '' ? undefined : Number(form.range_km),
                price_per_hour: form.price_per_hour === '' ? undefined : Number(form.price_per_hour),
                price_per_day: form.price_per_day === '' ? undefined : Number(form.price_per_day),
            };
            return isEdit ? updateStaffVehicle(vehicle.id, payload) : createStaffVehicle(payload);
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Cập nhật xe thành công' : 'Tạo xe thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'vehicles'] });
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Lưu xe thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open) return null;

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.vehicle_code.trim()) return setError('Vui lòng nhập mã xe');
        if (!form.name.trim()) return setError('Vui lòng nhập tên xe');
        if (!form.brand.trim()) return setError('Vui lòng nhập hãng xe');
        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-slate-100 p-2"><CarFront className="h-5 w-5 text-slate-700" /></div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{isEdit ? 'Chỉnh sửa xe' : 'Tạo xe mới'}</h2>
                            <p className="text-sm text-slate-500">{isEdit ? 'Cập nhật thông tin xe.' : 'Nhập thông tin xe vào hệ thống.'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
                    {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <input value={form.vehicle_code} onChange={(e) => setField('vehicle_code', e.target.value)} placeholder="Mã xe" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Tên xe" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input value={form.brand} onChange={(e) => setField('brand', e.target.value)} placeholder="Hãng xe" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input value={form.model} onChange={(e) => setField('model', e.target.value)} placeholder="Model" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input type="number" value={form.battery_level} onChange={(e) => setField('battery_level', e.target.value)} placeholder="Pin (%)" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input type="number" value={form.range_km} onChange={(e) => setField('range_km', e.target.value)} placeholder="Tầm chạy (km)" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input type="number" value={form.price_per_hour} onChange={(e) => setField('price_per_hour', e.target.value)} placeholder="Giá/giờ" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input type="number" value={form.price_per_day} onChange={(e) => setField('price_per_day', e.target.value)} placeholder="Giá/ngày" className="h-11 rounded-xl border border-slate-200 px-4" />
                        <input value={form.current_location} onChange={(e) => setField('current_location', e.target.value)} placeholder="Vị trí hiện tại" className="h-11 rounded-xl border border-slate-200 px-4" />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Ảnh xe</label>
                        <ImageUploader value={form.image_url} onChange={(url) => setField('image_url', url)} />
                    </div>

                    <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Mô tả" rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3" />

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">Hủy</button>
                        <button type="submit" disabled={mutation.isPending} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
                            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo xe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}