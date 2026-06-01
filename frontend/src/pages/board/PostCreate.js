import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import ImageUploader from '../../components/ImageUploader';
import { useToast } from '../../context/ToastContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function PostCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category_id: '', hashtags: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/categories').then(res => {
      setCategories(res.data.categories);
      if (res.data.categories.length > 0) {
        setForm(f => ({ ...f, category_id: String(res.data.categories[0].id) }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.category_id) {
      showToast('모든 필드를 입력해주세요.', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('content', form.content);
    fd.append('category_id', form.category_id);
    if (form.hashtags) fd.append('hashtags', form.hashtags);
    files.forEach(f => fd.append('images', f));

    setLoading(true);
    try {
      const res = await axios.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('게시글이 작성되었습니다!');
      navigate(`/board/${res.data.post_id}`);
    } catch (err) {
      showToast(err.response?.data?.message || '작성 실패', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-emerald-400';

  return (
    <ProtectedRoute>
      <Layout>
        <div className='max-w-lg mx-auto'>
          <div className='flex items-center mb-6'>
            <Link to='/board' className='text-gray-400 hover:text-white mr-3'>←</Link>
            <h2 className='text-xl font-bold text-white'>게시글 작성</h2>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input placeholder='제목' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
            <textarea placeholder='내용' rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={inputClass} />
            <input placeholder='해시태그 (예: #도마뱀 #파충류)' value={form.hashtags} onChange={e => setForm({ ...form, hashtags: e.target.value })} className={inputClass} />

            <ImageUploader onChange={setFiles} label='사진 추가' />

            <button type='submit' disabled={loading} className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm'>
              {loading ? '업로드 중...' : '작성하기'}
            </button>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
