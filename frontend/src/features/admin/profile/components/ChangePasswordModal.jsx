import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { changeMyPassword } from '../profile.admin.api.js';

const EMPTY_FORM = { current_password: '', new_password: '', confirm_password: '' };

export default function ChangePasswordModal({ open, onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setForm(EMPTY_FORM);
            setError('');
        }
    }, [open]);

    const mutation = useMutation({
        mutationFn: () => changeMyPassword({
            current_password: form.current_password,
            new_password: form.new_password,
        }),
        onSuccess: () => {
            toast.success('Đổi mật khẩu thành công');
            onClose?.();
        },
        onError: (err) => {
            const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại';
            setError(msg);
            toast.error(msg);
        },
    });

    if (!open) return null;

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.current_password) return setError('Vui lòng nhập mật khẩu hiện tại');
        if (form.new_password.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        if (form.new_password !== form.confirm_password) return setError('Xác nhận mật khẩu không khớp');
        setError('');
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700">
                            <KeyRound size={18} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Đổi mật khẩu</h2>
                            <p className="text-sm text-slate-500">Nhập mật khẩu hiện tại và mật khẩu mới.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                        <input type="password" value={form.current_password} onChange={(e) => setField('current_password', e.target.value)}
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
                        <input type="password" value={form.new_password} onChange={(e) => setField('new_password', e.target.value)}
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                        <input type="password" value={form.confirm_password} onChange={(e) => setField('confirm_password', e.target.value)}
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                    </div>

                    {error ? (
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
                    ) : null}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                            Hủy
                        </button>
                        <button type="submit" disabled={mutation.isPending}
                                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                            {mutation.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}