export const login = async (req, res) => {
  const { email, password } = req.body;
  // TODO: kiểm tra DB...
  const token = signJwt({ uid: user._id }); // HS256 / RS256 tuỳ bạn

  res.cookie('session', token, {
    httpOnly: true,
    sameSite: 'lax', // tránh CSRF cơ bản khi cùng site
    secure: process.env.NODE_ENV === 'production',
    // domain: ".thcsdongthanhoanlong.edu.vn", // chỉ set ở PRODUCTION (đừng set khi localhost)
    path: '/',
    maxAge: 7 * 24 * 3600 * 1000,
  });
  res.json({ ok: true });
};

export const logout = (req, res) => {
  res.clearCookie('session', { path: '/' });
  res.json({ ok: true });
};
