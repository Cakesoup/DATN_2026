export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
    return (
        <div className="mt-4 flex items-center gap-2">
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="rounded border px-3 py-2 disabled:opacity-50"
            >
                Prev
            </button>
            <span className="text-sm text-slate-600">
        Trang {page} / {totalPages}
      </span>
            <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="rounded border px-3 py-2 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
}