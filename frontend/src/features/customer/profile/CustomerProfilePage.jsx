import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCircle2, KeyRound, CircleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyProfile, updateMyProfile } from './profile.api.js';
import ChangePasswordModal from './components/ChangePasswordModal.jsx';

export default function CustomerProfilePage() {
    const queryClient = useQueryClient();

    const [profileForm, setProfileForm] = useState({ full_name: '', phone: '' });
    const [openPasswordModal, setOpenPasswordModal] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['customer', 'profile'],
        queryFn: getMyProfile,
    });

    const profile = data?.data;

    useEffect(() => {
        if (profile) {
            setProfileForm({ full_name: profile.full_name || '', phone: profile.phone || '' });
        }
    }, [profile]);

    const profileMutation = useMutation({
        mutationFn: () => updateMyProfile(profileForm),
        onSuccess: () => {
            toast.success('Cập nhật hồ sơ thành công');
            queryClient.invalidateQueries({ queryKey: ['staff', 'profile'] });
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Cập nhật hồ sơ thất bại'),
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileMutation.mutate();
    };

    if (isLoading) {
        return <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Đang tải hồ sơ...</div>;
    }

    if (isError) {
        return (
            <div className="flex items-start gap-3 rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>{error?.response?.data?.message || 'Không tải được hồ sơ'}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h1 className="text-2xl font-bold text-slate-900">Hồ sơ của tôi</h1>
                <p className="mt-1 text-sm text-slate-500">Quản lý thông tin cá nhân và mật khẩu.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><UserCircle2 size={18} /></div>
                        <h2 className="text-lg font-semibold text-slate-900">Thông tin cá nhân</h2>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                        <input type="email" value={profile?.email || ''} disabled
                               className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Họ tên</label>
                        <input type="text" value={profileForm.full_name} onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
                        <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                               className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
                    </div>

                    <button type="submit" disabled={profileMutation.isPending}
                            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
                        {profileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </form>

                <div className="space-y-3 self-start rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-100 p-2 text-slate-700"><KeyRound size={18} /></div>
                        <h2 className="text-lg font-semibold text-slate-900">Bảo mật</h2>
                    </div>

                    <p className="text-sm text-slate-500">
                        Để bảo vệ tài khoản, hãy đổi mật khẩu định kỳ và không chia sẻ cho người khác.
                    </p>

                    <button type="button" onClick={() => setOpenPasswordModal(true)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        <KeyRound className="h-4 w-4" />
                        Đổi mật khẩu
                    </button>
                </div>
            </div>

            <ChangePasswordModal open={openPasswordModal} onClose={() => setOpenPasswordModal(false)} />
        </div>
    );
}