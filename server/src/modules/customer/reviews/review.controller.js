const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const createReview = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const { booking_id, rating, comment } = req.body;

        if (!booking_id || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu booking_id hoặc rating'
            });
        }

        const ratingNumber = Number(rating);

        if (ratingNumber < 1 || ratingNumber > 5) {
            return res.status(400).json({
                success: false,
                message: 'Số sao phải từ 1 đến 5'
            });
        }

        const booking = await prisma.bookings.findUnique({
            where: { id: BigInt(booking_id) }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }

        if (booking.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền đánh giá booking này'
            });
        }

        if (!['completed', 'invoiced'].includes(booking.booking_status)) {
            return res.status(400).json({
                success: false,
                message: 'Chỉ được đánh giá sau khi hoàn tất chuyến thuê'
            });
        }

        const existingReview = await prisma.reviews.findUnique({
            where: { booking_id: BigInt(booking_id) }
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: 'Booking này đã được đánh giá'
            });
        }

        const review = await prisma.reviews.create({
            data: {
                booking_id: BigInt(booking_id),
                user_id: userId,
                vehicle_id: booking.vehicle_id,
                rating: ratingNumber,
                comment: comment ?? null
            },
            include: {
                vehicles: true,
                bookings: true
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Đánh giá xe thành công',
            data: serializeBigInt(review)
        });
    } catch (error) {
        console.error('Create review error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const reviews = await prisma.reviews.findMany({
            where: { user_id: userId },
            include: {
                vehicles: true,
                bookings: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách đánh giá thành công',
            data: serializeBigInt(reviews)
        });
    } catch (error) {
        console.error('Get my reviews error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    createReview,
    getMyReviews
};