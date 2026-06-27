import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAdminUser, updateAdminUser } from '../user.admin.api.js';

const ROLE_OPTIONS = [
    { label: 'Khách hàng', value: 'customer' },
    { label: 'Nhân viên', value: 'staff' },
    { label: 'Quản trị viên', value: 'admin' },
];

const EMPTY_FORM = {
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    is_active: true,
};

export default function UserFormModal({ open, user, onClose }) {
    const queryClient = useQueryClient();
    const isEdit = Boolean(user);

    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;

        if (user) {
            setForm({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                password: '',
                role: user.role || 'customer',
                is_active: user.is_active ?? true,
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setError('');
    }, [open, user]);

    const mutation = useMutation({
        mutationFn: () => {
            if (isEdit) {
                const payload = {
                    full_name: form.full_name.trim(),
                    phone: form.phone.trim(),
                    role: form.role,
                    is_active: form.is_active,
                };
                if (form.password.trim()) {
                    payload.password = form.password.trim();
                }
                return updateAdminUser(user.id, payload);
            }
            return createAdminUser({
                full_name: form.full_name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password.trim(),
                role: form.role,
                is_active: form.is_active,
            });
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Cập nhật người dùng thành công' : 'Tạo người dùng thành công');
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            onClose?.();
        },
        onError: (err) => {
            const message = err?.response?.data?.message || 'Lưu người dùng thất bại';
            setError(message);
            toast.error(message);
        },
    });

    if (!open) return null;

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.full_name.trim()) return setError('Vui lòng nhập họ tên');
        if (!isEdit && !form.email.trim()) return setError('Vui lòng nhập email');
        if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại');
        if (!isEdit && !form.password.trim()) return setError('Vui lòng nhập mật khẩu');

        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                            <UserCog size={18} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {isEdit ? 'Email không thể thay đổi.' : 'Tạo tài khoản mới cho hệ thống.'}
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

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Họ tên</label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setField('full_name', e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                disabled={isEdit}
                                onChange={(e) => setField('email', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={(e) => setField('phone', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                placeholder="09xxxxxxxx"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Mật khẩu {isEdit ? '(để trống nếu không đổi)' : ''}
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setField('password', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                placeholder="••••••"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Vai trò</label>
                            <select
                                value={form.role}
                                onChange={(e) => setField('role', e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) => setField('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-700">Kích hoạt tài khoản</span>
                    </label>

                    {error ? (
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
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
                            disabled={mutation.isPending}
                            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                        >
                            {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo người dùng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}