const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const mapVehicleWithRating = (vehicle) => {
    const reviewCount = vehicle.reviews.length;
    const averageRating =
        reviewCount === 0
            ? null
            : Number(
                (
                    vehicle.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                ).toFixed(1)
            );

    return {
        ...vehicle,
        effective_price_per_hour: Number(
            vehicle.pricing_plans?.price_per_hour ?? vehicle.price_per_hour ?? 0
        ),
        effective_price_per_day: Number(
            vehicle.pricing_plans?.price_per_day ?? vehicle.price_per_day ?? 0
        ),
        review_count: reviewCount,
        average_rating: averageRating
    };
};

const getAllVehicles = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { brand, status, min_price_per_day, max_price_per_day, min_rating, sort_by } = req.query;

        const where = {
            deleted_at: null
        };

        if (brand) {
            where.brand = {
                contains: brand,
                mode: 'insensitive'
            };
        }

        if (status) {
            where.status = status;
        } else {
            where.status = {
                in: ['available', 'reserved']
            };
        }

        // Lấy TẤT CẢ xe khớp điều kiện cơ bản (chưa phân trang),
        // để filter giá/rating và sort trên toàn tập rồi mới phân trang ở tầng app.
        const allVehicles = await prisma.vehicles.findMany({
            where,
            include: {
                pricing_plans: true,
                reviews: {
                    select: {
                        id: true,
                        rating: true
                    }
                }
            }
        });

        let mapped = allVehicles.map(mapVehicleWithRating);

        if (min_price_per_day !== undefined) {
            mapped = mapped.filter(
                (item) => item.effective_price_per_day >= Number(min_price_per_day)
            );
        }

        if (max_price_per_day !== undefined) {
            mapped = mapped.filter(
                (item) => item.effective_price_per_day <= Number(max_price_per_day)
            );
        }

        if (min_rating !== undefined) {
            mapped = mapped.filter(
                (item) => item.average_rating !== null && item.average_rating >= Number(min_rating)
            );
        }

        switch (sort_by) {
            case 'price_asc':
                mapped.sort((a, b) => a.effective_price_per_day - b.effective_price_per_day);
                break;
            case 'price_desc':
                mapped.sort((a, b) => b.effective_price_per_day - a.effective_price_per_day);
                break;
            case 'rating_desc':
                mapped.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
                break;
            case 'newest':
            default:
                mapped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        // Phân trang SAU khi đã lọc + sort toàn bộ → total và trang đều chính xác.
        const total = mapped.length;
        const paginated = mapped.slice(skip, skip + limit);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe thành công',
            data: serializeBigInt(paginated),
            pagination: buildPagination(page, limit, total)
        });
    } catch (error) {
        console.error('Get all vehicles error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};
const getVehicleById = async (req, res) => {
    try {
        const vehicleId = BigInt(req.params.id);

        const vehicle = await prisma.vehicles.findFirst({
            where: {
                id: vehicleId,
                deleted_at: null
            },
            include: {
                pricing_plans: true,
                reviews: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                full_name: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        const similarRaw = await prisma.vehicles.findMany({
            where: {
                deleted_at: null,
                brand: vehicle.brand,
                id: { not: vehicleId },
                status: { in: ['available', 'reserved'] },
            },
            include: { pricing_plans: true, reviews: { select: { rating: true } } },
            take: 4,
        });
        const similar = similarRaw.map(mapVehicleWithRating);

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết xe thành công',
            data: serializeBigInt({
                ...mapVehicleWithRating(vehicle),
                similar,
            })
        });
    } catch (error) {
        console.error('Get vehicle by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getAllVehicles,
    getVehicleById
};