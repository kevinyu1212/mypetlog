import ProtectedRoute from '../../components/ProtectedRoute';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';

const SECURITY_QUESTIONS = [
  '초등학교 때 별명은?',
  '첫 번째 반려동물 이름은?',
  '어머니의 고향은?',
  '가장 좋아하는 영화는?',
  '첫 직장 이름은?',
];

export default function EditSecurity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: '',
    security_question: SECURITY_QUESTIONS[0],
    security_answer: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await axios.patch('/user/security', form);
      setSuccess('보안 질문이 변경되었습니다!');
      setTimeout(() => navigate('/mypage'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || '변경 실패');
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 text-sm';

  return (
    <ProtectedRoute>
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl p-8'>
        <div className='flex items-center mb-6'>
          <Link to='/mypage' className='text-gray-400 hover:text-white mr-3'>←</Link>
          <h2 className='text-xl font-bold text-white'>보안 질문 변경</h2>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input type='password' placeholder='현재 비밀번호 확인' value={form.current_password}
            onChange={e => setForm(p => ({...p, current_password: e.target.value}))} className={inputClass} />
          <select value={form.security_question}
            onChange={e => setForm(p => ({...p, security_question: e.target.value}))}
            className='w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white text-sm focus:outline-none focus:border-emerald-400'>
            {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <input placeholder='새 보안 답변' value={form.security_answer}
            onChange={e => setForm(p => ({...p, security_answer: e.target.value}))} className={inputClass} />
          {error && <p className='text-red-400 text-xs'>{error}</p>}
          {success && <p className='text-emerald-400 text-xs'>{success}</p>}
          <button type='submit' className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm'>변경하기</button>
        </form>
      </div>
    </div>
  );
}

