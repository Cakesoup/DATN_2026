const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const createPricingPlan = async (req, res) => {
    try {
        const {
            plan_code,
            name,
            description,
            price_per_hour,
            price_per_day,
            deposit_rate,
            is_active,
            duration_days,
            package_price
        } = req.body;

        if (!plan_code || !name) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu plan_code hoặc name'
            });
        }

        const existed = await prisma.pricing_plans.findUnique({
            where: { plan_code }
        });

        if (existed) {
            return res.status(409).json({
                success: false,
                message: 'Mã bảng giá đã tồn tại'
            });
        }

        const plan = await prisma.pricing_plans.create({
            data: {
                plan_code,
                name,
                description: description ?? null,
                price_per_hour: Number(price_per_hour || 0),
                price_per_day: Number(price_per_day || 0),
                deposit_rate: Number(deposit_rate ?? 0.3),
                is_active: typeof is_active === 'boolean' ? is_active : true,
                duration_days: duration_days != null ? Number(duration_days) : null,
                package_price: package_price != null ? Number(package_price) : null,
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo bảng giá thành công',
            data: serializeBigInt(plan)
        });
    } catch (error) {
        console.error('Create pricing plan error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getAllPricingPlansForAdmin = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { is_active, keyword } = req.query;

        const where = {};

        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        if (keyword) {
            where.OR = [
                { plan_code: { contains: keyword, mode: 'insensitive' } },
                { name: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        const [total, plans] = await Promise.all([
            prisma.pricing_plans.count({ where }),
            prisma.pricing_plans.findMany({
                where,
                orderBy: { created_at: 'desc' },
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
        console.error('Get pricing plans for admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getPricingPlanByIdForAdmin = async (req, res) => {
    try {
        const planId = BigInt(req.params.id);

        const plan = await prisma.pricing_plans.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảng giá'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết bảng giá thành công',
            data: serializeBigInt(plan)
        });
    } catch (error) {
        console.error('Get pricing plan by id for admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updatePricingPlan = async (req, res) => {
    try {
        const planId = BigInt(req.params.id);
        const {
            name,
            description,
            price_per_hour,
            price_per_day,
            deposit_rate,
            is_active,
            duration_days,
            package_price
        } = req.body;

        const plan = await prisma.pricing_plans.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảng giá'
            });
        }

        const updatedPlan = await prisma.pricing_plans.update({
            where: { id: planId },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(price_per_hour !== undefined ? { price_per_hour: Number(price_per_hour) } : {}),
                ...(price_per_day !== undefined ? { price_per_day: Number(price_per_day) } : {}),
                ...(deposit_rate !== undefined ? { deposit_rate: Number(deposit_rate) } : {}),
                ...(typeof is_active === 'boolean' ? { is_active } : {}),
                ...(duration_days !== undefined ? { duration_days: duration_days != null ? Number(duration_days) : null } : {}),
                ...(package_price !== undefined ? { package_price: package_price != null ? Number(package_price) : null } : {}),
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật bảng giá thành công',
            data: serializeBigInt(updatedPlan)
        });
    } catch (error) {
        console.error('Update pricing plan error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const deletePricingPlan = async (req, res) => {
    try {
        const planId = BigInt(req.params.id);

        const plan = await prisma.pricing_plans.findUnique({
            where: { id: planId },
            include: { vehicles: true }
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảng giá'
            });
        }

        if (plan.vehicles.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa bảng giá đang gắn với xe'
            });
        }

        await prisma.pricing_plans.delete({
            where: { id: planId }
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa bảng giá thành công'
        });
    } catch (error) {
        console.error('Delete pricing plan error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    createPricingPlan,
    getAllPricingPlansForAdmin,
    getPricingPlanByIdForAdmin,
    updatePricingPlan,
    deletePricingPlan
};