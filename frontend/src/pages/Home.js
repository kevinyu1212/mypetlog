import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='text-center space-y-6 max-w-md'>
        <h1 className='text-4xl font-bold text-emerald-400'>🐾 MyPetLog</h1>
        <p className='text-gray-400 text-sm'>희귀 반려동물 커뮤니티</p>
        {user && <p className='text-white'>{user.nickname}님 환영합니다!</p>}
        <Link to='/board' className='inline-block px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition'>
          게시판 바로가기 →
        </Link>
      </div>
    </div>
  );
}
