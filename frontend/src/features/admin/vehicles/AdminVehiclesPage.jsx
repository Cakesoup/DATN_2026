import { useEffect, useMemo, useState } from 'react';
import {
    Pencil,
    Trash2,
    Plus,
    Search,
    CarFront,
    BatteryCharging,
    Gauge,
    CircleAlert,
    RefreshCcw,
} from 'lucide-react';
import { getAdminVehicles } from './admin.api.js';
import CreateVehicleModal from '@/features/admin/vehicles/components/CreateVehicleModal.jsx';
import EditVehicleModal from '@/features/admin/vehicles/components/EditVehicleModal.jsx';
import DeleteVehicleModal from '@/features/admin/vehicles/components/DeleteVehicleModal.jsx';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Sẵn sàng', value: 'available' },
    { label: 'Đã đặt', value: 'reserved' },
    { label: 'Chờ bàn giao', value: 'handover_pending' },
    { label: 'Đang sử dụng', value: 'in_use' },
    { label: 'Bảo trì', value: 'maintenance' },
];

function getStatusBadge(status) {
    const value = String(status || '').toLowerCase();

    if (value === 'available') {
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    }

    if (value === 'reserved') {
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    }

    if (value === 'handover_pending') {
        return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    }

    if (value === 'in_use') {
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    }

    if (value === 'maintenance') {
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    }

    return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function getStatusLabel(status) {
    const value = String(status || '').toLowerCase();

    if (value === 'available') return 'Sẵn sàng';
    if (value === 'reserved') return 'Đã đặt';
    if (value === 'handover_pending') return 'Chờ bàn giao';
    if (value === 'in_use') return 'Đang sử dụng';
    if (value === 'maintenance') return 'Bảo trì';

    return status || 'Không rõ';
}

export default function AdminVehiclesPage() {
    const [search, setSearch] = useState('');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getAdminVehicles();
            setVehicles(res?.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Không tải được danh sách xe');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortBy]);

    const filteredVehicles = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        const result = vehicles.filter((vehicle) => {
            const matchKeyword =
                String(vehicle.vehicle_code || '').toLowerCase().includes(keyword) ||
                String(vehicle.name || '').toLowerCase().includes(keyword) ||
                String(vehicle.brand || '').toLowerCase().includes(keyword) ||
                String(vehicle.model || '').toLowerCase().includes(keyword);

            const matchStatus =
                statusFilter === 'all' ||
                String(vehicle.status || '').toLowerCase() === statusFilter;

            return matchKeyword && matchStatus;
        });

        if (sortBy === 'price_asc') {
            result.sort((a, b) => Number(a.price_per_day) - Number(b.price_per_day));
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => Number(b.price_per_day) - Number(a.price_per_day));
        } else if (sortBy === 'name_asc') {
            result.sort((a, b) =>
                String(a.name || '').localeCompare(String(b.name || ''))
            );
        } else {
            result.sort((a, b) => Number(b.id) - Number(a.id));
        }

        return result;
    }, [vehicles, search, statusFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage));

    const paginatedVehicles = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredVehicles.slice(start, end);
    }, [filteredVehicles, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const availableCount = vehicles.filter(
        (v) => String(v.status || '').toLowerCase() === 'available'
    ).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-900 p-3 text-white">
                            <CarFront className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Quản lý xe điện</h1>
                            <p className="text-sm text-slate-500">
                                Danh sách xe điện trong hệ thống EV Rental.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setOpenCreateModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    <Plus className="h-4 w-4" />
                    Thêm xe mới
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Tổng số xe</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{vehicles.length}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                            <CarFront className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Đang sẵn sàng</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-600">{availableCount}</p>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                            <BatteryCharging className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Kết quả tìm thấy</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{filteredVehicles.length}</p>
                        </div>
                        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                            <Gauge className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Hiển thị {filteredVehicles.length} xe</h2>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Tìm theo mã, tên, hãng, model..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-slate-300 md:w-80"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="name_asc">Tên A-Z</option>
                            <option value="price_asc">Giá thấp đến cao</option>
                            <option value="price_desc">Giá cao đến thấp</option>
                        </select>

                        <button
                            onClick={fetchVehicles}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Làm mới
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-500">
                        Đang tải danh sách xe...
                    </div>
                ) : error ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
                        <CircleAlert className="mt-0.5 h-5 w-5" />
                        <div>{error}</div>
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
                                    <th className="px-4 py-3">Tầm chạy</th>
                                    <th className="px-4 py-3">Giá/ngày</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Hành động</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {paginatedVehicles.length > 0 ? (
                                    paginatedVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="text-sm text-slate-700">
                                            <td className="px-4 py-4">
                                                {vehicle.image_url ? (
                                                    <img
                                                        src={vehicle.image_url}
                                                        alt={vehicle.name}
                                                        className="h-12 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                                        <CarFront className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-slate-900">
                                                {vehicle.vehicle_code}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-slate-900">{vehicle.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {vehicle.model || 'Chưa có model'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">{vehicle.brand}</td>
                                            <td className="px-4 py-4">
                                                {vehicle.battery_level ?? 0}%
                                            </td>
                                            <td className="px-4 py-4">
                                                {vehicle.range_km ?? 0} km
                                            </td>
                                            <td className="px-4 py-4 font-medium">
                                                {Number(vehicle.price_per_day || 0).toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className="px-4 py-4">
                          <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(vehicle.status)}`}
                          >
                            {getStatusLabel(vehicle.status)}
                          </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedVehicle(vehicle);
                                                            setOpenEditModal(true);
                                                        }}
                                                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedVehicle(vehicle);
                                                            setOpenDeleteModal(true);
                                                        }}
                                                        className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                                            Không tìm thấy xe phù hợp.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                            <div>
                                Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
                                {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} /{' '}
                                {filteredVehicles.length} xe
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                    className="rounded-xl border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <span className="px-2 font-medium text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                    className="rounded-xl border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <CreateVehicleModal
                open={openCreateModal}
                onClose={() => setOpenCreateModal(false)}
                onCreated={fetchVehicles}
            />

            <EditVehicleModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUpdated={fetchVehicles}
                vehicle={selectedVehicle}
            />

            <DeleteVehicleModal
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                onDeleted={fetchVehicles}
                vehicle={selectedVehicle}
            />
        </div>
    );
}