import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className='min-h-screen bg-gray-900'>
      <header className='sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800'>
        <div className='max-w-3xl mx-auto px-4 h-14 flex items-center justify-between'>
          <Link to='/board' className='text-lg font-bold text-emerald-400'>🐾 MyPetLog</Link>
          <nav className='flex items-center gap-3'>
            {user ? (
              <>
                <Link to='/board/write' className='text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white'>
                  글쓰기
                </Link>
                <Link to='/mypage' className='text-gray-300 hover:text-white text-sm'>{user.nickname}</Link>
                <button onClick={handleLogout} className='text-gray-500 hover:text-red-400 text-xs'>로그아웃</button>
              </>
            ) : (
              <>
                <Link to='/login' className='text-gray-300 hover:text-white text-sm'>로그인</Link>
                <Link to='/register' className='text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white'>회원가입</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className='max-w-3xl mx-auto px-4 py-6'>
        {children}
      </main>
    </div>
  );
}
