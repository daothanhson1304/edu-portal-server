import express from 'express';
import { signJwt } from '../utils/jwt.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '');
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res
        .status(401)
        .json({ error: 'Không đúng tài khoản hoặc mật khẩu' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('Không tìm thấy JWT_SECRET');
      return res.status(500).json({ error: 'Lỗi server' });
    }

    const token = signJwt({ uid: 'admin-fixed', email });

    res.cookie('session', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // đổi 'none' nếu cross-site
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('session', { path: '/' });
  res.json({ ok: true });
});
export default router;
