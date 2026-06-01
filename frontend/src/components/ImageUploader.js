import { useState, useRef, useEffect } from 'react';
import { processImageFiles, formatFileSize } from '../utils/imageCompress';
import { getImageSrc } from '../utils/image';

const MAX_COUNT = 10;

export default function ImageUploader({
  onChange,
  existingUrls = [],
  onClearExisting,
  label = '사진 추가',
}) {
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => () => {
    itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview));
  }, []);

  const syncFiles = (next) => {
    setItems(next);
    onChange(next.map((i) => i.file));
  };

  const remaining = MAX_COUNT - items.length - (existingUrls?.length || 0);

  const handleSelect = async (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    if (selected.length === 0) return;

    setError('');
    const slots = remaining;
    if (slots <= 0) {
      setError(`이미지는 최대 ${MAX_COUNT}장까지 등록할 수 있습니다.`);
      return;
    }

    const toAdd = selected.slice(0, slots);
    if (selected.length > slots) {
      setError(`최대 ${MAX_COUNT}장까지 가능합니다. ${slots}장만 추가됩니다.`);
    }

    setCompressing(true);
    try {
      const processed = await processImageFiles(toAdd);
      if (onClearExisting && processed.length > 0) onClearExisting();
      syncFiles([...itemsRef.current, ...processed]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCompressing(false);
    }
  };

  const removeItem = (id) => {
    const target = itemsRef.current.find((i) => i.id === id);
    if (target) URL.revokeObjectURL(target.preview);
    syncFiles(itemsRef.current.filter((i) => i.id !== id));
  };

  const totalSaved = items.reduce((sum, i) => sum + Math.max(0, i.originalSize - i.compressedSize), 0);

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-2 flex-wrap'>
        <button
          type='button'
          disabled={compressing || remaining <= 0}
          onClick={() => fileRef.current?.click()}
          className='text-sm text-emerald-400 hover:underline disabled:opacity-50 disabled:no-underline'
        >
          {compressing ? '⏳ 압축 중...' : `📷 ${label} (${items.length + existingUrls.length}/${MAX_COUNT})`}
        </button>
        {items.length > 0 && totalSaved > 0 && (
          <span className='text-xs text-gray-500'>
            압축으로 약 {formatFileSize(totalSaved)} 절약
          </span>
        )}
      </div>

      <input
        ref={fileRef}
        type='file'
        accept='image/jpeg,image/png,image/gif,image/webp'
        multiple
        onChange={handleSelect}
        className='hidden'
      />

      {error && <p className='text-red-400 text-xs'>{error}</p>}

      {(existingUrls.length > 0 || items.length > 0) && (
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
          {existingUrls.map((url, i) => (
            <div key={`ex-${i}`} className='relative aspect-square rounded-xl overflow-hidden bg-gray-700 ring-1 ring-gray-600'>
              <img src={getImageSrc(url)} alt='' className='w-full h-full object-cover' />
              <span className='absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-gray-300'>기존</span>
            </div>
          ))}

          {items.map((item) => {
            const saved = item.originalSize - item.compressedSize;
            const pct = item.originalSize > 0 ? Math.round((saved / item.originalSize) * 100) : 0;
            return (
              <div key={item.id} className='relative aspect-square rounded-xl overflow-hidden bg-gray-700 ring-1 ring-emerald-500/30 group'>
                <img src={item.preview} alt='' className='w-full h-full object-cover' />
                <button
                  type='button'
                  onClick={() => removeItem(item.id)}
                  className='absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs sm:opacity-0 sm:group-hover:opacity-100 transition'
                  aria-label='삭제'
                >
                  ✕
                </button>
                <div className='absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1'>
                  <p className='text-[10px] text-gray-300 leading-tight'>
                    {formatFileSize(item.originalSize)} → {formatFileSize(item.compressedSize)}
                  </p>
                  {saved > 0 && <p className='text-[10px] text-emerald-400'>-{pct}%</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className='text-gray-500 text-xs'>
        업로드 전 자동 압축 (최대 1200px, JPEG). jpg/png/gif/webp · 장당 5MB 이하
      </p>
    </div>
  );
}
