export default function PlaceholderPage({ title }) {
    return (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-slate-600">Trang này đang được phát triển.</p>
        </div>
    );
}