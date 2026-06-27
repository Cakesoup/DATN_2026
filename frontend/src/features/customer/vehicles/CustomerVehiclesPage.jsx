import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search, RefreshCcw, CircleAlert, CarFront, BatteryCharging, Star, MapPin } from 'lucide-react';
import { getCustomerVehicles } from './vehicle.api.js';
import BookingModal from './components/BookingModal.jsx';
import { useNavigate } from 'react-router-dom';

const SORT_OPTIONS = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Giá thấp → cao', value: 'price_asc' },
    { label: 'Giá cao → thấp', value: 'price_desc' },
    { label: 'Đánh giá cao', value: 'rating_desc' },
];

const PAGE_SIZE = 9;

function formatMoney(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

export default function CustomerVehiclesPage() {
    const [searchInput, setSearchInput] = useState('');
    const [brand, setBrand] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [openBooking, setOpenBooking] = useState(false);
    const navigate = useNavigate();
    const goDetail = (id) => navigate(`/customer/vehicles/${id}`);

    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        brand: brand || undefined,
        sort_by: sortBy,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['customer', 'vehicles', queryParams],
        queryFn: () => getCustomerVehicles(queryParams),
        placeholderData: keepPreviousData,
    });

    const vehicles = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: vehicles.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được danh sách xe' : '';

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setBrand(searchInput.trim());
    };

    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Thuê xe điện</h1>
                        <p className="mt-1 text-sm text-slate-500">Chọn xe phù hợp và đặt thuê ngay.</p>
                    </div>
                    <button onClick={() => refetch()} disabled={isFetching}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                        <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /> Làm mới
                    </button>
                </div>

                <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                               placeholder="Tìm theo hãng xe..."
                               className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-300" />
                    </div>
                    <select value={sortBy} onChange={(e) => { setCurrentPage(1); setSortBy(e.target.value); }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300">
                        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button type="submit" className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">Tìm kiếm</button>
                </form>
            </div>

            {isLoading ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Đang tải danh sách xe...</div>
            ) : errorMessage ? (
                <div className="flex items-start gap-3 rounded-3xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div>{errorMessage}</div></div>
            ) : vehicles.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center text-sm text-slate-500 ring-1 ring-slate-200">Không có xe phù hợp.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {vehicles.map((v) => (
                            <div key={v.id} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-lg hover:ring-emerald-200">
                                <div className="relative cursor-pointer" onClick={() => goDetail(v.id)}>
                                    {v.image_url ? (
                                        <img src={v.image_url} alt={v.name} className="h-48 w-full object-cover transition group-hover:scale-105" />
                                    ) : (
                                        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-300"><CarFront className="h-14 w-14" /></div>
                                    )}
                                    {v.average_rating != null ? (
                                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-amber-600 shadow-sm backdrop-blur">
                                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {v.average_rating}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="space-y-3 p-5">
                                    <div className="cursor-pointer" onClick={() => goDetail(v.id)}>
                                        <h3 className="font-bold text-slate-900 hover:text-emerald-600">{v.name}</h3>
                                        <p className="text-xs text-slate-500">{v.brand} {v.model ? `· ${v.model}` : ''}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><BatteryCharging className="h-3.5 w-3.5" /> {v.battery_level ?? 0}%</span>
                                        {v.range_km ? <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{v.range_km} km</span> : null}
                                        {v.current_location ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"><MapPin className="h-3.5 w-3.5" /> {v.current_location}</span> : null}
                                    </div>

                                    <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                                        <div>
                                            <div className="text-xl font-extrabold text-emerald-600">{formatMoney(v.effective_price_per_day)}đ</div>
                                            <div className="text-xs text-slate-400">mỗi ngày</div>
                                        </div>
                                        <button onClick={() => goDetail(v.id)}
                                                className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                                            Đặt xe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <button disabled={page <= 1 || isFetching} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Trước</button>
                        <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{page} / {totalPages}</span>
                        <button disabled={page >= totalPages || isFetching} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Sau</button>
                    </div>
                </>
            )}

            <BookingModal open={openBooking} vehicle={selectedVehicle} onClose={() => { setOpenBooking(false); setSelectedVehicle(null); }} />
        </div>
    );
}