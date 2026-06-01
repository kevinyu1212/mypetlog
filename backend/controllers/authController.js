const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pw) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(pw);
const validateBirthdate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

// 이메일 중복 확인
exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email || !validateEmail(email))
    return res.status(400).json({ message: '유효하지 않은 이메일 형식입니다.' });
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0)
      return res.status(409).json({ available: false, message: '이미 사용 중인 이메일입니다.' });
    res.json({ available: true, message: '사용 가능한 이메일입니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 닉네임 중복 확인
exports.checkNickname = async (req, res) => {
  const { nickname } = req.body;
  if (!nickname || nickname.length < 2 || nickname.length > 20)
    return res.status(400).json({ message: '닉네임은 2자 이상 20자 이하여야 합니다.' });
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE nickname = ?', [nickname]);
    if (rows.length > 0)
      return res.status(409).json({ available: false, message: '이미 사용 중인 닉네임입니다.' });
    res.json({ available: true, message: '사용 가능한 닉네임입니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 회원가입
exports.register = async (req, res) => {
  const { email, password, nickname, birthdate, security_question, security_answer } = req.body;

  if (!email || !password || !nickname || !birthdate || !security_question || !security_answer)
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });

  if (!validateEmail(email))
    return res.status(400).json({ message: '유효하지 않은 이메일 형식입니다.' });
  if (!validatePassword(password))
    return res.status(400).json({ message: '비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.' });
  if (nickname.length < 2 || nickname.length > 20)
    return res.status(400).json({ message: '닉네임은 2자 이상 20자 이하여야 합니다.' });
  if (!validateBirthdate(birthdate))
    return res.status(400).json({ message: '생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)' });

  try {
    const [emailCheck] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailCheck.length > 0)
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });

    const [nicknameCheck] = await db.query('SELECT id FROM users WHERE nickname = ?', [nickname]);
    if (nicknameCheck.length > 0)
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });

    const hashed = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(security_answer.toLowerCase(), 10);

    await db.query(
      'INSERT INTO users (email, password, nickname, birthdate, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashed, nickname, birthdate, security_question, hashedAnswer]
    );

    res.status(201).json({ message: '회원가입 성공' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: { id: user.id, email: user.email, nickname: user.nickname, profile_image: user.profile_image }
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 내 정보 조회
exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, nickname, birthdate, profile_image, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 아이디(이메일) 찾기 - 닉네임 + 생년월일
exports.findEmail = async (req, res) => {
  const { nickname, birthdate } = req.body;
  if (!nickname || !birthdate)
    return res.status(400).json({ message: '닉네임과 생년월일을 입력해주세요.' });

  try {
    const [rows] = await db.query(
      'SELECT email FROM users WHERE nickname = ? AND birthdate = ?',
      [nickname, birthdate]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: '일치하는 회원 정보가 없습니다.' });

    const email = rows[0].email;
    const masked = email.replace(/(?<=.{3}).(?=[^@]*@)/g, '*');
    res.json({ message: '이메일 찾기 성공', email: masked });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 보안 질문 조회
exports.getSecurityQuestion = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: '이메일을 입력해주세요.' });

  try {
    const [rows] = await db.query(
      'SELECT security_question FROM users WHERE email = ?', [email]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: '등록된 이메일이 없습니다.' });
    res.json({ security_question: rows[0].security_question });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};

// 비밀번호 재설정
exports.resetPassword = async (req, res) => {
  const { email, security_answer, new_password } = req.body;
  if (!email || !security_answer || !new_password)
    return res.status(400).json({ message: '모든 필드를 입력해주세요.' });

  if (!validatePassword(new_password))
    return res.status(400).json({ message: '비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.' });

  try {
    const [rows] = await db.query(
      'SELECT id, security_answer FROM users WHERE email = ?', [email]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: '등록된 이메일이 없습니다.' });

    const isMatch = await bcrypt.compare(security_answer.toLowerCase(), rows[0].security_answer);
    if (!isMatch)
      return res.status(401).json({ message: '보안 답변이 올바르지 않습니다.' });

    const hashed = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, rows[0].id]);

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
};
