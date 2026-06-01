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

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '',
    nickname: '', birthdate: '',
    security_question: SECURITY_QUESTIONS[0], security_answer: '',
  });
  const [checks, setChecks] = useState({ email: null, nickname: null });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'email') setChecks(prev => ({ ...prev, email: null }));
    if (name === 'nickname') setChecks(prev => ({ ...prev, nickname: null }));
  };

  const checkDuplicate = async (type) => {
    try {
      const payload = type === 'email' ? { email: form.email } : { nickname: form.nickname };
      await axios.post('/auth/check-' + type, payload);
      setChecks(prev => ({ ...prev, [type]: true }));
    } catch {
      setChecks(prev => ({ ...prev, [type]: false }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '이메일 형식이 올바르지 않습니다.';
    else if (checks.email === null) e.email = '이메일 중복 확인을 해주세요.';
    else if (checks.email === false) e.email = '이미 사용 중인 이메일입니다.';
    if (!form.password) e.password = '비밀번호를 입력해주세요.';
    else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(form.password))
      e.password = '8자 이상, 영문/숫자/특수문자를 포함해야 합니다.';
    if (form.password !== form.passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    if (!form.nickname) e.nickname = '닉네임을 입력해주세요.';
    else if (checks.nickname === null) e.nickname = '닉네임 중복 확인을 해주세요.';
    else if (checks.nickname === false) e.nickname = '이미 사용 중인 닉네임입니다.';
    if (!form.birthdate) e.birthdate = '생년월일을 입력해주세요.';
    if (!form.security_answer) e.security_answer = '보안 답변을 입력해주세요.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      await axios.post('/auth/register', {
        email: form.email, password: form.password,
        nickname: form.nickname, birthdate: form.birthdate,
        security_question: form.security_question,
        security_answer: form.security_answer,
      });
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 text-sm';
  const errorClass = 'text-red-400 text-xs mt-1';
  const checkBtn = 'ml-2 px-3 py-2 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white whitespace-nowrap';

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center py-10 px-4'>
      <div className='w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-emerald-400'>🐾 MyPetLog</h1>
          <p className='text-gray-400 text-sm mt-1'>회원가입</p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>

          <div>
            <div className='flex'>
              <input name='email' placeholder='이메일' value={form.email} onChange={handleChange} className={inputClass} />
              <button type='button' onClick={() => checkDuplicate('email')} className={checkBtn}>중복확인</button>
            </div>
            {checks.email === true && <p className='text-emerald-400 text-xs mt-1'>✓ 사용 가능한 이메일입니다.</p>}
            {checks.email === false && <p className={errorClass}>✗ 이미 사용 중인 이메일입니다.</p>}
            {errors.email && <p className={errorClass}>{errors.email}</p>}
          </div>

          <div>
            <input name='password' type='password' placeholder='비밀번호 (8자 이상, 영문/숫자/특수문자)' value={form.password} onChange={handleChange} className={inputClass} />
            {errors.password && <p className={errorClass}>{errors.password}</p>}
          </div>
          <div>
            <input name='passwordConfirm' type='password' placeholder='비밀번호 확인' value={form.passwordConfirm} onChange={handleChange} className={inputClass} />
            {errors.passwordConfirm && <p className={errorClass}>{errors.passwordConfirm}</p>}
          </div>

          <div>
            <div className='flex'>
              <input name='nickname' placeholder='닉네임 (2~20자)' value={form.nickname} onChange={handleChange} className={inputClass} />
              <button type='button' onClick={() => checkDuplicate('nickname')} className={checkBtn}>중복확인</button>
            </div>
            {checks.nickname === true && <p className='text-emerald-400 text-xs mt-1'>✓ 사용 가능한 닉네임입니다.</p>}
            {checks.nickname === false && <p className={errorClass}>✗ 이미 사용 중인 닉네임입니다.</p>}
            {errors.nickname && <p className={errorClass}>{errors.nickname}</p>}
          </div>

          <div>
            <input name='birthdate' type='date' value={form.birthdate} onChange={handleChange} className={inputClass} />
            {errors.birthdate && <p className={errorClass}>{errors.birthdate}</p>}
          </div>

          <div>
            <select name='security_question' value={form.security_question} onChange={handleChange}
              className='w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white text-sm focus:outline-none focus:border-emerald-400'>
              {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <input name='security_answer' placeholder='보안 질문 답변' value={form.security_answer} onChange={handleChange} className={inputClass} />
            {errors.security_answer && <p className={errorClass}>{errors.security_answer}</p>}
          </div>

          <button type='submit' disabled={loading}
            className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition disabled:opacity-50'>
            {loading ? '처리 중...' : '회원가입'}
          </button>
        </form>
        <p className='text-center text-gray-400 text-sm mt-4'>
          이미 계정이 있으신가요? <Link to='/login' className='text-emerald-400 hover:underline'>로그인</Link>
        </p>
      </div>
    </div>
  );
}
