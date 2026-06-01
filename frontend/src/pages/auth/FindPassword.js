import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const STEPS = { EMAIL: 1, QUESTION: 2, DONE: 3 };

export default function FindPassword() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [error, setError] = useState('');

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 text-sm';

  const handleGetQuestion = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await axios.post('/auth/security-question', { email });
      setQuestion(res.data.security_question);
      setStep(STEPS.QUESTION);
    } catch (err) {
      setError(err.response?.data?.message || '조회 실패');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setError('');
    if (newPw !== newPwConfirm) return setError('비밀번호가 일치하지 않습니다.');
    try {
      await axios.post('/auth/reset-password', { email, security_answer: answer, new_password: newPw });
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.response?.data?.message || '재설정 실패');
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center px-4'>
      <div className='w-full max-w-sm bg-gray-800 rounded-2xl shadow-xl p-8'>
        <h2 className='text-xl font-bold text-emerald-400 mb-6 text-center'>비밀번호 찾기</h2>

        {step === STEPS.EMAIL && (
          <form onSubmit={handleGetQuestion} className='space-y-4'>
            <input placeholder='가입한 이메일' value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            {error && <p className='text-red-400 text-xs text-center'>{error}</p>}
            <button type='submit' className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm'>다음</button>
          </form>
        )}

        {step === STEPS.QUESTION && (
          <form onSubmit={handleReset} className='space-y-4'>
            <p className='text-gray-300 text-sm bg-gray-700 rounded-lg px-4 py-3'>{question}</p>
            <input placeholder='보안 답변' value={answer} onChange={e => setAnswer(e.target.value)} className={inputClass} />
            <input type='password' placeholder='새 비밀번호' value={newPw} onChange={e => setNewPw(e.target.value)} className={inputClass} />
            <input type='password' placeholder='새 비밀번호 확인' value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} className={inputClass} />
            {error && <p className='text-red-400 text-xs text-center'>{error}</p>}
            <button type='submit' className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm'>비밀번호 변경</button>
          </form>
        )}

        {step === STEPS.DONE && (
          <div className='text-center space-y-4'>
            <p className='text-emerald-400 text-lg'>✓ 비밀번호가 변경되었습니다!</p>
            <Link to='/login' className='block w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm text-center'>로그인하기</Link>
          </div>
        )}

        <p className='text-center text-gray-400 text-xs mt-4'>
          <Link to='/login' className='hover:text-emerald-400'>로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
