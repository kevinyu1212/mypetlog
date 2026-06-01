import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <h1 className='text-4xl font-bold text-emerald-400'>🐾 MyPetLog</h1>
        {user ? (
          <>
            <p className='text-white text-lg'>{user.nickname}님 환영합니다!</p>
            <div className='flex gap-3 justify-center'>
              <Link to='/mypage' className='px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm'>마이페이지</Link>
              <button onClick={handleLogout} className='px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm'>로그아웃</button>
            </div>
          </>
        ) : (
          <div className='flex gap-3 justify-center'>
            <Link to='/login' className='px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm'>로그인</Link>
            <Link to='/register' className='px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm'>회원가입</Link>
          </div>
        )}
      </div>
    </div>
  );
}
