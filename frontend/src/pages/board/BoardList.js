import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../../api/axios';
import Layout from '../../components/Layout';
import PostCard from '../../components/PostCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BoardList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const categoryId = searchParams.get('category_id') || '';
  const sort = searchParams.get('sort') || 'latest';

  useEffect(() => {
    axios.get('/categories').then(res => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set('category_id', categoryId);
    if (sort) params.set('sort', sort);
    const q = searchParams.get('search');
    if (q) params.set('search', q);
    const tag = searchParams.get('hashtag');
    if (tag) params.set('hashtag', tag);

    axios.get(`/posts?${params}`)
      .then(res => setPosts(res.data.posts))
      .finally(() => setLoading(false));
  }, [categoryId, sort, searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam('search', search.trim() || null);
  };

  return (
    <Layout>
      <div className='space-y-4'>
        <form onSubmit={handleSearch} className='flex gap-2'>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='검색어 입력...'
            className='flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white text-sm focus:outline-none focus:border-emerald-400'
          />
          <button type='submit' className='px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm'>검색</button>
        </form>

        <div className='flex gap-2 overflow-x-auto pb-1'>
          <button
            onClick={() => updateParam('category_id', null)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${!categoryId ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            전체
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => updateParam('category_id', String(c.id))}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${categoryId === String(c.id) ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className='flex gap-2'>
          {['latest', 'popular'].map(s => (
            <button
              key={s}
              onClick={() => updateParam('sort', s)}
              className={`text-xs px-3 py-1.5 rounded-lg ${sort === s ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
            >
              {s === 'latest' ? '최신순' : '인기순'}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <p className='text-center text-gray-500 py-20 text-sm'>게시글이 없습니다.</p>
        ) : (
          <div className='grid gap-4'>
            {posts.map(p => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
