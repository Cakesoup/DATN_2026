import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerApi } from './auth.api.js';

export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name.trim()) return setError('Vui lòng nhập họ tên');
        if (!form.email.trim()) return setError('Vui lòng nhập email');
        if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại');
        if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
        if (form.password !== form.confirm_password) return setError('Xác nhận mật khẩu không khớp');

        setLoading(true);
        setError('');
        try {
            const { confirm_password, ...payload } = form;
            await registerApi(payload);
            toast.success('Đăng ký thành công, vui lòng đăng nhập');
            navigate('/login');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Đăng ký thất bại';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold">Đăng ký</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="full_name" placeholder="Họ và tên" value={form.full_name} onChange={handleChange}
                       className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-400" />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
                       className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-400" />
                <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange}
                       className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-400" />

                <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" value={form.password} onChange={handleChange}
                           className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-emerald-400" />
                    <button type="button" onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <div className="relative">
                    <input name="confirm_password" type={showConfirm ? 'text' : 'password'} placeholder="Xác nhận mật khẩu" value={form.confirm_password} onChange={handleChange}
                           className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-emerald-400" />
                    <button type="button" onClick={() => setShowConfirm((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={loading}
                        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800 disabled:opacity-60">
                    {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-medium text-slate-900">Đăng nhập</Link>
            </p>
        </div>
    );
}