const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const getAllTickets = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { status, keyword } = req.query;

        const where = {};
        if (status) where.status = status;

        if (keyword) {
            where.OR = [
                { subject: { contains: keyword, mode: 'insensitive' } },
                { content: { contains: keyword, mode: 'insensitive' } },
                { user: { full_name: { contains: keyword, mode: 'insensitive' } } }
            ];
        }

        const [total, tickets] = await Promise.all([
            prisma.support_tickets.count({ where }),
            prisma.support_tickets.findMany({
                where,
                include: {
                    user: { select: { id: true, full_name: true, email: true, phone: true } },
                    staff_user: { select: { id: true, full_name: true } },
                    bookings: { select: { id: true, booking_code: true } }
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
        console.error('Get all tickets error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

const replyTicket = async (req, res) => {
    try {
        const staffUserId = BigInt(req.user.userId);
        const ticketId = BigInt(req.params.id);
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({ success: false, message: 'Thiếu nội dung trả lời' });
        }

        const ticket = await prisma.support_tickets.findUnique({ where: { id: ticketId } });
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thắc mắc' });
        }

        if (ticket.status === 'closed') {
            return res.status(400).json({ success: false, message: 'Thắc mắc đã đóng' });
        }

        const updated = await prisma.support_tickets.update({
            where: { id: ticketId },
            data: {
                reply,
                staff_user_id: staffUserId,
                status: 'answered',
                replied_at: new Date()
            },
            include: {
                user: { select: { id: true, full_name: true, email: true } },
                staff_user: { select: { id: true, full_name: true } },
                bookings: { select: { id: true, booking_code: true } }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Trả lời thắc mắc thành công',
            data: serializeBigInt(updated)
        });
    } catch (error) {
        console.error('Reply ticket error:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

module.exports = { getAllTickets, replyTicket };