const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed', 'handover_pending', 'in_progress'];

const buildBookingCode = () => `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;

const getVehiclePricing = (vehicle) => {
    const plan = vehicle.pricing_plans || null;

    return {
        pricePerDay: Number(plan?.price_per_day ?? vehicle.price_per_day ?? 0),
        depositRate: Number(plan?.deposit_rate ?? 0.3)
    };
};

const createBooking = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const {
            vehicle_id,
            start_at,
            end_at,
            pickup_location,
            return_location,
            note
        } = req.body;

        if (!vehicle_id || !start_at || !end_at || !pickup_location || !return_location) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu bắt buộc'
            });
        }

        const startDate = new Date(start_at);
        const endDate = new Date(end_at);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Thời gian không hợp lệ'
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu'
            });
        }

        const vehicle = await prisma.vehicles.findUnique({
            where: { id: BigInt(vehicle_id) },
            include: {
                pricing_plans: true
            }
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        if (!['available', 'reserved'].includes(vehicle.status)) {
            return res.status(400).json({
                success: false,
                message: 'Xe hiện không sẵn sàng để đặt'
            });
        }

        const conflictBooking = await prisma.bookings.findFirst({
            where: {
                vehicle_id: BigInt(vehicle_id),
                booking_status: {
                    in: ACTIVE_BOOKING_STATUSES
                },
                start_at: { lt: endDate },
                end_at: { gt: startDate }
            }
        });

        if (conflictBooking) {
            return res.status(409).json({
                success: false,
                message: 'Xe đã được đặt trong khoảng thời gian này'
            });
        }

        const diffMs = endDate - startDate;
        const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const safeDays = totalDays <= 0 ? 1 : totalDays;

        const { pricePerDay, depositRate } = getVehiclePricing(vehicle);
        const totalAmount = pricePerDay * safeDays;
        const depositAmount = totalAmount * depositRate;

        const booking = await prisma.bookings.create({
            data: {
                booking_code: buildBookingCode(),
                user_id: userId,
                vehicle_id: BigInt(vehicle_id),
                start_at: startDate,
                end_at: endDate,
                pickup_location,
                return_location,
                total_amount: totalAmount,
                deposit_amount: depositAmount,
                booking_status: 'pending',
                note: note ?? null
            },
            include: {
                vehicles: {
                    include: {
                        pricing_plans: true
                    }
                }
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo đơn thuê thành công',
            data: serializeBigInt(booking)
        });
    } catch (error) {
        console.error('Create booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const bookings = await prisma.bookings.findMany({
            where: { user_id: userId },
            include: {
                vehicles: {
                    include: {
                        pricing_plans: true
                    }
                },
                invoices: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy lịch sử thuê thành công',
            data: serializeBigInt(bookings)
        });
    } catch (error) {
        console.error('Get my bookings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const bookingId = BigInt(req.params.id);

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId },
            include: {
                vehicles: {
                    include: {
                        pricing_plans: true
                    }
                },
                invoices: true
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn thuê'
            });
        }

        if (booking.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem đơn thuê này'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết đơn thuê thành công',
            data: serializeBigInt(booking)
        });
    } catch (error) {
        console.error('Get booking by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const bookingId = BigInt(req.params.id);

        const booking = await prisma.bookings.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn thuê'
            });
        }

        if (booking.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy đơn thuê này'
            });
        }

        if (!['pending', 'confirmed', 'handover_pending'].includes(booking.booking_status)) {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn ở trạng thái hiện tại'
            });
        }

        const updatedBooking = await prisma.$transaction(async (tx) => {
            const nextBooking = await tx.bookings.update({
                where: { id: bookingId },
                data: { booking_status: 'cancelled' }
            });

            const otherActiveBooking = await tx.bookings.findFirst({
                where: {
                    vehicle_id: booking.vehicle_id,
                    id: { not: bookingId },
                    booking_status: { in: ACTIVE_BOOKING_STATUSES }
                }
            });

            await tx.vehicles.update({
                where: { id: booking.vehicle_id },
                data: {
                    status: otherActiveBooking ? 'reserved' : 'available'
                }
            });

            return nextBooking;
        });

        return res.status(200).json({
            success: true,
            message: 'Hủy đơn thuê thành công',
            data: serializeBigInt(updatedBooking)
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking
};