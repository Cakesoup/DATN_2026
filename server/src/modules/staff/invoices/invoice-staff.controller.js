const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const buildInvoiceCode = () => `INV${Date.now()}${Math.floor(Math.random() * 100000)}`;

const getAllInvoicesForStaff = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { payment_status, keyword } = req.query;

        const where = {};

        if (payment_status) {
            where.payment_status = payment_status;
        }

        if (keyword) {
            where.OR = [
                { invoice_code: { contains: keyword, mode: 'insensitive' } },
                {
                    bookings: {
                        booking_code: { contains: keyword, mode: 'insensitive' }
                    }
                },
                {
                    bookings: {
                        users: {
                            full_name: { contains: keyword, mode: 'insensitive' }
                        }
                    }
                }
            ];
        }

        const [total, invoices] = await Promise.all([
            prisma.invoices.count({ where }),
            prisma.invoices.findMany({
                where,
                include: {
                    bookings: {
                        include: {
                            users: {
                                select: {
                                    id: true,
                                    full_name: true,
                                    email: true,
                                    phone: true
                                }
                            },
                            vehicles: true
                        }
                    },
                    staff_user: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true
                        }
                    }
                },
                orderBy: { issued_at: 'desc' },
                skip,
                take: limit
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách hóa đơn thành công',
            data: serializeBigInt(invoices),
            pagination: buildPagination(page, limit, total)
        });
    } catch (error) {
        console.error('Get all invoices for staff error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const createInvoice = async (req, res) => {
    try {
        const staffUserId = BigInt(req.user.userId);
        const {
            booking_id,
            extra_fee,
            penalty_fee,
            discount_amount,
            note,
            payment_status
        } = req.body;

        if (!booking_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu booking_id'
            });
        }

        const booking = await prisma.bookings.findUnique({
            where: { id: BigInt(booking_id) },
            include: {
                invoices: true
            }
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy booking'
            });
        }

        if (booking.booking_status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ tạo hóa đơn cho booking đã hoàn tất'
            });
        }

        if (booking.invoices) {
            return res.status(409).json({
                success: false,
                message: 'Booking này đã có hóa đơn'
            });
        }

        const subtotal = Number(booking.total_amount || 0);
        const lateFee = Number(booking.late_fee || 0);       // tự động từ biên bản trả xe
        const penaltyFee = Number(penalty_fee || 0);          // nhân viên nhập (phạt hỏng hóc)
        const discount = Number(discount_amount || 0);
        const extraFee = lateFee;                             // phụ phí = phí trả muộn
        const finalAmount = Math.max(subtotal + extraFee + penaltyFee - discount, 0);

        const invoice = await prisma.$transaction(async (tx) => {
            const nextInvoice = await tx.invoices.create({
                data: {
                    invoice_code: buildInvoiceCode(),
                    booking_id: BigInt(booking_id),
                    staff_user_id: staffUserId,
                    subtotal,
                    extra_fee: extraFee,
                    penalty_fee: penaltyFee,
                    discount_amount: discount,
                    final_amount: finalAmount,
                    payment_status: payment_status || 'unpaid',
                    note: note ?? null
                },
                include: {
                    bookings: {
                        include: {
                            users: {
                                select: {
                                    id: true,
                                    full_name: true,
                                    email: true,
                                    phone: true
                                }
                            },
                            vehicles: true
                        }
                    },
                    staff_user: {
                        select: {
                            id: true,
                            full_name: true,
                            email: true
                        }
                    }
                }
            });

            await tx.bookings.update({
                where: { id: BigInt(booking_id) },
                data: { booking_status: 'invoiced' }
            });

            return nextInvoice;
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn thành công',
            data: serializeBigInt(invoice)
        });
    } catch (error) {
        console.error('Create invoice error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getInvoiceByIdForStaff = async (req, res) => {
    try {
        const invoiceId = BigInt(req.params.id);

        const invoice = await prisma.invoices.findUnique({
            where: { id: invoiceId },
            include: {
                bookings: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                full_name: true,
                                email: true,
                                phone: true
                            }
                        },
                        vehicles: true
                    }
                },
                staff_user: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true
                    }
                }
            }
        });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết hóa đơn thành công',
            data: serializeBigInt(invoice)
        });
    } catch (error) {
        console.error('Get invoice by id for staff error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getAllInvoicesForStaff,
    createInvoice,
    getInvoiceByIdForStaff
};