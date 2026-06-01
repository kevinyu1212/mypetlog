import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getImageSrc } from '../../utils/image';

export default function PostDetail() {
  const { postId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const fetchPost = () => axios.get(`/posts/${postId}`).then(res => setPost(res.data.post));
  const fetchComments = () => axios.get(`/posts/${postId}/comments`).then(res => setComments(res.data.comments));

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments()]).finally(() => setLoading(false));
  }, [postId]);

  const handleLike = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      if (liked) {
        const res = await axios.delete(`/posts/${postId}/like`);
        setPost(p => ({ ...p, like_count: res.data.like_count }));
        setLiked(false);
      } else {
        const res = await axios.post(`/posts/${postId}/like`);
        setPost(p => ({ ...p, like_count: res.data.like_count }));
        setLiked(true);
      }
    } catch (err) {
      showToast(err.response?.data?.message || '오류 발생', 'error');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    try {
      await axios.post(`/posts/${postId}/comments`, { content: commentText });
      setCommentText('');
      await fetchComments();
      setPost(p => ({ ...p, comment_count: p.comment_count + 1 }));
      showToast('댓글이 작성되었습니다!');
    } catch (err) {
      showToast(err.response?.data?.message || '댓글 작성 실패', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/posts/${postId}/comments/${commentId}`);
      await fetchComments();
      setPost(p => ({ ...p, comment_count: Math.max(p.comment_count - 1, 0) }));
      showToast('댓글이 삭제되었습니다.');
    } catch (err) {
      showToast(err.response?.data?.message || '삭제 실패', 'error');
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      await axios.patch(`/posts/${postId}/comments/${commentId}`, { content: editCommentText });
      setEditCommentId(null);
      await fetchComments();
      showToast('댓글이 수정되었습니다.');
    } catch (err) {
      showToast(err.response?.data?.message || '수정 실패', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/posts/${postId}`);
      showToast('게시글이 삭제되었습니다.');
      navigate('/board');
    } catch (err) {
      showToast(err.response?.data?.message || '삭제 실패', 'error');
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (!post) return <Layout><p className='text-center text-gray-500 py-20'>게시글을 찾을 수 없습니다.</p></Layout>;

  const isOwner = user?.id === post.user_id;

  return (
    <Layout>
      <div className='space-y-6'>
        <Link to='/board' className='text-gray-400 hover:text-white text-sm'>← 목록으로</Link>

        <article className='bg-gray-800 rounded-2xl overflow-hidden'>
          {post.images?.length > 0 && (
            <div className='space-y-1'>
              {post.images.map((src, i) => (
                <img key={i} src={getImageSrc(src)} alt='' className='w-full object-cover max-h-96' />
              ))}
            </div>
          )}

          <div className='p-5'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='text-xs px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400'>{post.category_name}</span>
              <span className='text-gray-500 text-xs'>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
            </div>

            <h1 className='text-white text-xl font-bold mb-3'>{post.title}</h1>

            <div className='flex items-center gap-2 mb-4'>
              <div className='w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm overflow-hidden'>
                {post.author_profile_image ? (
                  <img src={getImageSrc(post.author_profile_image)} alt='' className='w-full h-full object-cover' />
                ) : '🐾'}
              </div>
              <span className='text-gray-300 text-sm'>{post.author_nickname}</span>
            </div>

            <p className='text-gray-300 text-sm whitespace-pre-wrap mb-4'>{post.content}</p>

            {post.hashtag_list?.length > 0 && (
              <div className='flex gap-2 flex-wrap mb-4'>
                {post.hashtag_list.map(tag => (
                  <Link key={tag} to={`/board?hashtag=${tag}`} className='text-xs text-emerald-400 hover:underline'>#{tag}</Link>
                ))}
              </div>
            )}

            <div className='flex items-center gap-4 pt-4 border-t border-gray-700'>
              <button onClick={handleLike} className={`text-sm ${liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}>
                ❤️ {post.like_count}
              </button>
              <span className='text-gray-500 text-sm'>💬 {post.comment_count}</span>
              {isOwner && (
                <div className='ml-auto flex gap-2'>
                  <Link to={`/board/${postId}/edit`} className='text-xs text-gray-400 hover:text-white'>수정</Link>
                  <button onClick={handleDeletePost} className='text-xs text-red-400 hover:text-red-300'>삭제</button>
                </div>
              )}
            </div>
          </div>
        </article>

        <section className='bg-gray-800 rounded-2xl p-5'>
          <h3 className='text-white font-semibold text-sm mb-4'>댓글 {comments.length}</h3>

          {user && (
            <form onSubmit={handleComment} className='flex gap-2 mb-4'>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder='댓글을 입력하세요...'
                className='flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white text-sm focus:outline-none focus:border-emerald-400'
              />
              <button type='submit' className='px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm'>작성</button>
            </form>
          )}

          <div className='space-y-3'>
            {comments.map(c => (
              <div key={c.id} className='flex gap-3 py-3 border-b border-gray-700 last:border-0'>
                <div className='w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs overflow-hidden shrink-0'>
                  {c.profile_image ? (
                    <img src={getImageSrc(c.profile_image)} alt='' className='w-full h-full object-cover' />
                  ) : '🐾'}
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-gray-300 text-xs font-medium'>{c.nickname}</span>
                    <span className='text-gray-600 text-xs'>{new Date(c.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {editCommentId === c.id ? (
                    <div className='flex gap-2'>
                      <input value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className='flex-1 px-3 py-1 rounded bg-gray-900 border border-gray-700 text-white text-xs' />
                      <button onClick={() => handleUpdateComment(c.id)} className='text-xs text-emerald-400'>저장</button>
                      <button onClick={() => setEditCommentId(null)} className='text-xs text-gray-500'>취소</button>
                    </div>
                  ) : (
                    <p className='text-gray-400 text-sm'>{c.content}</p>
                  )}
                  {user?.id === c.user_id && editCommentId !== c.id && (
                    <div className='flex gap-2 mt-1'>
                      <button onClick={() => { setEditCommentId(c.id); setEditCommentText(c.content); }} className='text-xs text-gray-500 hover:text-white'>수정</button>
                      <button onClick={() => handleDeleteComment(c.id)} className='text-xs text-gray-500 hover:text-red-400'>삭제</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className='text-gray-500 text-sm text-center py-4'>첫 댓글을 남겨보세요!</p>}
          </div>
        </section>
      </div>
    </Layout>
  );
}
