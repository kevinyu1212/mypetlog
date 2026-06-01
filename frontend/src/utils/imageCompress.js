const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_MB = 5;

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const validateImageFile = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'jpg, png, gif, webp 파일만 업로드 가능합니다.';
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `파일 크기는 ${MAX_FILE_MB}MB 이하여야 합니다.`;
  }
  return null;
};

/**
 * Canvas로 리사이즈 + JPEG 압축 (gif는 첫 프레임만)
 */
export const compressImage = (file, { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = {}) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Promise.reject(new Error('지원하지 않는 이미지 형식입니다.'));
  }

  // 이미 작은 JPEG는 압축 생략
  if (file.type === 'image/jpeg' && file.size < 400 * 1024) {
    return Promise.resolve(file);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 압축에 실패했습니다.'));
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
          const compressed = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('이미지를 불러올 수 없습니다.'));
    };

    img.src = objectUrl;
  });
};

export const processImageFiles = async (files, options) => {
  const results = [];
  for (const file of files) {
    const err = validateImageFile(file);
    if (err) throw new Error(err);
    const originalSize = file.size;
    const compressed = await compressImage(file, options);
    results.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: compressed,
      preview: URL.createObjectURL(compressed),
      originalSize,
      compressedSize: compressed.size,
    });
  }
  return results;
};
