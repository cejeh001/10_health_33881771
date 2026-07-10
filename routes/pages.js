const express = require('express');
const router = express.Router();

// ✅ Make base path available
router.use((req, res, next) => {
  res.locals.basePath = req.app.locals.basePath || '';
  next();
});

router.get('/', (req, res) => {
  const basePath = req.app.locals.basePath || '';
  res.render('home', { 
    user: req.session.user || null,
    basePath: basePath
  });
});

router.get('/home', (req, res) => {
  const basePath = req.app.locals.basePath || '';
  res.render('home', { 
    user: req.session.user || null,
    basePath: basePath
  });
});

router.get('/about', (req, res) => {
  const basePath = req.app.locals.basePath || '';
  res.render('about', { 
    user: req.session.user || null,
    basePath: basePath
  });
});

module.exports = router;