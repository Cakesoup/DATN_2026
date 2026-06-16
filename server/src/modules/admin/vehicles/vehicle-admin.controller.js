const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.vehicles.findMany({
            orderBy: { id: 'asc' }
        });

        return res.status(200).json({
            success: true,
            data: serializeBigInt(vehicles)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const id = BigInt(req.params.id);

        const vehicle = await prisma.vehicles.findUnique({
            where: { id }
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        return res.status(200).json({
            success: true,
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

        if (!vehicle_code || !name || !brand) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu bắt buộc'
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
                status: status || 'available',
                current_location: current_location || null,
                description: description || null
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

const updateVehicle = async (req, res) => {
    try {
        const id = BigInt(req.params.id);

        const existingVehicle = await prisma.vehicles.findUnique({
            where: { id }
        });

        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        const updatedVehicle = await prisma.vehicles.update({
            where: { id },
            data: {
                ...req.body,
                updated_at: new Date()
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

const deleteVehicle = async (req, res) => {
    try {
        const id = BigInt(req.params.id);

        const existingVehicle = await prisma.vehicles.findUnique({
            where: { id }
        });

        if (!existingVehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        await prisma.vehicles.delete({
            where: { id }
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
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};