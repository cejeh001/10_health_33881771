const express = require('express');
const router = express.Router();

// ✅ Get base path from app locals (set in index.js)
router.use((req, res, next) => {
  res.locals.basePath = req.app.locals.basePath || '';
  next();
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(res.locals.basePath + '/foods');
  }
  res.render('login', { 
    error: null,
    user: null
  });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const pool = req.app.locals.pool;
  const basePath = req.app.locals.basePath || '';
  
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length > 0 && rows[0].password === password) {
      req.session.user = username;
      // ✅ Redirect with base path
      res.redirect(basePath + '/foods');
    } else {
      res.render('login', { 
        error: 'Invalid username or password.',
        user: null
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { 
      error: 'Login failed. Please try again.',
      user: null
    });
  }
});

router.get('/logout', (req, res) => {
  const basePath = req.app.locals.basePath || '';
  req.session.destroy();
  res.redirect(basePath + '/');
});

module.exports = router;