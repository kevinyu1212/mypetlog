import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios, { SERVER_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function EditProfilePhoto() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const getImageSrc = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `${SERVER_URL}${img}`;
  };

  const currentImage = getImageSrc(user?.profile_image);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(selected.type)) {
      setError('jpg, png, gif, webp 파일만 업로드 가능합니다.');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('프로필 사진을 선택해주세요.');

    const formData = new FormData();
    formData.append('profile_image', file);

    setUploading(true);
    setError('');
    try {
      const res = await axios.patch('/user/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ ...user, profile_image: res.data.profile_image });
      setSuccess('프로필 사진이 변경되었습니다!');
      setTimeout(() => navigate('/mypage'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl p-8'>
        <div className='flex items-center mb-6'>
          <Link to='/mypage' className='text-gray-400 hover:text-white mr-3'>←</Link>
          <h2 className='text-xl font-bold text-white'>프로필 사진 변경</h2>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex flex-col items-center'>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='relative w-28 h-28 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center text-4xl mb-3 group'
            >
              {preview ? (
                <img src={preview} alt='미리보기' className='w-full h-full object-cover' />
              ) : currentImage ? (
                <img src={currentImage} alt='현재 프로필' className='w-full h-full object-cover' />
              ) : (
                '🐾'
              )}
              <span className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition'>
                사진 선택
              </span>
            </button>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/jpeg,image/png,image/gif,image/webp'
              onChange={handleFileChange}
              className='hidden'
            />
            <p className='text-gray-400 text-xs text-center'>
              jpg, png, gif, webp · 최대 5MB
            </p>
          </div>

          {error && <p className='text-red-400 text-xs'>{error}</p>}
          {success && <p className='text-emerald-400 text-xs'>{success}</p>}

          <button
            type='submit'
            disabled={uploading || !file}
            className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm'
          >
            {uploading ? '업로드 중...' : '변경하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
