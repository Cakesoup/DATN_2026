import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '@/lib/cloudinary.js';

export default function ImageUploader({ value, onChange }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handlePick = () => inputRef.current?.click();

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh tối đa 5MB');
            return;
        }

        try {
            setUploading(true);
            const url = await uploadImageToCloudinary(file);
            onChange?.(url);
            toast.success('Tải ảnh lên thành công');
        } catch (err) {
            toast.error(err.message || 'Tải ảnh thất bại');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

            {value ? (
                <div className="relative inline-block">
                    <img src={value} alt="Ảnh xe" className="h-16 w-32 rounded-2xl object-cover ring-1 ring-slate-200" />
                    <button type="button" onClick={() => onChange?.('')}
                            className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1.5 text-white shadow transition hover:bg-rose-600">
                        <X size={14} />
                    </button>
                    <button type="button" onClick={handlePick} disabled={uploading}
                            className="mt-2 block text-xs font-medium text-slate-600 underline disabled:opacity-50">
                        Đổi ảnh khác
                    </button>
                </div>
            ) : (
                <button type="button" onClick={handlePick} disabled={uploading}
                        className="flex h-16 w-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                    <span className="text-sm">{uploading ? 'Đang tải lên...' : 'Chọn ảnh xe'}</span>
                </button>
            )}
        </div>
    );
}