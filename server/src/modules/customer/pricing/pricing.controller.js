const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const getActivePricingPlans = async (req, res) => {
    try {
        const plans = await prisma.pricing_plans.findMany({
            where: {
                is_active: true
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách bảng giá thành công',
            data: serializeBigInt(plans)
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