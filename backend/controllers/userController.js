const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const validatePassword = (pw) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(pw);

// 마이페이지 조회
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, nickname, birthdate, profile_image, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });

    const [postCount] = await db.query(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?', [req.user.id]
    );
    const [likeCount] = await db.query(
      'SELECT COUNT(*) as count FROM likes WHERE user_id = ?', [req.user.id]
    );
    const [commentCount] = await db.query(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = ?', [req.user.id]
    );

    res.json({
      ...rows[0],
      stats: {
        posts: postCount[0].count,
        likes: likeCount[0].count,
        comments: commentCount[0].count,
      }
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 닉네임 변경
exports.updateNickname = async (req, res) => {
  const { nickname } = req.body;
  if (!nickname || nickname.length < 2 || nickname.length > 20)
    return res.status(400).json({ message: '닉네임은 2자 이상 20자 이하여야 합니다.' });

  try {
    const [check] = await db.query(
      'SELECT id FROM users WHERE nickname = ? AND id != ?', [nickname, req.user.id]
    );
    if (check.length > 0)
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });

    await db.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname, req.user.id]);
    res.json({ message: '닉네임이 변경되었습니다.', nickname });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 프로필 사진 등록/변경
exports.updateProfileImage = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: '프로필 사진 파일을 선택해주세요.' });

  try {
    if (!isConfigured) {
      return res.status(500).json({
        message: 'Cloudinary 설정이 필요합니다. 환경변수를 확인해주세요.',
      });
    }

    // Upload buffer to Cloudinary and store the resulting secure URL.
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'mypetlog/profiles',
          resource_type: 'image',
          // Overwrite to avoid unbounded versions per user.
          public_id: `user-${req.user.id}`,
          overwrite: true,
        },
        (err, uploaded) => {
          if (err) return reject(err);
          resolve(uploaded);
        }
      );
      stream.end(req.file.buffer);
    });

    const imageUrl = result.secure_url;

    await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [
      imageUrl,
      req.user.id,
    ]);

    res.json({ message: '프로필 사진이 변경되었습니다.', profile_image: imageUrl });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 비밀번호 변경
exports.updatePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
  if (!validatePassword(new_password))
    return res.status(400).json({ message: '비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.' });

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch)
      return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: '비밀번호가 변경되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 보안 질문/답변 변경
exports.updateSecurity = async (req, res) => {
  const { current_password, security_question, security_answer } = req.body;
  if (!current_password || !security_question || !security_answer)
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, rows[0].password);
    if (!isMatch)
      return res.status(401).json({ message: '현재 비밀번호가 올바르지 않습니다.' });

    const hashedAnswer = await bcrypt.hash(security_answer.toLowerCase(), 10);
    await db.query(
      'UPDATE users SET security_question = ?, security_answer = ? WHERE id = ?',
      [security_question, hashedAnswer, req.user.id]
    );
    res.json({ message: '보안 질문이 변경되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 회원 탈퇴
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;
  if (!password)
    return res.status(400).json({ message: '비밀번호를 입력해주세요.' });

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch)
      return res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });

    await db.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};
