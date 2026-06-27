const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { serializeBigInt } = require('../../utils/serialize');

const register = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        const existingUser = await prisma.users.findFirst({
            where: {
                OR: [{ email }, { phone }]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email hoặc số điện thoại đã tồn tại'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                full_name,
                email,
                phone,
                password_hash: hashedPassword,
                role: 'customer'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: serializeBigInt({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            })
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const token = jwt.sign(
            {
                userId: user.id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: serializeBigInt({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role
            })
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email, phone, new_password } = req.body;

        if (!email || !phone || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email, số điện thoại và mật khẩu mới'
            });
        }

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
            });
        }

        const user = await prisma.users.findUnique({
            where: { email }
        });

        // Xác minh: email tồn tại VÀ số điện thoại khớp đúng chủ tài khoản
        if (!user || user.phone !== phone) {
            return res.status(400).json({
                success: false,
                message: 'Email và số điện thoại không khớp với tài khoản nào'
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await prisma.users.update({
            where: { id: user.id },
            data: { password_hash: hashedPassword }
        });

        return res.status(200).json({
            success: true,
            message: 'Đặt lại mật khẩu thành công, vui lòng đăng nhập'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    forgotPassword
};