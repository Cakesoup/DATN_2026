const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const getMyInvoices = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const { page, limit, skip } = getPaginationParams(req.query);
        const { payment_status, keyword } = req.query;

        const where = {
            bookings: {
                user_id: userId
            }
        };

        if (payment_status) {
            where.payment_status = payment_status;
        }

        if (keyword) {
            where.OR = [
                {
                    invoice_code: {
                        contains: keyword,
                        mode: 'insensitive'
                    }
                },
                {
                    bookings: {
                        booking_code: {
                            contains: keyword,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    bookings: {
                        vehicles: {
                            name: {
                                contains: keyword,
                                mode: 'insensitive'
                            }
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
                            vehicles: {
                                include: {
                                    pricing_plans: true
                                }
                            }
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
                orderBy: {
                    issued_at: 'desc'
                },
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
        console.error('Get my invoices error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getMyInvoiceById = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const invoiceId = BigInt(req.params.id);

        const invoice = await prisma.invoices.findUnique({
            where: { id: invoiceId },
            include: {
                bookings: {
                    include: {
                        vehicles: {
                            include: {
                                pricing_plans: true
                            }
                        }
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

        if (invoice.bookings.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem hóa đơn này'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết hóa đơn thành công',
            data: serializeBigInt(invoice)
        });
    } catch (error) {
        console.error('Get my invoice by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getMyInvoices,
    getMyInvoiceById
};