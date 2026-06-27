import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Zap, Battery, ShieldCheck, MapPin, Star, CarFront, ArrowRight,
    Clock, Wallet, Headphones, ChevronRight, Menu, X,
} from 'lucide-react';
import { getCustomerVehicles } from '@/features/customer/vehicles/vehicle.api.js';
import { getActivePricingPlans } from '@/features/customer/pricing/pricing.api.js';

function formatMoney(v) { return Number(v || 0).toLocaleString('vi-VN'); }

function Navbar() {
    const [open, setOpen] = useState(false);
    const links = [
        { href: '#vehicles', label: 'Dòng xe' },
        { href: '#pricing', label: 'Bảng giá' },
        { href: '#about', label: 'Về chúng tôi' },
        { href: '#why', label: 'Vì sao chọn' },
    ];
    return (
        <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/85 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-emerald-500 p-2 text-white"><Zap size={20} className="fill-white" /></div>
                    <div>
                        <div className="text-lg font-extrabold tracking-tight text-slate-900">EV Rental</div>
                        <div className="-mt-1 text-[11px] font-medium text-emerald-600">by Smart Brain JSC</div>
                    </div>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {links.map((l) => (
                        <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 transition hover:text-emerald-600">{l.label}</a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Đăng nhập</Link>
                    <Link to="/register" className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">Đăng ký</Link>
                </div>

                <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-700 md:hidden">
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open ? (
                <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
                    <nav className="flex flex-col gap-3">
                        {links.map((l) => <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">{l.label}</a>)}
                        <div className="mt-2 flex gap-3">
                            <Link to="/login" className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700">Đăng nhập</Link>
                            <Link to="/register" className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-white">Đăng ký</Link>
                        </div>
                    </nav>
                </div>
            ) : null}
        </header>
    );
}

function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
                <div className="space-y-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                        <Zap size={14} className="fill-emerald-700" /> Di chuyển xanh, tiết kiệm mỗi ngày
                    </span>
                    <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
                        Thuê xe điện tại Hà Nội<br /><span className="text-emerald-600">nhanh, rẻ, không khói bụi</span>
                    </h1>
                    <p className="max-w-md text-lg text-slate-600">
                        Đặt xe máy điện theo giờ hoặc theo ngày chỉ trong vài phút. Pin đầy, giao xe tận nơi, giá minh bạch.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-600">
                            Bắt đầu thuê xe <ArrowRight size={18} />
                        </Link>
                        <a href="#vehicles" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50">
                            Xem dòng xe
                        </a>
                    </div>
                    <div className="flex gap-8 pt-4">
                        {[['500+', 'Xe điện'], ['12K+', 'Khách hàng'], ['4.8★', 'Đánh giá']].map(([n, l]) => (
                            <div key={l}><div className="text-2xl font-extrabold text-slate-900">{n}</div><div className="text-sm text-slate-500">{l}</div></div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-emerald-900/5">
                        <div className="mb-6 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-12 text-white">
                            <CarFront size={96} strokeWidth={1.2} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {[[Battery, 'Pin 100%'], [Zap, 'Đổi pin 30s'], [ShieldCheck, 'Bảo hiểm']].map(([Icon, label], i) => (
                                <div key={i} className="space-y-2">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon size={20} /></div>
                                    <div className="text-xs font-medium text-slate-600">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function VehicleSection() {
    const { data, isLoading } = useQuery({
        queryKey: ['home', 'vehicles'],
        queryFn: () => getCustomerVehicles({ limit: 6, sort_by: 'newest' }),
        retry: false,
    });
    const vehicles = data?.data || [];

    return (
        <section id="vehicles" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dòng xe nổi bật</h2>
                <p className="mt-2 text-slate-600">Đa dạng mẫu mã, phù hợp mọi nhu cầu di chuyển.</p>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-slate-400">Đang tải xe...</div>
            ) : vehicles.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 py-12 text-center text-slate-500">
                    Đăng nhập để xem danh sách xe đầy đủ.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {vehicles.map((v) => (
                        <div key={v.id} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
                            {v.image_url ? (
                                <img src={v.image_url} alt={v.name} className="h-48 w-full object-cover" />
                            ) : (
                                <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-300"><CarFront size={56} /></div>
                            )}
                            <div className="space-y-3 p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{v.name}</h3>
                                        <p className="text-xs text-slate-500">{v.brand}</p>
                                    </div>
                                    {v.average_rating != null ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                                            <Star size={12} className="fill-amber-500 text-amber-500" /> {v.average_rating}
                                        </span>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1"><Battery size={13} /> {v.battery_level ?? 0}%</span>
                                    {v.range_km ? <span>{v.range_km} km/lần sạc</span> : null}
                                </div>
                                <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                                    <div>
                                        <span className="text-lg font-extrabold text-emerald-600">{formatMoney(v.effective_price_per_day)}đ</span>
                                        <span className="text-xs text-slate-400">/ngày</span>
                                    </div>
                                    <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:gap-2">
                                        Thuê ngay <ChevronRight size={15} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function PricingSection() {
    const { data, isLoading } = useQuery({
        queryKey: ['home', 'pricing'],
        queryFn: () => getActivePricingPlans({ limit: 3 }),
        retry: false,
    });
    const plans = data?.data || [];

    return (
        <section id="pricing" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Bảng giá minh bạch</h2>
                    <p className="mt-2 text-slate-600">Không phí ẩn. Chọn gói phù hợp với nhu cầu của bạn.</p>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-slate-400">Đang tải bảng giá...</div>
                ) : plans.length === 0 ? (
                    <div className="rounded-3xl bg-white py-12 text-center text-slate-500">Bảng giá sẽ sớm được cập nhật.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {plans.map((p, i) => (
                            <div key={p.id} className={`flex flex-col rounded-3xl p-7 shadow-sm ${i === 1 ? 'bg-emerald-600 text-white ring-2 ring-emerald-600' : 'bg-white ring-1 ring-slate-100'}`}>
                                <h3 className={`font-bold ${i === 1 ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                                <p className={`mt-1 text-sm ${i === 1 ? 'text-emerald-50' : 'text-slate-500'}`}>{p.description || 'Gói thuê linh hoạt'}</p>
                                <div className="mt-5">
                                    <span className="text-3xl font-extrabold">{formatMoney(p.price_per_day)}đ</span>
                                    <span className={i === 1 ? 'text-emerald-100' : 'text-slate-400'}>/ngày</span>
                                </div>
                                <div className={`mt-1 text-sm ${i === 1 ? 'text-emerald-100' : 'text-slate-500'}`}>{formatMoney(p.price_per_hour)}đ/giờ</div>
                                <div className={`mt-5 space-y-2 border-t pt-5 text-sm ${i === 1 ? 'border-emerald-500' : 'border-slate-100'}`}>
                                    <div className="flex items-center gap-2"><ShieldCheck size={15} /> Cọc {Math.round(Number(p.deposit_rate || 0) * 100)}%</div>
                                    <div className="flex items-center gap-2"><Battery size={15} /> Pin đầy khi nhận</div>
                                    <div className="flex items-center gap-2"><Headphones size={15} /> Hỗ trợ 24/7</div>
                                </div>
                                <Link to="/register" className={`mt-6 rounded-2xl px-4 py-3 text-center text-sm font-semibold transition ${i === 1 ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                                    Chọn gói này
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function WhySection() {
    const items = [
        [Wallet, 'Giá tiết kiệm', 'Rẻ hơn xe xăng tới 60% chi phí nhiên liệu mỗi tháng.'],
        [Clock, 'Đặt xe 2 phút', 'Quy trình đặt xe online nhanh gọn, nhận xe ngay.'],
        [Battery, 'Pin luôn đầy', 'Xe được sạc đầy và kiểm tra kỹ trước mỗi chuyến.'],
        [ShieldCheck, 'An toàn & bảo hiểm', 'Mọi chuyến đi đều được bảo hiểm đầy đủ.'],
    ];
    return (
        <section id="why" className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-10 text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Vì sao chọn EV Rental</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map(([Icon, title, desc], i) => (
                    <div key={i} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Icon size={22} /></div>
                        <h3 className="font-bold text-slate-900">{title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function AboutSection() {
    return (
        <section id="about" className="bg-slate-900 py-20 text-white">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
                <div className="space-y-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-sm font-semibold text-emerald-400">
                        <Zap size={14} /> Về chúng tôi
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight">Công ty Cổ phần Smart Brain</h2>
                    <p className="text-slate-300">
                        Smart Brain JSC là doanh nghiệp công nghệ tiên phong trong lĩnh vực giao thông xanh tại Việt Nam.
                        Với nền tảng EV Rental, chúng tôi mang đến giải pháp thuê xe máy điện thông minh — kết nối khách hàng
                        với mạng lưới xe điện rộng khắp, vận hành minh bạch và thân thiện môi trường.
                    </p>
                    <p className="text-slate-300">
                        Sứ mệnh của chúng tôi là thúc đẩy lối sống bền vững, giảm phát thải và biến di chuyển điện hóa thành
                        lựa chọn hàng ngày của mọi người dân đô thị.
                    </p>
                    <div className="grid grid-cols-3 gap-6 pt-2">
                        {[['2021', 'Thành lập'], ['8+', 'Tỉnh thành'], ['500+', 'Xe điện']].map(([n, l]) => (
                            <div key={l}><div className="text-2xl font-extrabold text-emerald-400">{n}</div><div className="text-sm text-slate-400">{l}</div></div>
                        ))}
                    </div>
                </div>
                <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-10">
                    <div className="space-y-4">
                        {[['Tầm nhìn', 'Dẫn đầu thị trường thuê xe điện Đông Nam Á vào 2030.'],
                            ['Giá trị cốt lõi', 'Xanh — Minh bạch — Tận tâm — Đổi mới.'],
                            ['Cam kết', 'Mỗi chuyến đi là một bước tới tương lai không khói bụi.']].map(([t, d]) => (
                            <div key={t} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                                <h4 className="font-bold">{t}</h4>
                                <p className="mt-1 text-sm text-emerald-50">{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    return (
        <section className="mx-auto max-w-7xl px-6 py-20">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-14 text-center text-white">
                <h2 className="text-3xl font-extrabold tracking-tight">Sẵn sàng cho chuyến đi xanh đầu tiên?</h2>
                <p className="mx-auto mt-3 max-w-md text-emerald-50">Đăng ký miễn phí và đặt chiếc xe điện đầu tiên của bạn ngay hôm nay.</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link to="/register" className="rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-600 transition hover:bg-emerald-50">Đăng ký ngay</Link>
                    <Link to="/login" className="rounded-2xl border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">Đăng nhập</Link>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-slate-200 bg-white py-12">
            <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-xl bg-emerald-500 p-2 text-white"><Zap size={18} className="fill-white" /></div>
                        <div className="text-lg font-extrabold text-slate-900">EV Rental</div>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Công ty Cổ phần Smart Brain — Giải pháp thuê xe điện thông minh.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900">Dịch vụ</h4>
                    <ul className="mt-3 space-y-2 text-sm text-slate-500">
                        <li><a href="#vehicles" className="hover:text-emerald-600">Thuê xe điện</a></li>
                        <li><a href="#pricing" className="hover:text-emerald-600">Bảng giá</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900">Công ty</h4>
                    <ul className="mt-3 space-y-2 text-sm text-slate-500">
                        <li><a href="#about" className="hover:text-emerald-600">Về chúng tôi</a></li>
                        <li><a href="#why" className="hover:text-emerald-600">Vì sao chọn</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900">Liên hệ</h4>
                    <ul className="mt-3 space-y-2 text-sm text-slate-500">
                        <li className="flex items-center gap-2"><MapPin size={14} /> Hà Nội, Việt Nam</li>
                        <li>hotline@smartbrain.vn</li>
                    </ul>
                </div>
            </div>
            <div className="mx-auto mt-8 max-w-7xl border-t border-slate-100 px-6 pt-6 text-center text-sm text-slate-400">
                © 2026 Công ty Cổ phần Smart Brain. Bảo lưu mọi quyền.
            </div>
        </footer>
    );
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <Hero />
            <VehicleSection />
            <PricingSection />
            <WhySection />
            <AboutSection />
            <CtaSection />
            <Footer />
        </div>
    );
}