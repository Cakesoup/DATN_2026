const prisma = require('../../../config/prisma');
const { Prisma } = require('@prisma/client');
const { serializeBigInt } = require('../../../utils/serialize');

const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.vehicles.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe thành công',
            data: serializeBigInt(vehicles)
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await prisma.vehicles.findUnique({
            where: {
                id: BigInt(id)
            }
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy chi tiết xe thành công',
            data: serializeBigInt(vehicle)
        });
    } catch (error) {
        console.error('Get vehicle by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const createVehicle = async (req, res) => {
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
            status,
            current_location,
            description
        } = req.body;

        const vehicle = await prisma.vehicles.create({
            data: {
                vehicle_code,
                name,
                brand,
                model,
                battery_level,
                range_km,
                price_per_hour,
                price_per_day,
                status,
                current_location,
                description
            }
        });

        res.status(201).json({
            success: true,
            message: 'Tạo xe thành công',
            data: serializeBigInt(vehicle)
        });
    } catch (error) {
        console.error('Create vehicle error:', error);

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return res.status(409).json({
                success: false,
                message: 'Mã xe đã tồn tại, vui lòng dùng vehicle_code khác'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            vehicle_code,
            name,
            brand,
            model,
            battery_level,
            range_km,
            price_per_hour,
            price_per_day,
            status,
            current_location,
            description
        } = req.body;

        const existingVehicle = await prisma.vehicles.findUnique({
            where: {
                id: BigInt(id)
            }
        });

        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe để cập nhật'
            });
        }

        const duplicateVehicle = await prisma.vehicles.findFirst({
            where: {
                vehicle_code,
                NOT: {
                    id: BigInt(id)
                }
            }
        });

        if (duplicateVehicle) {
            return res.status(409).json({
                success: false,
                message: 'Mã xe đã tồn tại, vui lòng dùng vehicle_code khác'
            });
        }

        const updatedVehicle = await prisma.vehicles.update({
            where: {
                id: BigInt(id)
            },
            data: {
                vehicle_code,
                name,
                brand,
                model,
                battery_level,
                range_km,
                price_per_hour,
                price_per_day,
                status,
                current_location,
                description
            }
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật xe thành công',
            data: serializeBigInt(updatedVehicle)
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const existingVehicle = await prisma.vehicles.findUnique({
            where: {
                id: BigInt(id)
            }
        });

        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe để xóa'
            });
        }

        await prisma.vehicles.delete({
            where: {
                id: BigInt(id)
            }
        });

        res.status(200).json({
            success: true,
            message: 'Xóa xe thành công'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};