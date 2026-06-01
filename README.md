# 🐾 MyPetLog

희귀 반려동물 커뮤니티 (React + Express + MySQL + Cloudinary)

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React, React Router, Axios, Context API, Tailwind CSS |
| Backend | Node.js, Express, JWT, Bcrypt, Multer |
| Database | MySQL |
| Storage | Cloudinary |

## 로컬 실행

### 1. MySQL

```sql
CREATE DATABASE mypetlog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend

```powershell
cd backend
copy .env.example .env
# .env 편집: DB, JWT_SECRET, Cloudinary 키

npm install
npm run db:init
npm run cloudinary:test
npm run dev
```

### 3. Frontend

```powershell
cd frontend
copy .env.example .env
npm install
npm start
```

- 프론트: http://localhost:3000  
- API: http://localhost:5000  

## 환경 변수

### backend/.env

| 변수 | 설명 |
|------|------|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL |
| `JWT_SECRET` | JWT 서명 키 |
| `CLOUDINARY_*` | Cloudinary Dashboard |
| `FRONTEND_URL` | (배포) CORS 허용 origin |

### frontend/.env

| 변수 | 설명 |
|------|------|
| `REACT_APP_API_URL` | 백엔드 URL (예: `http://localhost:5000`) |

## API 테스트

```powershell
cd backend
npm run test:api
```

## GitHub 푸시

```powershell
git add .
git status   # .env 가 포함되지 않았는지 확인
git commit -m "커밋 메시지"
git push origin main
```

> **주의:** `.env` 파일은 절대 커밋하지 마세요. `.env.example`만 올립니다.

## 배포 가이드 (권장 구성)

```
[ Vercel / Netlify ]  →  React (frontend)
         ↓ REACT_APP_API_URL
[ Render / Railway ]  →  Express (backend)
         ↓
[ PlanetScale / Railway MySQL ]  →  MySQL
[ Cloudinary ]  →  이미지
```

### Backend (Render 예시)

1. [Render](https://render.com) → New **Web Service** → GitHub `mypetlog` 연결
2. Root Directory: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Environment Variables: `.env.example` 참고하여 입력
6. `FRONTEND_URL` = 프론트 배포 URL

### Frontend (Vercel 예시)

1. [Vercel](https://vercel.com) → Import `mypetlog`
2. Root Directory: `frontend`
3. Build: `npm run build`
4. Environment: `REACT_APP_API_URL=https://your-backend.onrender.com`

### DB (배포)

- Railway MySQL, PlanetScale, AWS RDS 등 호스트 제공 DB 사용
- `npm run db:init` 은 로컬에서 배포 DB URL로 한 번 실행하거나, `backend/db/board_schema.sql` 을 Workbench에서 실행

## 주요 API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/categories` | 카테고리 |
| GET | `/api/posts` | 게시글 목록 |
| POST | `/api/posts` | 게시글 작성 (이미지) |
| GET | `/api/posts/:id` | 상세 |
| POST/DELETE | `/api/posts/:id/like` | 좋아요 |
| GET/POST | `/api/posts/:id/comments` | 댓글 |

## 카테고리

파충류 · 양서류 · 절지류 · 어류 · 희귀 포유류 · 기타 생물
