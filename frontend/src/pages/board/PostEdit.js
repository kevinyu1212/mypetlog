import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import ImageUploader from '../../components/ImageUploader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

export default function PostEdit() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category_id: '', hashtags: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('/categories'),
      axios.get(`/posts/${postId}`),
    ]).then(([catRes, postRes]) => {
      const cats = catRes.data.categories;
      const p = postRes.data.post;

      if (p.user_id !== user?.id) {
        showToast('수정 권한이 없습니다.', 'error');
        navigate(`/board/${postId}`);
        return;
      }

      const cat = cats.find(c => c.name === p.category_name);
      setCategories(cats);
      setForm({
        title: p.title,
        content: p.content,
        category_id: cat ? String(cat.id) : String(cats[0]?.id || ''),
        hashtags: p.hashtag_list?.map(t => `#${t}`).join(' ') || p.hashtags || '',
      });
      setExistingImages(p.images || []);
    }).finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('content', form.content);
    fd.append('category_id', form.category_id);
    fd.append('hashtags', form.hashtags);
    files.forEach(f => fd.append('images', f));

    setSubmitting(true);
    try {
      await axios.patch(`/posts/${postId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('게시글이 수정되었습니다!');
      navigate(`/board/${postId}`);
    } catch (err) {
      showToast(err.response?.data?.message || '수정 실패', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-emerald-400';

  if (loading) return <ProtectedRoute><Layout><LoadingSpinner /></Layout></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <Layout>
        <div className='max-w-lg mx-auto'>
          <div className='flex items-center mb-6'>
            <Link to={`/board/${postId}`} className='text-gray-400 hover:text-white mr-3'>←</Link>
            <h2 className='text-xl font-bold text-white'>게시글 수정</h2>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder='제목' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
            <textarea placeholder='내용' rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={inputClass} />
            <input placeholder='해시태그' value={form.hashtags} onChange={e => setForm({ ...form, hashtags: e.target.value })} className={inputClass} />

            <ImageUploader
              onChange={setFiles}
              existingUrls={existingImages}
              onClearExisting={() => setExistingImages([])}
              label='사진 변경'
            />

            <button type='submit' disabled={submitting} className='w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm'>
              {submitting ? '저장 중...' : '수정하기'}
            </button>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
