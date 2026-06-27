const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const getActivePricingPlans = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { keyword } = req.query;

        const where = {
            is_active: true
        };

        if (keyword) {
            where.OR = [
                {
                    plan_code: {
                        contains: keyword,
                        mode: 'insensitive'
                    }
                },
                {
                    name: {
                        contains: keyword,
                        mode: 'insensitive'
                    }
                }
            ];
        }

        const [total, plans] = await Promise.all([
            prisma.pricing_plans.count({ where }),
            prisma.pricing_plans.findMany({
                where,
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: limit
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách bảng giá thành công',
            data: serializeBigInt(plans),
            pagination: buildPagination(page, limit, total)
        });
    } catch (error) {
        console.error('Get active pricing plans error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getActivePricingPlans
};