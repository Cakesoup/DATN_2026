import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from './auth.api.js';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', phone: '', new_password: '', confirm_password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim()) return setError('Vui lòng nhập email');
        if (!form.phone.trim()) return setError('Vui lòng nhập số điện thoại');
        if (form.new_password.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        if (form.new_password !== form.confirm_password) return setError('Xác nhận mật khẩu không khớp');

        setLoading(true);
        setError('');
        try {
            await forgotPassword({
                email: form.email.trim(),
                phone: form.phone.trim(),
                new_password: form.new_password,
            });
            toast.success('Đặt lại mật khẩu thành công');
            navigate('/login');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Đặt lại mật khẩu thất bại';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900">Quên mật khẩu</h1>
                <p className="mt-2 text-sm text-slate-500">Xác minh bằng email và số điện thoại để đặt lại mật khẩu</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com"
                           className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="09xxxxxxxx"
                           className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
                    <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="new_password" value={form.new_password} onChange={handleChange} placeholder="••••••"
                               className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                        <button type="button" onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                    <input type={showPassword ? 'text' : 'password'} name="confirm_password" value={form.confirm_password} onChange={handleChange} placeholder="••••••"
                           className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                </div>

                {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

                <button type="submit" disabled={loading}
                        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-600">
                Nhớ ra mật khẩu rồi?{' '}
                <Link to="/login" className="font-semibold text-slate-900 hover:underline">Đăng nhập</Link>
            </p>
        </div>
    );
}