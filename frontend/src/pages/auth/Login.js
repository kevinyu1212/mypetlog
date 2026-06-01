import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 text-sm';

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl shadow-xl p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-emerald-400'>🐾 MyPetLog</h1>
          <p className='text-gray-400 text-sm mt-1'>희귀 반려동물 커뮤니티</p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input name='email' placeholder='이메일' value={form.email} onChange={handleChange} className={inputClass} />
          <input name='password' type='password' placeholder='비밀번호' value={form.password} onChange={handleChange} className={inputClass} />
          {error && <p className='text-red-400 text-xs text-center'>{error}</p>}
          <button type='submit' disabled={loading}
            className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition disabled:opacity-50'>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className='flex justify-between text-xs text-gray-400 mt-4'>
          <Link to='/find-email' className='hover:text-emerald-400'>아이디 찾기</Link>
          <Link to='/find-password' className='hover:text-emerald-400'>비밀번호 찾기</Link>
          <Link to='/register' className='hover:text-emerald-400'>회원가입</Link>
        </div>
      </div>
    </div>
  );
}
