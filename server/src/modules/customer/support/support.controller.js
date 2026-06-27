const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const createTicket = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const { subject, content, booking_id } = req.body;

        if (!subject || !content) {
            return res.status(400).json({ success: false, message: 'Thiếu tiêu đề hoặc nội dung' });
        }

        if (booking_id) {
            const booking = await prisma.bookings.findUnique({ where: { id: BigInt(booking_id) } });
            if (!booking || booking.user_id !== userId) {
                return res.status(400).json({ success: false, message: 'Booking không hợp lệ' });
            }
        }

        const ticket = await prisma.support_tickets.create({
            data: {
                user_id: userId,
                booking_id: booking_id ? BigInt(booking_id) : null,
                subject,
                content,
                status: 'open'
            },
            include: {
                bookings: { select: { id: true, booking_code: true } }
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Gửi thắc mắc thành công',
            data: serializeBigInt(ticket)
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

const getMyTickets = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const { page, limit, skip } = getPaginationParams(req.query);
        const { status } = req.query;

        const where = { user_id: userId };
        if (status) where.status = status;

        const [total, tickets] = await Promise.all([
            prisma.support_tickets.count({ where }),
            prisma.support_tickets.findMany({
                where,
                include: {
                    bookings: { select: { id: true, booking_code: true } },
                    staff_user: { select: { id: true, full_name: true } }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách thắc mắc thành công',
            data: serializeBigInt(tickets),
            pagination: buildPagination(page, limit, total)
        });
    } catch (error) {
        console.error('Get my tickets error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

module.exports = { createTicket, getMyTickets };