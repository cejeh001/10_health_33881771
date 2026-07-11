const express = require('express');
const router = express.Router();

// login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// handle login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Basic login against the users table
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      req.session.user = { id: rows[0].id, username: rows[0].username };
      return res.redirect('/');
    } else {
      return res.render('login', { error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    return res.render('login', { error: 'Database error' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
