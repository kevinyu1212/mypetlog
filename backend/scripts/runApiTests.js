/**
 * MyPetLog API 통합 테스트
 * 사용: node scripts/runApiTests.js
 */
require('dotenv').config();
const db = require('../config/db');
const { isConfigured: cloudinaryConfigured } = require('../config/cloudinary');

const BASE = `http://localhost:${process.env.PORT || 5000}/api`;

async function request(method, path, { token, body, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !formData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData || (body ? JSON.stringify(body) : undefined),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  return { status: res.status, data };
}

async function run() {
  const results = [];
  const pass = (name) => { results.push({ name, ok: true }); console.log(`  ✅ ${name}`); };
  const fail = (name, msg) => { results.push({ name, ok: false, msg }); console.log(`  ❌ ${name}: ${msg}`); };

  console.log('\n=== MyPetLog API 테스트 ===\n');

  // 1. Cloudinary
  console.log('[1] Cloudinary');
  const health = await request('GET', '/health/cloudinary');
  const configured = cloudinaryConfigured || health.data.configured;
  if (configured) {
    pass('Cloudinary 설정됨');
    const { execSync } = require('child_process');
    try {
      execSync('node scripts/testCloudinary.js', { stdio: 'pipe' });
      pass('Cloudinary ping');
    } catch (e) {
      fail('Cloudinary ping', e.stderr?.toString() || '연결 실패');
    }
  } else {
    fail('Cloudinary 설정', 'backend/.env에 CLOUDINARY_* 값 입력 필요');
  }

  // 2. Categories
  console.log('\n[2] Categories');
  const cats = await request('GET', '/categories');
  if (cats.status === 200 && cats.data.categories?.length === 6) {
    pass(`카테고리 ${cats.data.categories.length}개`);
  } else {
    fail('카테고리', `status ${cats.status}`);
  }

  // 3. Posts list
  console.log('\n[3] Posts');
  const posts = await request('GET', '/posts');
  if (posts.status === 200) pass(`게시글 목록 (${posts.data.posts?.length ?? 0}건)`);
  else fail('게시글 목록', `status ${posts.status}`);

  const popular = await request('GET', '/posts?sort=popular');
  if (popular.status === 200) pass('인기순 정렬');
  else fail('인기순 정렬', `status ${popular.status}`);

  const postId = posts.data.posts?.[0]?.id;
  if (postId) {
    const detail = await request('GET', `/posts/${postId}`);
    if (detail.status === 200) pass(`게시글 상세 #${postId}`);
    else fail('게시글 상세', `status ${detail.status}`);

    const comments = await request('GET', `/posts/${postId}/comments`);
    if (comments.status === 200) pass(`댓글 목록 (${comments.data.comments?.length ?? 0}건)`);
    else fail('댓글 목록', `status ${comments.status}`);
  }

  const tags = await request('GET', '/hashtags');
  if (tags.status === 200) pass('해시태그 목록');
  else fail('해시태그 목록', `status ${tags.status}`);

  // 4. Login
  console.log('\n[4] Auth');
  let testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;

  if (!testEmail) {
    const [users] = await db.query('SELECT email FROM users LIMIT 1');
    testEmail = users[0]?.email;
  }

  const login = (testEmail && testPassword)
    ? await request('POST', '/auth/login', { body: { email: testEmail, password: testPassword } })
    : { status: 0, data: { message: 'TEST_PASSWORD 미설정' } };

  let token = null;
  if (login.status === 200 && login.data.token) {
    token = login.data.token;
    pass(`로그인 (${login.data.user?.nickname})`);
  } else {
    fail('로그인', login.data?.message || `status ${login.status} — .env에 TEST_PASSWORD=본인비밀번호 추가`);
  }

  if (token) {
    console.log('\n[5] Auth Required (Like / Comment / Write)');
    const authPostId = postId || posts.data.posts?.[0]?.id;
    if (authPostId) {
      const like = await request('POST', `/posts/${authPostId}/like`, { token });
      if (like.status === 200) pass(`좋아요 (count: ${like.data.like_count})`);
      else fail('좋아요', like.data?.message || `status ${like.status}`);

      const unlike = await request('DELETE', `/posts/${authPostId}/like`, { token });
      if (unlike.status === 200) pass(`좋아요 취소 (count: ${unlike.data.like_count})`);
      else fail('좋아요 취소', `status ${unlike.status}`);

      const comment = await request('POST', `/posts/${authPostId}/comments`, {
        token, body: { content: 'API 테스트 댓글 ' + Date.now() },
      });
      if (comment.status === 201) pass('댓글 작성');
      else fail('댓글 작성', comment.data?.message || `status ${comment.status}`);
    }

    // 6. Post create (no image)
    console.log('\n[6] Post Create');
    const create = await request('POST', '/posts', {
      token,
      formData: (() => {
        const fd = new FormData();
        fd.append('title', 'API 테스트 게시글');
        fd.append('content', 'Cloudinary 테스트용 게시글입니다.');
        fd.append('category_id', '1');
        fd.append('hashtags', '#테스트 #api');
        return fd;
      })(),
    });
    if (create.status === 201) {
      pass(`게시글 작성 (id: ${create.data.post_id})`);
    } else {
      fail('게시글 작성', create.data?.message || `status ${create.status}`);
    }
  }

  // Summary
  const ok = results.filter(r => r.ok).length;
  const ng = results.filter(r => !r.ok).length;
  console.log(`\n=== 결과: ${ok} passed, ${ng} failed ===\n`);

  if (!configured) {
    console.log('📌 Cloudinary 키 입력 후: npm run cloudinary:test\n');
  }

  process.exit(ng > 0 ? 1 : 0);
}

run().catch(err => { console.error(err); process.exit(1); });
