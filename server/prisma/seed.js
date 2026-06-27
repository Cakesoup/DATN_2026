require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper thời gian
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
const daysLater = (d) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);
const hoursLater = (h) => new Date(Date.now() + h * 60 * 60 * 1000);

async function main() {
    console.log('Đang xóa dữ liệu cũ...');
    // Xóa theo thứ tự phụ thuộc khóa ngoại
    await prisma.support_tickets.deleteMany();
    await prisma.reviews.deleteMany();
    await prisma.invoices.deleteMany();
    await prisma.bookings.deleteMany();
    await prisma.vehicles.deleteMany();
    await prisma.pricing_plans.deleteMany();
    await prisma.users.deleteMany();

    const passwordHash = await bcrypt.hash('123456', 10);

    // ─────────────── USERS (12) ───────────────
    console.log('Tạo users...');
    const userSeed = [
        { full_name: 'Nguyen Van Admin', email: 'admin@evrental.com', phone: '0900000001', role: 'admin', is_active: true },
        { full_name: 'Tran Thi Manager', email: 'manager@evrental.com', phone: '0900000002', role: 'manager', is_active: true },
        { full_name: 'Le Van Staff', email: 'staff@evrental.com', phone: '0900000003', role: 'staff', is_active: true },
        { full_name: 'Hoang Van Staff 2', email: 'staff2@evrental.com', phone: '0900000004', role: 'staff', is_active: true },
        { full_name: 'Pham Minh Customer 1', email: 'customer1@evrental.com', phone: '0900000005', role: 'customer', is_active: true },
        { full_name: 'Vo Gia Customer 2', email: 'customer2@evrental.com', phone: '0900000006', role: 'customer', is_active: true },
        { full_name: 'Do Anh Customer 3', email: 'customer3@evrental.com', phone: '0900000007', role: 'customer', is_active: true },
        { full_name: 'Bui Thi Customer 4', email: 'customer4@evrental.com', phone: '0900000008', role: 'customer', is_active: true },
        { full_name: 'Dang Van Customer 5', email: 'customer5@evrental.com', phone: '0900000009', role: 'customer', is_active: true },
        { full_name: 'Ngo Thi Customer 6', email: 'customer6@evrental.com', phone: '0900000010', role: 'customer', is_active: true },
        { full_name: 'Ly Van Customer 7', email: 'customer7@evrental.com', phone: '0900000011', role: 'customer', is_active: true },
        { full_name: 'Truong Thi Customer 8', email: 'customer8@evrental.com', phone: '0900000012', role: 'customer', is_active: false },
    ];

    const users = [];
    for (const u of userSeed) {
        const created = await prisma.users.create({ data: { ...u, password_hash: passwordHash } });
        users.push(created);
    }
    const admin = users[0];
    const manager = users[1];
    const staff = users[2];
    const staff2 = users[3];
    const customers = users.filter((u) => u.role === 'customer');

    // ─────────────── PRICING PLANS (10) ───────────────
    console.log('Tạo pricing plans...');
    const planSeed = [
        { plan_code: 'PLAN_ECO', name: 'Gói Tiết Kiệm', description: 'Phù hợp di chuyển ngắn trong thành phố', price_per_hour: 12000, price_per_day: 100000, deposit_rate: 0.25 },
        { plan_code: 'PLAN_BASIC', name: 'Gói Cơ Bản', description: 'Cân bằng giữa chi phí và quãng đường', price_per_hour: 15000, price_per_day: 120000, deposit_rate: 0.30 },
        { plan_code: 'PLAN_STD', name: 'Gói Tiêu Chuẩn', description: 'Lựa chọn phổ biến cho nhu cầu hằng ngày', price_per_hour: 20000, price_per_day: 180000, deposit_rate: 0.35 },
        { plan_code: 'PLAN_PLUS', name: 'Gói Nâng Cao', description: 'Xe đời mới, tầm hoạt động xa hơn', price_per_hour: 25000, price_per_day: 220000, deposit_rate: 0.35 },
        { plan_code: 'PLAN_PREM', name: 'Gói Cao Cấp', description: 'Ưu tiên xe đời mới và pin khỏe', price_per_hour: 30000, price_per_day: 280000, deposit_rate: 0.40 },
        { plan_code: 'PLAN_WEEKEND', name: 'Gói Cuối Tuần', description: 'Ưu đãi thuê thứ 7 và chủ nhật', price_per_hour: 18000, price_per_day: 160000, deposit_rate: 0.30 },
        { plan_code: 'PLAN_WEEKLY', name: 'Gói Theo Tuần', description: 'Giá tốt khi thuê dài ngày', price_per_hour: 14000, price_per_day: 110000, deposit_rate: 0.25 },
        { plan_code: 'PLAN_STUDENT', name: 'Gói Sinh Viên', description: 'Ưu đãi cho học sinh, sinh viên', price_per_hour: 11000, price_per_day: 90000, deposit_rate: 0.20 },
        { plan_code: 'PLAN_BUSINESS', name: 'Gói Doanh Nghiệp', description: 'Dành cho khách hàng doanh nghiệp', price_per_hour: 28000, price_per_day: 260000, deposit_rate: 0.40 },
        { plan_code: 'PLAN_VIP', name: 'Gói VIP', description: 'Dịch vụ cao cấp, hỗ trợ ưu tiên', price_per_hour: 35000, price_per_day: 320000, deposit_rate: 0.45 },
    ];

    const plans = [];
    for (const p of planSeed) {
        const created = await prisma.pricing_plans.create({ data: { ...p, is_active: true } });
        plans.push(created);
    }

    // ─────────────── VEHICLES (12) ───────────────
    // image_url để trống: dán URL Cloudinary sau khi upload tay
    console.log('Tạo vehicles...');
    const vehicleSeed = [
        { vehicle_code: 'EV001', name: 'VinFast Feliz S', brand: 'VinFast', model: 'Feliz S', battery_level: 100, range_km: 120, price_per_hour: 15000, price_per_day: 120000, planIdx: 1, status: 'available', current_location: 'Cau Giay, Ha Noi' },
        { vehicle_code: 'EV002', name: 'VinFast Evo 200', brand: 'VinFast', model: 'Evo 200', battery_level: 85, range_km: 203, price_per_hour: 18000, price_per_day: 150000, planIdx: 2, status: 'available', current_location: 'Dong Da, Ha Noi' },
        { vehicle_code: 'EV003', name: 'Yadea Odora S1', brand: 'Yadea', model: 'Odora S1', battery_level: 76, range_km: 100, price_per_hour: 14000, price_per_day: 110000, planIdx: 0, status: 'available', current_location: 'Hai Ba Trung, Ha Noi' },
        { vehicle_code: 'EV004', name: 'Dat Bike Weaver 200', brand: 'Dat Bike', model: 'Weaver 200', battery_level: 92, range_km: 200, price_per_hour: 28000, price_per_day: 250000, planIdx: 4, status: 'available', current_location: 'Ba Dinh, Ha Noi' },
        { vehicle_code: 'EV005', name: 'Pega AuraS+', brand: 'Pega', model: 'AuraS+', battery_level: 60, range_km: 120, price_per_hour: 16000, price_per_day: 130000, planIdx: 2, status: 'maintenance', current_location: 'Thanh Xuan, Ha Noi' },
        { vehicle_code: 'EV006', name: 'VinFast Klara S2', brand: 'VinFast', model: 'Klara S2', battery_level: 88, range_km: 194, price_per_hour: 22000, price_per_day: 190000, planIdx: 3, status: 'available', current_location: 'Tay Ho, Ha Noi' },
        { vehicle_code: 'EV007', name: 'Yadea G5', brand: 'Yadea', model: 'G5', battery_level: 95, range_km: 130, price_per_hour: 17000, price_per_day: 140000, planIdx: 1, status: 'available', current_location: 'Hoan Kiem, Ha Noi' },
        { vehicle_code: 'EV008', name: 'Selex Camel', brand: 'Selex', model: 'Camel', battery_level: 70, range_km: 150, price_per_hour: 25000, price_per_day: 210000, planIdx: 4, status: 'available', current_location: 'Long Bien, Ha Noi' },
        { vehicle_code: 'EV009', name: 'VinFast Vento S', brand: 'VinFast', model: 'Vento S', battery_level: 90, range_km: 110, price_per_hour: 20000, price_per_day: 175000, planIdx: 3, status: 'available', current_location: 'Nam Tu Liem, Ha Noi' },
        { vehicle_code: 'EV010', name: 'Yadea Ossy', brand: 'Yadea', model: 'Ossy', battery_level: 82, range_km: 90, price_per_hour: 13000, price_per_day: 105000, planIdx: 0, status: 'available', current_location: 'Ha Dong, Ha Noi' },
        { vehicle_code: 'EV011', name: 'Pega eSH', brand: 'Pega', model: 'eSH', battery_level: 78, range_km: 140, price_per_hour: 19000, price_per_day: 165000, planIdx: 2, status: 'available', current_location: 'Cau Giay, Ha Noi' },
        { vehicle_code: 'EV012', name: 'Dat Bike Quantum', brand: 'Dat Bike', model: 'Quantum', battery_level: 100, range_km: 285, price_per_hour: 32000, price_per_day: 300000, planIdx: 9, status: 'available', current_location: 'Ba Dinh, Ha Noi' },
    ];

    const vehicles = [];
    for (const v of vehicleSeed) {
        const { planIdx, ...rest } = v;
        const created = await prisma.vehicles.create({
            data: {
                ...rest,
                pricing_plan_id: plans[planIdx].id,
                image_url: '', // TODO: dán URL Cloudinary sau khi upload ảnh
                description: `${v.name} - xe điện ${v.brand} tiết kiệm và thân thiện môi trường`,
            },
        });
        vehicles.push(created);
    }

    // ─────────────── BOOKINGS (12) — đủ trạng thái ───────────────
    console.log('Tạo bookings...');
    const buildCode = (i) => `BK${String(i + 1).padStart(4, '0')}`;

    // Cấu hình từng booking: trạng thái khác nhau để test mọi luồng
    const bookingConfigs = [
        // 3 hoàn tất (đã đi xong, có hóa đơn + có thể review)
        { custIdx: 0, vehIdx: 1, planIdx: 2, start: daysAgo(10), end: daysAgo(9), status: 'invoiced', late: false, damage: false },
        { custIdx: 1, vehIdx: 2, planIdx: 0, start: daysAgo(8), end: daysAgo(7), status: 'invoiced', late: false, damage: false },
        { custIdx: 0, vehIdx: 3, planIdx: 4, start: daysAgo(6), end: daysAgo(5), status: 'invoiced', late: true, damage: true },
        // 2 completed (đã trả, chưa lập hóa đơn) — để staff test "Tạo hóa đơn"
        { custIdx: 2, vehIdx: 6, planIdx: 1, start: daysAgo(4), end: daysAgo(3), status: 'completed', late: false, damage: false },
        { custIdx: 3, vehIdx: 7, planIdx: 3, start: daysAgo(3), end: daysAgo(2), status: 'completed', late: true, damage: false },
        // 2 in_progress (đang thuê) — để staff test "Nhận trả xe"
        { custIdx: 4, vehIdx: 8, planIdx: 3, start: daysAgo(1), end: daysLater(1), status: 'in_progress', late: false, damage: false },
        { custIdx: 5, vehIdx: 9, planIdx: 0, start: daysAgo(1), end: hoursLater(6), status: 'in_progress', late: false, damage: false },
        // 2 confirmed (chờ bàn giao) — để staff test "Bàn giao xe"
        { custIdx: 6, vehIdx: 10, planIdx: 2, start: daysLater(1), end: daysLater(2), status: 'confirmed', late: false, damage: false },
        { custIdx: 0, vehIdx: 11, planIdx: 9, start: daysLater(2), end: daysLater(4), status: 'confirmed', late: false, damage: false },
        // 2 pending (chờ admin xác nhận)
        { custIdx: 1, vehIdx: 0, planIdx: 1, start: daysLater(3), end: daysLater(5), status: 'pending', late: false, damage: false },
        { custIdx: 2, vehIdx: 5, planIdx: 3, start: daysLater(4), end: daysLater(6), status: 'pending', late: false, damage: false },
        // 1 cancelled
        { custIdx: 3, vehIdx: 6, planIdx: 1, start: daysLater(5), end: daysLater(7), status: 'cancelled', late: false, damage: false },
    ];

    const bookings = [];
    for (let i = 0; i < bookingConfigs.length; i++) {
        const c = bookingConfigs[i];
        const vehicle = vehicles[c.vehIdx];
        const plan = plans[c.planIdx];
        const cust = customers[c.custIdx % customers.length];

        const days = Math.max(1, Math.ceil((c.end - c.start) / (1000 * 60 * 60 * 24)));
        const pricePerDay = Number(plan.price_per_day);
        const total = pricePerDay * days;
        const deposit = total * Number(plan.deposit_rate);

        // Dữ liệu biên bản giao/trả cho các booking đã giao
        const handed = ['in_progress', 'completed', 'invoiced'].includes(c.status);
        const returned = ['completed', 'invoiced'].includes(c.status);

        let lateHours = 0;
        let lateFee = 0;
        if (returned && c.late) {
            lateHours = 3;
            lateFee = Number(vehicle.price_per_hour) * lateHours;
        }

        const data = {
            booking_code: buildCode(i),
            user_id: cust.id,
            vehicle_id: vehicle.id,
            pricing_plan_id: plan.id,
            start_at: c.start,
            end_at: c.end,
            pickup_location: vehicle.current_location || 'Ha Noi',
            return_location: vehicle.current_location || 'Ha Noi',
            total_amount: total,
            deposit_amount: deposit,
            booking_status: c.status,
            note: c.status === 'cancelled' ? 'Khach huy do thay doi lich' : null,
        };

        if (handed) {
            data.handover_battery = vehicle.battery_level;
            data.handover_odo = 1000 + i * 50;
            data.handover_note = 'Xe day pin, ngoai that tot khi giao';
            data.handover_at = c.start;
        }
        if (returned) {
            data.return_battery = 20 + (i % 5) * 10;
            data.return_odo = 1000 + i * 50 + 80;
            data.has_damage = c.damage;
            data.damage_note = c.damage ? 'Tray xuoc nhe phan dau xe' : null;
            data.actual_return_at = c.late ? new Date(c.end.getTime() + lateHours * 3600 * 1000) : c.end;
            data.is_late = c.late;
            data.late_hours = lateHours;
            data.late_fee = lateFee;
        }

        const booking = await prisma.bookings.create({ data });
        bookings.push({ booking, config: c, vehicle, lateFee });
    }

    // ─────────────── INVOICES (cho booking invoiced — đủ ≥10? bổ sung) ───────────────
    console.log('Tạo invoices...');
    // Tạo hóa đơn cho 3 booking 'invoiced'. Để đủ ≥10 invoice, ta lập hóa đơn
    // cho cả các booking 'completed' nữa (giả lập staff đã lập), tổng 5.
    // Vẫn thiếu -> tạo thêm booking lịch sử đã invoiced ở dưới cho đủ.
    const invoices = [];
    let invoiceCounter = 1;
    const makeInvoice = async (b, staffUser, paymentStatus) => {
        const subtotal = Number(b.booking.total_amount);
        const lateFee = Number(b.booking.late_fee || 0);
        const penalty = b.config.damage ? 150000 : 0;
        const discount = 0;
        const final = Math.max(subtotal + lateFee + penalty - discount, 0);
        const inv = await prisma.invoices.create({
            data: {
                invoice_code: `INV${String(invoiceCounter++).padStart(4, '0')}`,
                booking_id: b.booking.id,
                staff_user_id: staffUser.id,
                subtotal,
                extra_fee: lateFee,
                penalty_fee: penalty,
                discount_amount: discount,
                final_amount: final,
                payment_status: paymentStatus,
                note: 'Hoa don tu dong tao khi seed',
                issued_at: b.booking.end_at,
            },
        });
        invoices.push(inv);
    };

    // Hóa đơn cho 3 booking invoiced
    for (let i = 0; i < 3; i++) {
        await makeInvoice(bookings[i], i % 2 === 0 ? staff : staff2, 'paid');
    }

    // Bổ sung booking lịch sử + hóa đơn để đạt ≥10 invoice
    console.log('Tạo thêm booking lịch sử để đủ hóa đơn...');
    for (let i = 0; i < 8; i++) {
        const cust = customers[i % customers.length];
        const vehicle = vehicles[i % vehicles.length];
        const plan = plans[i % plans.length];
        const start = daysAgo(40 - i * 2);
        const end = daysAgo(39 - i * 2);
        const days = 1;
        const total = Number(plan.price_per_day) * days;
        const deposit = total * Number(plan.deposit_rate);

        const hb = await prisma.bookings.create({
            data: {
                booking_code: `BKH${String(i + 1).padStart(4, '0')}`,
                user_id: cust.id,
                vehicle_id: vehicle.id,
                pricing_plan_id: plan.id,
                start_at: start,
                end_at: end,
                pickup_location: vehicle.current_location || 'Ha Noi',
                return_location: vehicle.current_location || 'Ha Noi',
                total_amount: total,
                deposit_amount: deposit,
                booking_status: 'invoiced',
                handover_battery: 100,
                handover_odo: 500 + i * 30,
                handover_at: start,
                return_battery: 30,
                return_odo: 560 + i * 30,
                has_damage: false,
                actual_return_at: end,
                is_late: false,
                late_hours: 0,
                late_fee: 0,
            },
        });

        const inv = await prisma.invoices.create({
            data: {
                invoice_code: `INV${String(invoiceCounter++).padStart(4, '0')}`,
                booking_id: hb.id,
                staff_user_id: (i % 2 === 0 ? staff : staff2).id,
                subtotal: total,
                extra_fee: 0,
                penalty_fee: 0,
                discount_amount: i % 3 === 0 ? 10000 : 0,
                final_amount: total - (i % 3 === 0 ? 10000 : 0),
                payment_status: i % 4 === 0 ? 'unpaid' : 'paid',
                note: 'Hoa don lich su',
                issued_at: end,
            },
        });
        invoices.push(inv);
        // lưu để tạo review bên dưới
        bookings.push({ booking: hb, config: { custIdx: i % customers.length, vehIdx: i % vehicles.length }, vehicle, history: true });
    }

    // ─────────────── REVIEWS (≥10) ───────────────
    console.log('Tạo reviews...');
    const comments = [
        'Xe chay em, pin tot, nhan xe nhanh chong.',
        'On trong tam gia, phu hop di lai trong pho.',
        'Xe khoe, tang toc tot, trai nghiem rat da.',
        'Nhan vien nhiet tinh, xe sach se.',
        'Pin hoi yeu nhung nhin chung hai long.',
        'Dat xe de dang, giao xe dung gio.',
        'Xe moi, thiet ke dep, se thue lai.',
        'Gia hop ly, dich vu chuyen nghiep.',
        'Tam hoat dong xa, rat tien cho di lai.',
        'Tot, nhung mong co them mau xe moi.',
        'Trai nghiem tuyet voi, dang dong tien.',
        'Xe on dinh, ho tro nhanh khi can.',
    ];
    // Review cho các booking đã completed/invoiced (chưa có review)
    const reviewableBookings = bookings.filter(
        (b) => ['completed', 'invoiced'].includes(b.booking.booking_status)
    );
    let reviewCount = 0;
    for (let i = 0; i < reviewableBookings.length && reviewCount < 12; i++) {
        const b = reviewableBookings[i];
        // mỗi booking chỉ 1 review (booking_id unique)
        try {
            await prisma.reviews.create({
                data: {
                    booking_id: b.booking.id,
                    user_id: b.booking.user_id,
                    vehicle_id: b.booking.vehicle_id,
                    rating: 3 + (i % 3), // 3-5 sao
                    comment: comments[i % comments.length],
                },
            });
            reviewCount++;
        } catch (e) {
            // bỏ qua nếu trùng booking_id
        }
    }

    // ─────────────── SUPPORT TICKETS (12) ───────────────
    console.log('Tạo support tickets...');
    const ticketSeed = [
        { subject: 'Xe het pin giua duong', content: 'Toi thue xe nhung pin tut nhanh hon du kien, mong duoc ho tro.', status: 'answered', reply: 'Cam on ban da phan anh, chung toi se kiem tra lai xe.' },
        { subject: 'Hoi ve phi tra muon', content: 'Neu toi tra xe muon 1 gio thi tinh phi the nao?', status: 'answered', reply: 'Phi tra muon tinh theo gia gio nhan voi so gio tre ban nhe.' },
        { subject: 'Khong dat duoc xe', content: 'Toi chon xe nhung bao loi khong dat duoc.', status: 'open', reply: null },
        { subject: 'Xe co mui la', content: 'Xe toi nhan co mui kho chiu, mong duoc doi xe.', status: 'answered', reply: 'Xin loi ban, chung toi se ve sinh va kiem tra xe ngay.' },
        { subject: 'Doi gio nhan xe', content: 'Toi muon doi gio nhan xe som hon 1 tieng.', status: 'open', reply: null },
        { subject: 'Hoan tien coc', content: 'Khi nao toi nhan lai duoc tien coc sau khi tra xe?', status: 'answered', reply: 'Tien coc se duoc hoan trong 1-2 ngay lam viec sau khi tra xe.' },
        { subject: 'Xe khong khoi dong', content: 'Sang nay xe khong khoi dong duoc, toi can ho tro gap.', status: 'answered', reply: 'Chung toi da cu nhan vien ho tro den vi tri cua ban.' },
        { subject: 'Gia thue dai ngay', content: 'Co uu dai gi khi thue tren 1 tuan khong?', status: 'open', reply: null },
        { subject: 'Khu vuc giao xe', content: 'Cac ban co giao xe o khu vuc ngoai trung tam khong?', status: 'answered', reply: 'Hien tai chung toi giao xe trong noi thanh Ha Noi ban nhe.' },
        { subject: 'Xe bi tray nhe', content: 'Toi phat hien vai vet tray nho khi nhan xe.', status: 'answered', reply: 'Cam on ban da bao truoc, chung toi da ghi nhan tinh trang xe.' },
        { subject: 'Thanh toan online', content: 'He thong co ho tro thanh toan online khong?', status: 'open', reply: null },
        { subject: 'Doi mat khau tai khoan', content: 'Toi quen mat khau, lam sao de dat lai?', status: 'answered', reply: 'Ban co the dung chuc nang Quen mat khau o trang dang nhap nhe.' },
    ];

    for (let i = 0; i < ticketSeed.length; i++) {
        const t = ticketSeed[i];
        const cust = customers[i % customers.length];
        // gắn booking cho một số ticket
        const linkedBooking = i % 3 === 0 ? bookings[i % bookings.length].booking : null;
        await prisma.support_tickets.create({
            data: {
                user_id: cust.id,
                booking_id: linkedBooking ? linkedBooking.id : null,
                subject: t.subject,
                content: t.content,
                status: t.status,
                reply: t.reply,
                staff_user_id: t.reply ? (i % 2 === 0 ? staff : staff2).id : null,
                replied_at: t.reply ? new Date() : null,
            },
        });
    }

    // ─────────────── DONE ───────────────
    console.log('\n✅ Seed hoàn tất!');
    console.log(`   Users: ${users.length}`);
    console.log(`   Pricing plans: ${plans.length}`);
    console.log(`   Vehicles: ${vehicles.length}`);
    const bookingCount = await prisma.bookings.count();
    const invoiceCount = await prisma.invoices.count();
    const reviewTotal = await prisma.reviews.count();
    const ticketCount = await prisma.support_tickets.count();
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Invoices: ${invoiceCount}`);
    console.log(`   Reviews: ${reviewTotal}`);
    console.log(`   Support tickets: ${ticketCount}`);
    console.log('\n   Mat khau mac dinh moi tai khoan: 123456');
    console.log('   admin@evrental.com / manager@evrental.com / staff@evrental.com');
    console.log('   customer1..8@evrental.com');
    console.log('\n   ⚠ Nho dan URL anh Cloudinary vao field image_url cua tung xe (dang de trong).');
}

main()
    .catch((e) => {
        console.error('Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });