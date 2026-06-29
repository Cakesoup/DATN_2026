import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeft, Battery, Zap, Users, Gauge, ShieldCheck, Briefcase, Monitor,
    Settings2, MapPin, Star, CarFront, Check, CircleAlert,
} from 'lucide-react';
import { getCustomerVehicleById } from './vehicle.api.js';
import BookingModal from './components/BookingModal.jsx';

function formatMoney(v) { return Number(v || 0).toLocaleString('vi-VN'); }

function Spec({ icon: Icon, label, value }) {
    if (value == null || value === '') return null;
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Icon size={18} /></div>
            <div>
                <div className="text-xs text-slate-400">{label}</div>
                <div className="text-sm font-semibold text-slate-900">{value}</div>
            </div>
        </div>
    );
}

export default function VehicleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [openBooking, setOpenBooking] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['customer', 'vehicle', id],
        queryFn: () => getCustomerVehicleById(id),
    });

    const vehicle = data?.data;
    const similar = vehicle?.similar || [];
    const reviews = vehicle?.reviews || [];

    if (isLoading) {
        return <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Đang tải chi tiết xe...</div>;
    }
    if (isError || !vehicle) {
        return (
            <div className="flex items-start gap-3 rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>{error?.response?.data?.message || 'Không tìm thấy xe'}</div>
            </div>
        );
    }

    const available = !vehicle.is_rented;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Ảnh + thông số */}
                <div className="lg:col-span-3">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                        {vehicle.image_url ? (
                            <img src={vehicle.image_url} alt={vehicle.name} className="h-80 w-full object-cover" />
                        ) : (
                            <div className="flex h-80 w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-300"><CarFront size={80} /></div>
                        )}
                    </div>
                </div>

                {/* Tên + giá + nút đặt */}
                <div className="lg:col-span-2">
                    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900">{vehicle.name}</h1>
                                <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                                    available ? 'bg-emerald-100 text-emerald-700' : String(vehicle.status).toLowerCase() === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                }`}>
    {available ? 'Còn xe' : String(vehicle.status).toLowerCase() === 'maintenance' ? 'Bảo trì' : 'Hết xe'}
</span>
                                <p className="text-sm text-slate-500">{vehicle.brand} {vehicle.model ? `· ${vehicle.model}` : ''}</p>
                            </div>
                            {vehicle.average_rating != null ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-600">
                                    <Star size={14} className="fill-amber-500 text-amber-500" /> {vehicle.average_rating}
                                </span>
                            ) : null}
                        </div>

                        <div className="mt-4 flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-emerald-600">{formatMoney(vehicle.effective_price_per_day)}đ</span>
                            <span className="text-slate-400">/ngày</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-500">{formatMoney(vehicle.effective_price_per_hour)}đ/giờ</div>

                        <button
                            onClick={() => setOpenBooking(true)}
                            disabled={!available}
                            className="mt-5 w-full rounded-2xl bg-emerald-500 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {available ? 'Đặt xe ngay' : 'Xe tạm hết'}
                        </button>

                        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2"><MapPin size={15} className="text-slate-400" /> {vehicle.current_location || 'Hà Nội'}</div>
                            <div className="flex items-center gap-2"><Battery size={15} className="text-slate-400" /> Pin hiện tại {vehicle.battery_level ?? 0}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông số kỹ thuật */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="mb-5 text-lg font-bold text-slate-900">Thông số kỹ thuật</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Spec icon={Users} label="Số chỗ" value={vehicle.seats ? `${vehicle.seats} chỗ` : null} />
                    <Spec icon={Gauge} label="Tầm hoạt động" value={vehicle.max_range_km ? `${vehicle.max_range_km} km` : (vehicle.range_km ? `${vehicle.range_km} km` : null)} />
                    <Spec icon={Settings2} label="Hộp số" value={vehicle.transmission} />
                    <Spec icon={Zap} label="Công suất" value={vehicle.power_hp ? `${vehicle.power_hp} HP` : null} />
                    <Spec icon={ShieldCheck} label="Túi khí" value={vehicle.airbags != null ? `${vehicle.airbags} túi khí` : null} />
                    <Spec icon={Briefcase} label="Cốp" value={vehicle.trunk_capacity ? `${vehicle.trunk_capacity}L` : null} />
                    <Spec icon={Monitor} label="Màn hình" value={vehicle.screen_size} />
                    <Spec icon={Settings2} label="La-zăng" value={vehicle.wheel_size} />
                    <Spec icon={Gauge} label="Giới hạn/ngày" value={vehicle.daily_limit_km ? `${vehicle.daily_limit_km} km/ngày` : null} />
                </div>

                {vehicle.description ? (
                    <div className="mt-6 border-t border-slate-100 pt-5">
                        <h3 className="mb-2 font-semibold text-slate-900">Mô tả</h3>
                        <p className="whitespace-pre-wrap text-sm text-slate-600">{vehicle.description}</p>
                    </div>
                ) : null}

                {vehicle.amenities ? (
                    <div className="mt-6 border-t border-slate-100 pt-5">
                        <h3 className="mb-3 font-semibold text-slate-900">Tiện nghi khác</h3>
                        <div className="flex flex-wrap gap-2">
                            {vehicle.amenities.split(',').map((a, i) => a.trim() ? (
                                <span key={i} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                    <Check size={14} className="text-emerald-500" /> {a.trim()}
                                </span>
                            ) : null)}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Điều kiện thuê xe */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="mb-5 text-lg font-bold text-slate-900">Điều kiện thuê xe</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-5">
                        <h3 className="mb-2 font-semibold text-slate-900">Thông tin cần có khi nhận xe</h3>
                        <ul className="space-y-1.5 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> CCCD hoặc Hộ chiếu còn thời hạn</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Bằng lái hợp lệ, còn thời hạn</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-5">
                        <h3 className="mb-2 font-semibold text-slate-900">Hình thức thanh toán & đặt cọc</h3>
                        <ul className="space-y-1.5 text-sm text-slate-600">
                            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Trả trước, thanh toán khi nhận xe</li>
                            <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Đặt cọc giữ xe theo gói dịch vụ đã chọn</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Đánh giá */}
            {reviews.length > 0 ? (
                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="mb-5 text-lg font-bold text-slate-900">Đánh giá từ khách thuê</h2>
                    <div className="space-y-4">
                        {reviews.slice(0, 5).map((r) => (
                            <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900">{r.users?.full_name || 'Khách hàng'}</span>
                                    <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-amber-500 text-amber-500" />)}
                                    </span>
                                </div>
                                {r.comment ? <p className="mt-1 text-sm text-slate-600">{r.comment}</p> : null}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Xe tương tự */}
            {similar.length > 0 ? (
                <div>
                    <h2 className="mb-4 text-lg font-bold text-slate-900">Xe tương tự</h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {similar.map((v) => (
                            <Link key={v.id} to={`/customer/vehicles/${v.id}`}
                                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
                                {v.image_url ? (
                                    <img src={v.image_url} alt={v.name} className="h-36 w-full object-cover" />
                                ) : (
                                    <div className="flex h-36 w-full items-center justify-center bg-slate-100 text-slate-300"><CarFront size={40} /></div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900">{v.name}</h3>
                                    <div className="mt-1 text-emerald-600">
                                        <span className="font-bold">{formatMoney(v.effective_price_per_day)}đ</span>
                                        <span className="text-xs text-slate-400">/ngày</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : null}

            <BookingModal open={openBooking} vehicle={vehicle} onClose={() => setOpenBooking(false)} />
        </div>
    );
}