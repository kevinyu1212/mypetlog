import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

export default function EditNickname() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [checked, setChecked] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const checkNickname = async () => {
    setError(''); setChecked(null);
    try {
      await axios.post('/auth/check-nickname', { nickname });
      setChecked(true);
    } catch {
      setChecked(false);
      setError('이미 사용 중인 닉네임입니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname) return setError('닉네임을 입력해주세요.');
    if (checked === null) return setError('닉네임 중복 확인을 해주세요.');
    if (checked === false) return setError('이미 사용 중인 닉네임입니다.');
    try {
      await axios.patch('/user/nickname', { nickname });
      setSuccess('닉네임이 변경되었습니다!');
      setTimeout(() => navigate('/mypage'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || '변경 실패');
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 text-sm';

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl p-8'>
        <div className='flex items-center mb-6'>
          <Link to='/mypage' className='text-gray-400 hover:text-white mr-3'>←</Link>
          <h2 className='text-xl font-bold text-white'>닉네임 변경</h2>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <div className='flex'>
              <input placeholder='새 닉네임 (2~20자)' value={nickname}
                onChange={e => { setNickname(e.target.value); setChecked(null); }}
                className={inputClass} />
              <button type='button' onClick={checkNickname}
                className='ml-2 px-3 py-2 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white whitespace-nowrap'>중복확인</button>
            </div>
            {checked === true && <p className='text-emerald-400 text-xs mt-1'>✓ 사용 가능한 닉네임입니다.</p>}
            {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
            {success && <p className='text-emerald-400 text-xs mt-1'>{success}</p>}
          </div>
          <button type='submit' className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm'>변경하기</button>
        </form>
      </div>
    </div>
  );
}
