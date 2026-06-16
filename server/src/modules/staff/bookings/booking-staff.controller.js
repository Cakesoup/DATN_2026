const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const getPendingHandoverBookings = async (req, res) => {
    try {
        const bookings = await prisma.bookings.findMany({
            where: {
                booking_status: {
                    in: ['confirmed', 'handover_pending']
                }
            },
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
            orderBy: { created_at: 'desc' }
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách booking chờ bàn giao thành công',
            data: serializeBigInt(bookings)
        });
    } catch (error) {
        console.error('Get pending handover bookings error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

const confirmHandover = async (req, res) => {
    try {
        const bookingId = BigInt(req.params.id);

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
                data: { booking_status: 'in_progress' }
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
        const { vehicle_status_after_return, note } = req.body;

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId }
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

        const nextVehicleStatus = ['available', 'maintenance'].includes(vehicle_status_after_return)
            ? vehicle_status_after_return
            : 'available';

        const updatedBooking = await prisma.$transaction(async (tx) => {
            const nextBooking = await tx.bookings.update({
                where: { id: bookingId },
                data: {
                    booking_status: 'completed',
                    note: note ?? booking.note
                }
            });

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