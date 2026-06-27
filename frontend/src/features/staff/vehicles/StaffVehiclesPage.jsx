import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search, RefreshCcw, CircleAlert, CarFront, Settings2, Plus, Pencil, Trash2 } from 'lucide-react';
import { getStaffVehicles } from './vehicle.staff.api.js';
import UpdateVehicleStatusModal from './components/UpdateVehicleStatusModal.jsx';
import VehicleFormModal from './components/VehicleFormModal.jsx';
import DeleteVehicleModal from './components/DeleteVehicleModal.jsx';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Sẵn sàng', value: 'available' },
    { label: 'Đã đặt', value: 'reserved' },
    { label: 'Chờ bàn giao', value: 'handover_pending' },
    { label: 'Đang sử dụng', value: 'in_use' },
    { label: 'Bảo trì', value: 'maintenance' },
];

const PAGE_SIZE = 10;

function getStatusBadge(status) {
    const v = String(status || '').toLowerCase();
    if (v === 'available') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    if (v === 'reserved') return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    if (v === 'handover_pending') return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    if (v === 'in_use') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    if (v === 'maintenance') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function getStatusLabel(status) {
    return STATUS_OPTIONS.find((o) => o.value === String(status || '').toLowerCase())?.label || status || 'Không rõ';
}

export default function StaffVehiclesPage() {
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [formVehicle, setFormVehicle] = useState(null);
    const [openForm, setOpenForm] = useState(false);
    const [deleteVehicle, setDeleteVehicle] = useState(null);

    const queryParams = {
        page: currentPage,
        limit: PAGE_SIZE,
        status: statusFilter === 'all' ? undefined : statusFilter,
        keyword: keyword || undefined,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['staff', 'vehicles', queryParams],
        queryFn: () => getStaffVehicles(queryParams),
        placeholderData: keepPreviousData,
    });

    const vehicles = data?.data || [];
    const pagination = data?.pagination || { page: currentPage, limit: PAGE_SIZE, total: vehicles.length, totalPages: 1 };
    const errorMessage = isError ? error?.response?.data?.message || 'Không tải được danh sách xe' : '';

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setKeyword(searchInput.trim());
    };

    const totalPages = pagination.totalPages || 1;
    const page = pagination.page || currentPage;

    return (
        <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Danh sách xe</h1>
                        <p className="mt-1 text-sm text-slate-500">Xem thông tin xe và cập nhật trạng thái khi cần.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => refetch()} disabled={isFetching}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                        <button onClick={() => { setFormVehicle(null); setOpenForm(true); }}
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                            <Plus className="h-4 w-4" /> Thêm xe
                        </button>
                    </div>

                </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                               placeholder="Tìm theo mã, tên, model..."
                               className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-slate-300" />
                    </div>
                    <select value={statusFilter} onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value); }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-slate-300">
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button type="submit" className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">Tìm kiếm</button>
                </form>

                {isLoading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Đang tải danh sách xe...</div>
                ) : errorMessage ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
                        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /><div>{errorMessage}</div>
                    </div>
                ) : (
                    <>
                        <div className="mt-5 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                <tr className="text-left text-sm font-semibold text-slate-600">
                                    <th className="px-4 py-3">Ảnh</th>
                                    <th className="px-4 py-3">Mã xe</th>
                                    <th className="px-4 py-3">Tên xe</th>
                                    <th className="px-4 py-3">Hãng</th>
                                    <th className="px-4 py-3">Pin</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Hành động</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {vehicles.length > 0 ? vehicles.map((v) => (
                                    <tr key={v.id} className="text-sm text-slate-700">
                                        <td className="px-4 py-4">
                                            {v.image_url ? (
                                                <img src={v.image_url} alt={v.name} className="h-12 w-16 rounded-lg object-cover ring-1 ring-slate-200" />
                                            ) : (
                                                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><CarFront className="h-5 w-5" /></div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-semibold text-slate-900">{v.vehicle_code}</td>
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900">{v.name}</div>
                                            <div className="text-xs text-slate-500">{v.model || '---'}</div>
                                        </td>
                                        <td className="px-4 py-4">{v.brand}</td>
                                        <td className="px-4 py-4">{v.battery_level ?? 0}%</td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(v.status)}`}>{getStatusLabel(v.status)}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => { setFormVehicle(v); setOpenForm(true); }}
                                                        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50" title="Sửa">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => { setSelectedVehicle(v); setOpenModal(true); }}
                                                        className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50" title="Đổi trạng thái">
                                                    <Settings2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setDeleteVehicle(v)}
                                                        className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50" title="Xóa">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">Không tìm thấy xe phù hợp.</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>Trang {page} / {totalPages} — Tổng {pagination.total || 0} xe</div>
                            <div className="flex items-center gap-2">
                                <button disabled={page <= 1 || isFetching} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Trước</button>
                                <span className="rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700">{page}</span>
                                <button disabled={page >= totalPages || isFetching} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Sau</button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <UpdateVehicleStatusModal open={openModal} vehicle={selectedVehicle} onClose={() => { setOpenModal(false); setSelectedVehicle(null); }} />
            <VehicleFormModal open={openForm} vehicle={formVehicle} onClose={() => { setOpenForm(false); setFormVehicle(null); }} />
            <DeleteVehicleModal open={Boolean(deleteVehicle)} vehicle={deleteVehicle} onClose={() => setDeleteVehicle(null)} />
        </div>
    );
}