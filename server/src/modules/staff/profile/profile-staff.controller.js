const bcrypt = require('bcryptjs');
const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');

const getMyStaffProfile = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                role: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy hồ sơ staff thành công',
            data: serializeBigInt(user)
        });
    } catch (error) {
        console.error('Get my staff profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateMyStaffProfile = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const { full_name, phone } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        if (phone && phone !== existingUser.phone) {
            const duplicatedPhone = await prisma.users.findUnique({
                where: { phone }
            });

            if (duplicatedPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'Số điện thoại đã tồn tại'
                });
            }
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                full_name: full_name ?? existingUser.full_name,
                phone: phone ?? existingUser.phone
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                role: true,
                is_active: true,
                created_at: true,
                updated_at: true
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật hồ sơ staff thành công',
            data: serializeBigInt(updatedUser)
        });
    } catch (error) {
        console.error('Update my staff profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const changeMyStaffPassword = async (req, res) => {
    try {
        const userId = BigInt(req.user.userId);
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const isMatched = await bcrypt.compare(current_password, user.password_hash);

        if (!isMatched) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await prisma.users.update({
            where: { id: userId },
            data: {
                password_hash: hashedPassword
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Đổi mật khẩu staff thành công'
        });
    } catch (error) {
        console.error('Change my staff password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getMyStaffProfile,
    updateMyStaffProfile,
    changeMyStaffPassword
};