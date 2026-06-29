const prisma = require('../src/config/prisma');


const packages = [
    { plan_code: 'PKG_3D',  name: 'Gói 3 ngày',  duration_days: 3,  package_price: 850000 },
    { plan_code: 'PKG_7D',  name: 'Gói 7 ngày',  duration_days: 7,  package_price: 1800000 },
    { plan_code: 'PKG_14D', name: 'Gói 14 ngày', duration_days: 14, package_price: 3400000 },
    { plan_code: 'PKG_30D', name: 'Gói 30 ngày', duration_days: 30, package_price: 6500000 },
];

async function main() {
    for (const p of packages) {
        const data = {
            plan_code: p.plan_code,
            name: p.name,
            duration_days: p.duration_days,
            package_price: p.package_price,
            price_per_hour: 0,
            price_per_day: 0,
            deposit_rate: 0.3,
            is_active: true,
        };
        await prisma.pricing_plans.upsert({
            where: { plan_code: p.plan_code },
            update: data,
            create: data,
        });
        console.log(`✓ ${p.plan_code} - ${p.name} (${p.duration_days} ngày, ${p.package_price.toLocaleString('vi-VN')}đ)`);
    }
    console.log(`\nHoàn tất: đã thêm/cập nhật ${packages.length} gói chu kỳ.`);
}

main()
    .catch((e) => { console.error('Seed lỗi:', e); process.exit(1); })
    .finally(() => process.exit(0));