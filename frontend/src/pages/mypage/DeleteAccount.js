import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function DeleteAccount() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!window.confirm('정말로 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    try {
      await axios.delete('/user/account', { data: { password } });
      logout();
      alert('회원 탈퇴가 완료되었습니다.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || '탈퇴 실패');
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl p-8'>
        <div className='flex items-center mb-6'>
          <Link to='/mypage' className='text-gray-400 hover:text-white mr-3'>←</Link>
          <h2 className='text-xl font-bold text-red-400'>회원 탈퇴</h2>
        </div>
        <p className='text-gray-400 text-sm mb-6'>탈퇴 시 모든 게시글, 댓글, 좋아요 데이터가 삭제되며 복구가 불가능합니다.</p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input type='password' placeholder='비밀번호 확인' value={password}
            onChange={e => setPassword(e.target.value)}
            className='w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-red-400 text-sm' />
          {error && <p className='text-red-400 text-xs'>{error}</p>}
          <button type='submit'
            className='w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm'>탈퇴하기</button>
        </form>
      </div>
    </div>
  );
}
