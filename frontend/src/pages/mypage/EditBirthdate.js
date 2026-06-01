import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

export default function EditBirthdate() {
  const navigate = useNavigate();
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!birthdate) return setError('생년월일을 선택해주세요.');
    try {
      await axios.patch('/user/birthdate', { birthdate });
      setSuccess('생년월일이 변경되었습니다!');
      setTimeout(() => navigate('/mypage'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || '변경 실패');
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl p-8'>
        <div className='flex items-center mb-6'>
          <Link to='/mypage' className='text-gray-400 hover:text-white mr-3'>←</Link>
          <h2 className='text-xl font-bold text-white'>생년월일 변경</h2>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input type='date' value={birthdate} onChange={e => setBirthdate(e.target.value)}
            className='w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-emerald-400 text-sm' />
          {error && <p className='text-red-400 text-xs'>{error}</p>}
          {success && <p className='text-emerald-400 text-xs'>{success}</p>}
          <button type='submit' className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm'>변경하기</button>
        </form>
      </div>
    </div>
  );
}
