import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

export default function EditPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current_password: '', new_password: '', new_password_confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.new_password_confirm)
      return setError('새 비밀번호가 일치하지 않습니다.');
    try {
      await axios.patch('/user/password', {
        current_password: form.current_password,
        new_password: form.new_password
      });
      setSuccess('비밀번호가 변경되었습니다!');
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
          <h2 className='text-xl font-bold text-white'>비밀번호 변경</h2>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input type='password' placeholder='현재 비밀번호' value={form.current_password}
            onChange={e => setForm(p => ({...p, current_password: e.target.value}))} className={inputClass} />
          <input type='password' placeholder='새 비밀번호 (8자 이상, 영문/숫자/특수문자)' value={form.new_password}
            onChange={e => setForm(p => ({...p, new_password: e.target.value}))} className={inputClass} />
          <input type='password' placeholder='새 비밀번호 확인' value={form.new_password_confirm}
            onChange={e => setForm(p => ({...p, new_password_confirm: e.target.value}))} className={inputClass} />
          {error && <p className='text-red-400 text-xs'>{error}</p>}
          {success && <p className='text-emerald-400 text-xs'>{success}</p>}
          <button type='submit' className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm'>변경하기</button>
        </form>
      </div>
    </div>
  );
}
