const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'handover_pending', 'in_progress'];

const getPendingHandoverBookings = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { booking_status, keyword } = req.query;

        const where = {
            booking_status: booking_status
                ? booking_status
                : {
                    in: ['confirmed', 'handover_pending']
                }
        };

        if (keyword) {
            where.OR = [
                { booking_code: { contains: keyword, mode: 'insensitive' } },
                {
                    users: {
                        full_name: { contains: keyword, mode: 'insensitive' }
                    }
                },
                {
                    vehicles: {
                        name: { contains: keyword, mode: 'insensitive' }
                    }
                },
                {
                    vehicles: {
                        vehicle_code: { contains: keyword, mode: 'insensitive' }
                    }
                }
            ];
        }

        const [total, bookings] = await Promise.all([
            prisma.bookings.count({ where }),
            prisma.bookings.findMany({
                where,
                include: {
                    users: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true,
                            phone: true
                        }
                    },
                    vehicles: {
                        include: {
                            pricing_plans: true
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách booking chờ bàn giao thành công',
            data: serializeBigInt(bookings),
            pagination: buildPagination(page, limit, total)
        });
    } catch (error) {
        console.error('Get pending handover bookings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const confirmHandover = async (req, res) => {
    try {
        const bookingId = BigInt(req.params.id);
        const { handover_battery, handover_odo, handover_note } = req.body;

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
        }

        if (!['confirmed', 'handover_pending'].includes(booking.booking_status)) {
            return res.status(400).json({
                success: false,
                message: 'Booking không ở trạng thái có thể bàn giao'
            });
        }

        const updatedBooking = await prisma.$transaction(async (tx) => {
            const nextBooking = await tx.bookings.update({
                where: { id: bookingId },
                data: {
                    booking_status: 'in_progress',
                    handover_battery: handover_battery !== undefined ? Number(handover_battery) : null,
                    handover_odo: handover_odo !== undefined ? Number(handover_odo) : null,
                    handover_note: handover_note ?? null,
                    handover_at: new Date()
                }
            });

            await tx.vehicles.update({
                where: { id: booking.vehicle_id },
                data: { status: 'in_use' }
            });

            return nextBooking;
        });

        return res.status(200).json({
            success: true,
            message: 'Bàn giao xe thành công',
            data: serializeBigInt(updatedBooking)
        });
    } catch (error) {
        console.error('Confirm handover error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

const confirmReturn = async (req, res) => {
    try {
        const bookingId = BigInt(req.params.id);
        const {
            vehicle_status_after_return,
            return_battery,
            return_odo,
            has_damage,
            damage_note,
            note
        } = req.body;

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId },
            include: { vehicles: { include: { pricing_plans: true } } }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
        }

        if (booking.booking_status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Booking không ở trạng thái đang sử dụng'
            });
        }

        // Tính phí trả muộn: giá/giờ × số giờ trễ (làm tròn lên)
        const now = new Date();
        const endAt = new Date(booking.end_at);
        let isLate = false;
        let lateHours = 0;
        let lateFee = 0;

        if (now > endAt) {
            isLate = true;
            const diffMs = now - endAt;
            lateHours = Math.ceil(diffMs / (1000 * 60 * 60));
            const pricePerHour = Number(
                booking.vehicles?.pricing_plans?.price_per_hour ??
                booking.vehicles?.price_per_hour ??
                0
            );
            lateFee = pricePerHour * lateHours;
        }

        const requestedStatus = ['available', 'maintenance'].includes(vehicle_status_after_return)
            ? vehicle_status_after_return
            : 'available';

        const updatedBooking = await prisma.$transaction(async (tx) => {
            const nextBooking = await tx.bookings.update({
                where: { id: bookingId },
                data: {
                    booking_status: 'completed',
                    return_battery: return_battery !== undefined ? Number(return_battery) : null,
                    return_odo: return_odo !== undefined ? Number(return_odo) : null,
                    has_damage: Boolean(has_damage),
                    damage_note: damage_note ?? null,
                    actual_return_at: now,
                    is_late: isLate,
                    late_hours: lateHours,
                    late_fee: lateFee,
                    note: note ?? booking.note
                }
            });

            const anotherActive = await tx.bookings.findFirst({
                where: {
                    vehicle_id: booking.vehicle_id,
                    id: { not: bookingId },
                    booking_status: { in: ACTIVE_BOOKING_STATUSES }
                }
            });

            let nextVehicleStatus = requestedStatus;
            if (requestedStatus === 'available' && anotherActive) {
                nextVehicleStatus = 'reserved';
            }

            await tx.vehicles.update({
                where: { id: booking.vehicle_id },
                data: { status: nextVehicleStatus }
            });

            return nextBooking;
        });

        return res.status(200).json({
            success: true,
            message: 'Nhận xe trả thành công',
            data: serializeBigInt(updatedBooking)
        });
    } catch (error) {
        console.error('Confirm return error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    getPendingHandoverBookings,
    confirmHandover,
    confirmReturn
};