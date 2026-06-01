import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function MyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get('/user/profile')
      .then(res => setProfile(res.data))
      .catch(() => { logout(); navigate('/login'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
      <p className='text-gray-400'>로딩 중...</p>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-900 py-10 px-4'>
      <div className='max-w-lg mx-auto'>

        {/* 헤더 */}
        <div className='flex items-center justify-between mb-8'>
          <Link to='/' className='text-gray-400 hover:text-white text-sm'>← 홈으로</Link>
          <h1 className='text-xl font-bold text-white'>마이페이지</h1>
          <button onClick={() => { logout(); navigate('/login'); }}
            className='text-red-400 hover:text-red-300 text-sm'>로그아웃</button>
        </div>

        {/* 프로필 카드 */}
        <div className='bg-gray-800 rounded-2xl p-6 mb-4 text-center'>
          <div className='w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4'>
            🐾
          </div>
          <h2 className='text-white text-xl font-bold'>{profile.nickname}</h2>
          <p className='text-gray-400 text-sm mt-1'>{profile.email}</p>
          <p className='text-gray-500 text-xs mt-1'>
            {profile.birthdate ? profile.birthdate.slice(0, 10) : '생년월일 미설정'}
          </p>
          <p className='text-gray-500 text-xs mt-1'>
            가입일: {new Date(profile.created_at).toLocaleDateString('ko-KR')}
          </p>

          {/* 활동 통계 */}
          <div className='flex justify-around mt-6 pt-4 border-t border-gray-700'>
            <div>
              <p className='text-emerald-400 text-xl font-bold'>{profile.stats.posts}</p>
              <p className='text-gray-400 text-xs'>게시글</p>
            </div>
            <div>
              <p className='text-emerald-400 text-xl font-bold'>{profile.stats.likes}</p>
              <p className='text-gray-400 text-xs'>좋아요</p>
            </div>
            <div>
              <p className='text-emerald-400 text-xl font-bold'>{profile.stats.comments}</p>
              <p className='text-gray-400 text-xs'>댓글</p>
            </div>
          </div>
        </div>

        {/* 설정 메뉴 */}
        <div className='bg-gray-800 rounded-2xl overflow-hidden mb-4'>
          <p className='text-gray-400 text-xs px-5 py-3 border-b border-gray-700'>계정 설정</p>
          {[
            { label: '닉네임 변경', path: '/mypage/edit-nickname', icon: '✏️' },
            { label: '생년월일 변경', path: '/mypage/edit-birthdate', icon: '🎂' },
            { label: '비밀번호 변경', path: '/mypage/edit-password', icon: '🔒' },
            { label: '보안 질문 변경', path: '/mypage/edit-security', icon: '🛡️' },
          ].map(item => (
            <Link key={item.path} to={item.path}
              className='flex items-center justify-between px-5 py-4 hover:bg-gray-700 transition border-b border-gray-700 last:border-0'>
              <span className='text-white text-sm'>{item.icon} {item.label}</span>
              <span className='text-gray-500'>›</span>
            </Link>
          ))}
        </div>

        {/* 회원 탈퇴 */}
        <div className='bg-gray-800 rounded-2xl overflow-hidden'>
          <Link to='/mypage/delete-account'
            className='flex items-center justify-between px-5 py-4 hover:bg-gray-700 transition'>
            <span className='text-red-400 text-sm'>🚪 회원 탈퇴</span>
            <span className='text-gray-500'>›</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
