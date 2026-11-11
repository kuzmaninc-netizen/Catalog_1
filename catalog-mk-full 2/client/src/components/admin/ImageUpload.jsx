import { useRef, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Spinner } from '../StateViews';
import { CloseIcon, PlusIcon } from '../Icons';

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Прикачување слика → враќа URL (/uploads/...) преку onChange.
 */
export default function ImageUpload({ value, onChange, label = 'Слика', shape = 'square' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Изберете слика (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Сликата е преголема (макс. 5 MB).');
      return;
    }

    setUploading(true);
    try {
      const { url } = await adminApi.uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const box = shape === 'round' ? 'h-24 w-24 rounded-2xl' : 'aspect-square w-full max-w-[180px] rounded-2xl';

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`${box} relative flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 transition hover:bg-slate-100`}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-xs text-slate-500">
              <PlusIcon className="h-6 w-6" />
              Додај слика
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-navy-800">
              <Spinner className="h-6 w-6" />
            </span>
          )}
        </button>

        {value && !uploading && (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost px-3 py-2 text-xs">
              Промени
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="btn px-3 py-2 text-xs text-red-600 ring-1 ring-red-100 hover:bg-red-50"
            >
              <CloseIcon className="h-3.5 w-3.5" />
              Отстрани
            </button>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
