const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const ALLOWED_STATUSES = [
    'available',
    'reserved',
    'handover_pending',
    'in_use',
    'maintenance'
];

const getAllVehiclesForStaff = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { status, brand, keyword } = req.query;

        const where = {
            deleted_at: null
        };

        if (status) {
            where.status = status;
        }

        if (brand) {
            where.brand = {
                contains: brand,
                mode: 'insensitive'
            };
        }

        if (keyword) {
            where.OR = [
                { vehicle_code: { contains: keyword, mode: 'insensitive' } },
                { name: { contains: keyword, mode: 'insensitive' } },
                { model: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        const [total, vehicles] = await Promise.all([
            prisma.vehicles.count({ where }),
            prisma.vehicles.findMany({
                where,
                include: {
                    pricing_plans: true
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: limit
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe thành công',
            data: serializeBigInt(vehicles),
            pagination: buildPagination(page, limit, total)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getVehicleByIdForStaff = async (req, res) => {
    try {
        const id = BigInt(req.params.id);

        const vehicle = await prisma.vehicles.findFirst({
            where: {
                id,
                deleted_at: null
            },
            include: {
                pricing_plans: true,
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        created_at: true
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

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết xe thành công',
            data: serializeBigInt(vehicle)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const createVehicleForStaff = async (req, res) => {
    try {
        const {
            vehicle_code,
            name,
            brand,
            model,
            battery_level,
            range_km,
            price_per_hour,
            price_per_day,
            pricing_plan_id,
            status,
            current_location,
            description,
            image_url
        } = req.body;

        if (!vehicle_code || !name || !brand) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu bắt buộc'
            });
        }

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái xe không hợp lệ'
            });
        }

        const existingVehicleCode = await prisma.vehicles.findFirst({
            where: {
                vehicle_code,
                deleted_at: null
            }
        });

        if (existingVehicleCode) {
            return res.status(409).json({
                success: false,
                message: 'Mã xe đã tồn tại'
            });
        }

        const createdVehicle = await prisma.vehicles.create({
            data: {
                vehicle_code,
                name,
                brand,
                model: model || null,
                battery_level: battery_level ?? 100,
                range_km: range_km ?? null,
                price_per_hour: price_per_hour ?? 0,
                price_per_day: price_per_day ?? 0,
                pricing_plan_id: pricing_plan_id ? BigInt(pricing_plan_id) : null,
                status: status || 'available',
                current_location: current_location || null,
                description: description || null,
                image_url: image_url || null
            },
            include: {
                pricing_plans: true
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo xe thành công',
            data: serializeBigInt(createdVehicle)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateVehicleForStaff = async (req, res) => {
    try {
        const id = BigInt(req.params.id);
        const {
            vehicle_code,
            name,
            brand,
            model,
            battery_level,
            range_km,
            price_per_hour,
            price_per_day,
            pricing_plan_id,
            status,
            current_location,
            description,
            image_url
        } = req.body;

        const existingVehicle = await prisma.vehicles.findFirst({
            where: {
                id,
                deleted_at: null
            }
        });

        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        if (vehicle_code && vehicle_code !== existingVehicle.vehicle_code) {
            const duplicatedVehicleCode = await prisma.vehicles.findFirst({
                where: {
                    vehicle_code,
                    deleted_at: null
                }
            });

            if (duplicatedVehicleCode) {
                return res.status(409).json({
                    success: false,
                    message: 'Mã xe đã tồn tại'
                });
            }
        }

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái xe không hợp lệ'
            });
        }

        const updatedVehicle = await prisma.vehicles.update({
            where: { id },
            data: {
                vehicle_code: vehicle_code ?? existingVehicle.vehicle_code,
                name: name ?? existingVehicle.name,
                brand: brand ?? existingVehicle.brand,
                model: model ?? existingVehicle.model,
                battery_level: battery_level ?? existingVehicle.battery_level,
                range_km: range_km ?? existingVehicle.range_km,
                price_per_hour: price_per_hour ?? existingVehicle.price_per_hour,
                price_per_day: price_per_day ?? existingVehicle.price_per_day,
                pricing_plan_id:
                    pricing_plan_id !== undefined
                        ? (pricing_plan_id ? BigInt(pricing_plan_id) : null)
                        : existingVehicle.pricing_plan_id,
                status: status ?? existingVehicle.status,
                current_location: current_location ?? existingVehicle.current_location,
                description: description ?? existingVehicle.description,
                image_url: image_url ?? existingVehicle.image_url
            },
            include: {
                pricing_plans: true
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật xe thành công',
            data: serializeBigInt(updatedVehicle)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateVehicleStatus = async (req, res) => {
    try {
        const id = BigInt(req.params.id);
        const { status } = req.body;

        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái xe không hợp lệ'
            });
        }

        const vehicle = await prisma.vehicles.findFirst({
            where: {
                id,
                deleted_at: null
            }
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        const updatedVehicle = await prisma.vehicles.update({
            where: { id },
            data: { status },
            include: {
                pricing_plans: true
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái xe thành công',
            data: serializeBigInt(updatedVehicle)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const deleteVehicleForStaff = async (req, res) => {
    try {
        const id = BigInt(req.params.id);

        const existingVehicle = await prisma.vehicles.findFirst({
            where: {
                id,
                deleted_at: null
            }
        });

        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        await prisma.vehicles.update({
            where: { id },
            data: {
                deleted_at: new Date()
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa xe thành công'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getAllVehiclesForStaff,
    getVehicleByIdForStaff,
    createVehicleForStaff,
    updateVehicleForStaff,
    updateVehicleStatus,
    deleteVehicleForStaff
};