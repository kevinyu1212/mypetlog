import { Link } from 'react-router-dom';
import { getImageSrc } from '../utils/image';

export default function PostCard({ post }) {
  const date = new Date(post.created_at).toLocaleDateString('ko-KR');

  return (
    <Link to={`/board/${post.id}`} className='block bg-gray-800 rounded-2xl overflow-hidden hover:ring-1 hover:ring-emerald-500/30 transition'>
      {post.thumbnail && (
        <div className='aspect-video bg-gray-700 overflow-hidden'>
          <img src={getImageSrc(post.thumbnail)} alt='' className='w-full h-full object-cover' />
        </div>
      )}
      <div className='p-4'>
        <div className='flex items-center gap-2 mb-2'>
          <span className='text-xs px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-400'>{post.category_name}</span>
          <span className='text-gray-500 text-xs'>{date}</span>
        </div>
        <h3 className='text-white font-semibold text-sm mb-1 line-clamp-1'>{post.title}</h3>
        <p className='text-gray-400 text-xs line-clamp-2 mb-3'>{post.content}</p>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs overflow-hidden'>
              {post.author_profile_image ? (
                <img src={getImageSrc(post.author_profile_image)} alt='' className='w-full h-full object-cover' />
              ) : '🐾'}
            </div>
            <span className='text-gray-300 text-xs'>{post.author_nickname}</span>
          </div>
          <div className='flex gap-3 text-gray-500 text-xs'>
            <span>❤️ {post.like_count}</span>
            <span>💬 {post.comment_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
