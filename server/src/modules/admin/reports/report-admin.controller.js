const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const toNumber = (value) => Number(value || 0);

const getOverviewReport = async (req, res) => {
    try {
        const [
            totalUsers,
            totalVehicles,
            totalBookings,
            totalInvoices,
            availableVehicles,
            inUseVehicles,
            maintenanceVehicles,
            pendingBookings,
            inProgressBookings,
            completedBookings,
            paidInvoices,
            unpaidInvoices,
            invoiceRows
        ] = await Promise.all([
            prisma.users.count(),
            prisma.vehicles.count(),
            prisma.bookings.count(),
            prisma.invoices.count(),
            prisma.vehicles.count({ where: { status: 'available' } }),
            prisma.vehicles.count({ where: { status: 'in_use' } }),
            prisma.vehicles.count({ where: { status: 'maintenance' } }),
            prisma.bookings.count({ where: { booking_status: 'pending' } }),
            prisma.bookings.count({ where: { booking_status: 'in_progress' } }),
            prisma.bookings.count({ where: { booking_status: 'completed' } }),
            prisma.invoices.count({ where: { payment_status: 'paid' } }),
            prisma.invoices.count({ where: { payment_status: 'unpaid' } }),
            prisma.invoices.findMany({
                select: {
                    subtotal: true,
                    extra_fee: true,
                    penalty_fee: true,
                    discount_amount: true,
                    final_amount: true,
                    payment_status: true
                }
            })
        ]);

        const revenueSummary = invoiceRows.reduce(
            (acc, item) => {
                acc.subtotal += toNumber(item.subtotal);
                acc.extra_fee += toNumber(item.extra_fee);
                acc.penalty_fee += toNumber(item.penalty_fee);
                acc.discount_amount += toNumber(item.discount_amount);
                acc.final_amount += toNumber(item.final_amount);

                if (item.payment_status === 'paid') {
                    acc.paid_revenue += toNumber(item.final_amount);
                }

                if (item.payment_status === 'unpaid') {
                    acc.unpaid_revenue += toNumber(item.final_amount);
                }

                return acc;
            },
            {
                subtotal: 0,
                extra_fee: 0,
                penalty_fee: 0,
                discount_amount: 0,
                final_amount: 0,
                paid_revenue: 0,
                unpaid_revenue: 0
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Lấy báo cáo tổng quan thành công',
            data: serializeBigInt({
                summary: {
                    total_users: totalUsers,
                    total_vehicles: totalVehicles,
                    total_bookings: totalBookings,
                    total_invoices: totalInvoices
                },
                vehicles: {
                    available: availableVehicles,
                    in_use: inUseVehicles,
                    maintenance: maintenanceVehicles
                },
                bookings: {
                    pending: pendingBookings,
                    in_progress: inProgressBookings,
                    completed: completedBookings
                },
                invoices: {
                    paid: paidInvoices,
                    unpaid: unpaidInvoices
                },
                revenue: revenueSummary
            })
        });
    } catch (error) {
        console.error('Get overview report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getRevenueReport = async (req, res) => {
    try {
        const { from, to, payment_status } = req.query;

        const where = {};

        if (from || to) {
            where.issued_at = {};
            if (from) where.issued_at.gte = new Date(from);
            if (to) where.issued_at.lte = new Date(to);
        }

        if (payment_status) {
            where.payment_status = payment_status;
        }

        const invoices = await prisma.invoices.findMany({
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
                        vehicles: {
                            select: {
                                id: true,
                                vehicle_code: true,
                                name: true,
                                brand: true
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
            }
        });

        const totals = invoices.reduce(
            (acc, item) => {
                acc.subtotal += toNumber(item.subtotal);
                acc.extra_fee += toNumber(item.extra_fee);
                acc.penalty_fee += toNumber(item.penalty_fee);
                acc.discount_amount += toNumber(item.discount_amount);
                acc.final_amount += toNumber(item.final_amount);
                return acc;
            },
            {
                subtotal: 0,
                extra_fee: 0,
                penalty_fee: 0,
                discount_amount: 0,
                final_amount: 0
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Lấy báo cáo doanh thu thành công',
            data: serializeBigInt({
                filters: {
                    from: from || null,
                    to: to || null,
                    payment_status: payment_status || null
                },
                totals,
                items: invoices
            })
        });
    } catch (error) {
        console.error('Get revenue report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getOverviewReport,
    getRevenueReport
};