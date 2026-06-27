const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['handover_pending', 'cancelled'],
    handover_pending: ['in_progress', 'cancelled'],
    in_progress: ['completed'],
    completed: ['invoiced'],
    invoiced: [],
    cancelled: []
};

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'handover_pending', 'in_progress'];

const getAllBookings = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { booking_status, user_id, vehicle_id, keyword } = req.query;

        // Điều kiện dùng chung cho cả list và summary (KHÔNG gồm booking_status)
        const baseWhere = {};

        if (user_id) {
            baseWhere.user_id = BigInt(user_id);
        }

        if (vehicle_id) {
            baseWhere.vehicle_id = BigInt(vehicle_id);
        }

        if (keyword) {
            baseWhere.OR = [
                { booking_code: { contains: keyword, mode: 'insensitive' } },
                { users: { full_name: { contains: keyword, mode: 'insensitive' } } },
                { vehicles: { name: { contains: keyword, mode: 'insensitive' } } },
                { vehicles: { vehicle_code: { contains: keyword, mode: 'insensitive' } } }
            ];
        }

        // where cho list = baseWhere + filter status (nếu có)
        const where = { ...baseWhere };
        if (booking_status) {
            where.booking_status = booking_status;
        }

        const [total, bookings, grouped] = await Promise.all([
            prisma.bookings.count({ where }),
            prisma.bookings.findMany({
                where,
                include: {
                    users: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            phone: true,
                            role: true
                        }
                    },
                    vehicles: {
                        include: {
                            pricing_plans: true
                        }
                    },
                    invoices: true,
                    reviews: true
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            prisma.bookings.groupBy({
                by: ['booking_status'],
                where: baseWhere,
                _count: { _all: true }
            })
        ]);

        const summary = {
            all: 0,
            pending: 0,
            confirmed: 0,
            handover_pending: 0,
            in_progress: 0,
            completed: 0,
            invoiced: 0,
            cancelled: 0
        };

        for (const row of grouped) {
            const count = row._count._all;
            summary.all += count;
            if (summary[row.booking_status] !== undefined) {
                summary[row.booking_status] = count;
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách booking thành công',
            data: serializeBigInt(bookings),
            pagination: buildPagination(page, limit, total),
            summary
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getBookingByIdForAdmin = async (req, res) => {
    try {
        const bookingId = BigInt(req.params.id);

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                users: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                        phone: true,
                        role: true
                    }
                },
                vehicles: {
                    include: {
                        pricing_plans: true
                    }
                },
                invoices: true,
                reviews: true
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết booking thành công',
            data: serializeBigInt(booking)
        });
    } catch (error) {
        console.error('Get booking by id for admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateBookingStatusByAdmin = async (req, res) => {
    try {
        const bookingId = BigInt(req.params.id);
        const { booking_status } = req.body;

        if (!booking_status) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu booking_status'
            });
        }

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }

        const allowedNextStatuses = TRANSITIONS[booking.booking_status] || [];
        if (!allowedNextStatuses.includes(booking_status)) {
            return res.status(400).json({
                success: false,
                message: `Không thể chuyển từ ${booking.booking_status} sang ${booking_status}`
            });
        }

        const updatedBooking = await prisma.$transaction(async (tx) => {
            const nextBooking = await tx.bookings.update({
                where: { id: bookingId },
                data: { booking_status }
            });

            if (['confirmed', 'handover_pending'].includes(booking_status)) {
                await tx.vehicles.update({
                    where: { id: booking.vehicle_id },
                    data: { status: 'reserved' }
                });
            }

            if (booking_status === 'in_progress') {
                await tx.vehicles.update({
                    where: { id: booking.vehicle_id },
                    data: { status: 'in_use' }
                });
            }

            if (booking_status === 'completed') {
                const anotherActive = await tx.bookings.findFirst({
                    where: {
                        vehicle_id: booking.vehicle_id,
                        id: { not: bookingId },
                        booking_status: { in: ACTIVE_BOOKING_STATUSES }
                    }
                });

                await tx.vehicles.update({
                    where: { id: booking.vehicle_id },
                    data: { status: anotherActive ? 'reserved' : 'available' }
                });
            }

            if (booking_status === 'cancelled') {
                const anotherActive = await tx.bookings.findFirst({
                    where: {
                        vehicle_id: booking.vehicle_id,
                        id: { not: bookingId },
                        booking_status: { in: ACTIVE_BOOKING_STATUSES }
                    }
                });

                await tx.vehicles.update({
                    where: { id: booking.vehicle_id },
                    data: { status: anotherActive ? 'reserved' : 'available' }
                });
            }

            return nextBooking;
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái booking thành công',
            data: serializeBigInt(updatedBooking)
        });
    } catch (error) {
        console.error('Update booking status by admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getAllBookings,
    getBookingByIdForAdmin,
    updateBookingStatusByAdmin
};