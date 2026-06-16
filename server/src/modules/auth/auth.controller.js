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

module.exports = {
    register,
    login
};