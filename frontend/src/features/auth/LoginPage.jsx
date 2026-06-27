import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from './auth.api.js';
import { useAuthStore } from './auth.store.js';

export default function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(form);
            setAuth(data);
            toast.success('Đăng nhập thành công');
            const role = data?.user?.role;
            if (role === 'admin' || role === 'manager') navigate('/admin/vehicles');
            else if (role === 'staff') navigate('/staff/vehicles');
            else navigate('/customer/vehicles');
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900">Đăng nhập</h1>
                <p className="mt-2 text-sm text-slate-500">Chào mừng bạn quay lại hệ thống EV Rental</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        />
                        <button type="button" onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="mt-2 text-right">
                        <Link to="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Quên mật khẩu?</Link>
                    </div>
                </div>

                {error ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                ) : null}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-semibold text-slate-900 hover:underline">Đăng ký</Link>
            </p>
        </div>
    );
}