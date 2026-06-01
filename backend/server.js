const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { isConfigured } = require('./config/cloudinary');

const app = express();
const corsOrigin = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
  : true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api', require('./routes/board'));

app.get('/', (req, res) => {
  res.json({ message: 'MyPetLog API Server Running!' });
});

app.get('/api/health/cloudinary', (_req, res) => {
  res.json({ configured: isConfigured });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  if (!isConfigured) {
    console.warn('[WARN] Cloudinary 미설정 → 이미지 업로드 불가. backend/.env 확인 후 npm run cloudinary:test');
  } else {
    console.log('[OK] Cloudinary 설정됨');
  }
});
