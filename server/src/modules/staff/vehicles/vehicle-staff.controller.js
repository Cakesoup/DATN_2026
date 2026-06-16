const prisma = require('../../../config/prisma');

const serializeBigInt = (data) => {
    return JSON.parse(
        JSON.stringify(data, (_, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );
};

const getAllVehiclesForStaff = async (req, res) => {
    try {
        const vehicles = await prisma.vehicles.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe thành công',
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

const getVehicleByIdForStaff = async (req, res) => {
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

const updateVehicleStatus = async (req, res) => {
    try {
        const id = BigInt(req.params.id);
        const { status } = req.body;

        const allowedStatuses = [
            'available',
            'reserved',
            'handover_pending',
            'in_use',
            'maintenance'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái xe không hợp lệ'
            });
        }

        const vehicle = await prisma.vehicles.findUnique({
            where: { id }
        });

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe'
            });
        }

        const updatedVehicle = await prisma.vehicles.update({
            where: { id },
            data: { status }
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

module.exports = {
    getAllVehiclesForStaff,
    getVehicleByIdForStaff,
    updateVehicleStatus
};