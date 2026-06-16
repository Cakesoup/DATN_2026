const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['handover_pending', 'cancelled'],
    handover_pending: ['in_progress', 'cancelled'],
    in_progress: ['completed'],
    completed: ['invoiced'],
    invoiced: [],
    cancelled: []
};

const getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.bookings.findMany({
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
                invoices: true
            },
            orderBy: { created_at: 'desc' }
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách booking thành công',
            data: serializeBigInt(bookings)
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
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
                invoices: true
            }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết booking thành công',
            data: serializeBigInt(booking)
        });
    } catch (error) {
        console.error('Get booking by id for admin error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

const updateBookingStatusByAdmin = async (req, res) => {
    try {
        const bookingId = BigInt(req.params.id);
        const { booking_status } = req.body;

        if (!booking_status) {
            return res.status(400).json({ success: false, message: 'Thiếu booking_status' });
        }

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
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

            if (booking_status === 'cancelled') {
                const anotherActive = await tx.bookings.findFirst({
                    where: {
                        vehicle_id: booking.vehicle_id,
                        id: { not: bookingId },
                        booking_status: { in: ['pending', 'confirmed', 'handover_pending', 'in_progress'] }
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
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    getAllBookings,
    getBookingByIdForAdmin,
    updateBookingStatusByAdmin
};