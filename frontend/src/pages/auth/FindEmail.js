import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

export default function FindEmail() {
  const [form, setForm] = useState({ nickname: '', birthdate: '' });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(''); setError('');
    try {
      const res = await axios.post('/auth/find-email', form);
      setResult(res.data.email);
    } catch (err) {
      setError(err.response?.data?.message || '조회 실패');
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 text-sm';

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl shadow-xl p-8'>
        <h2 className='text-xl font-bold text-emerald-400 mb-6 text-center'>아이디 찾기</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input name='nickname' placeholder='닉네임' value={form.nickname}
            onChange={e => setForm(p => ({...p, nickname: e.target.value}))} className={inputClass} />
          <input name='birthdate' type='date' value={form.birthdate}
            onChange={e => setForm(p => ({...p, birthdate: e.target.value}))} className={inputClass} />
          {error && <p className='text-red-400 text-xs text-center'>{error}</p>}
          {result && <p className='text-emerald-400 text-sm text-center'>가입된 이메일: <strong>{result}</strong></p>}
          <button type='submit' className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm'>찾기</button>
        </form>
        <p className='text-center text-gray-400 text-xs mt-4'>
          <Link to='/login' className='hover:text-emerald-400'>로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
