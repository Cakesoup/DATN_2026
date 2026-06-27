const bcrypt = require('bcryptjs');
const prisma = require('../../../config/prisma');
const { serializeBigInt } = require('../../../utils/serialize');
const { getPaginationParams, buildPagination } = require('../../../utils/pagination');

const ALLOWED_ROLES = ['admin', 'staff', 'customer'];

const getAllUsers = async (req, res) => {
    try {
        const { page, limit, skip } = getPaginationParams(req.query);
        const { role, is_active, keyword } = req.query;

        const where = {};

        if (role) {
            where.role = role;
        }

        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        if (keyword) {
            where.OR = [
                { full_name: { contains: keyword, mode: 'insensitive' } },
                { email: { contains: keyword, mode: 'insensitive' } },
                { phone: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        const [total, users] = await Promise.all([
            prisma.users.count({ where }),
            prisma.users.findMany({
                where,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    full_name: true,
                    email: true,
                    phone: true,
                    role: true,
                    is_active: true,
                    created_at: true,
                    updated_at: true
                },
                skip,
                take: limit
            })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách người dùng thành công',
            data: serializeBigInt(users),
            pagination: buildPagination(page, limit, total)
        });
    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = BigInt(req.params.id);

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
                updated_at: true,
                bookings: {
                    select: {
                        id: true,
                        booking_code: true,
                        booking_status: true,
                        total_amount: true,
                        created_at: true
                    },
                    orderBy: { created_at: 'desc' }
                }
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
            message: 'Lấy chi tiết người dùng thành công',
            data: serializeBigInt(user)
        });
    } catch (error) {
        console.error('Get user by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const createUserByAdmin = async (req, res) => {
    try {
        const { full_name, email, phone, password, role, is_active } = req.body;

        if (!full_name || !email || !phone || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu dữ liệu bắt buộc'
            });
        }

        if (!ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role không hợp lệ'
            });
        }

        const existed = await prisma.users.findFirst({
            where: {
                OR: [{ email }, { phone }]
            }
        });

        if (existed) {
            return res.status(409).json({
                success: false,
                message: 'Email hoặc số điện thoại đã tồn tại'
            });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                full_name,
                email,
                phone,
                password_hash,
                role,
                is_active: typeof is_active === 'boolean' ? is_active : true
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

        return res.status(201).json({
            success: true,
            message: 'Tạo người dùng thành công',
            data: serializeBigInt(user)
        });
    } catch (error) {
        console.error('Create user by admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateUserByAdmin = async (req, res) => {
    try {
        const userId = BigInt(req.params.id);
        const { full_name, email, phone, role, is_active, password } = req.body;

        const user = await prisma.users.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        if (role && !ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role không hợp lệ'
            });
        }

        if (email || phone) {
            const duplicated = await prisma.users.findFirst({
                where: {
                    NOT: { id: userId },
                    OR: [
                        ...(email ? [{ email }] : []),
                        ...(phone ? [{ phone }] : [])
                    ]
                }
            });

            if (duplicated) {
                return res.status(409).json({
                    success: false,
                    message: 'Email hoặc số điện thoại đã tồn tại'
                });
            }
        }

        const data = {
            ...(full_name !== undefined ? { full_name } : {}),
            ...(email !== undefined ? { email } : {}),
            ...(phone !== undefined ? { phone } : {}),
            ...(role !== undefined ? { role } : {}),
            ...(typeof is_active === 'boolean' ? { is_active } : {})
        };

        if (password) {
            data.password_hash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data,
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
            message: 'Cập nhật người dùng thành công',
            data: serializeBigInt(updatedUser)
        });
    } catch (error) {
        console.error('Update user by admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const updateUserStatusByAdmin = async (req, res) => {
    try {
        const userId = BigInt(req.params.id);
        const { is_active } = req.body;

        if (typeof is_active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'is_active phải là boolean'
            });
        }

        const user = await prisma.users.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: { is_active },
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
            message: 'Cập nhật trạng thái người dùng thành công',
            data: serializeBigInt(updatedUser)
        });
    } catch (error) {
        console.error('Update user status by admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const deleteUserByAdmin = async (req, res) => {
    try {
        const userId = BigInt(req.params.id);

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: {
                bookings: true,
                handled_invoices: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        if (user.bookings.length > 0 || user.handled_invoices.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Người dùng đã có dữ liệu liên quan, hãy khóa tài khoản thay vì xóa'
            });
        }

        await prisma.users.delete({
            where: { id: userId }
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        console.error('Delete user by admin error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUserByAdmin,
    updateUserByAdmin,
    updateUserStatusByAdmin,
    deleteUserByAdmin
};