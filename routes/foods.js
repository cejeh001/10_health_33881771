const express = require('express');
const router = express.Router();

// list all foods
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.query('SELECT * FROM foods ORDER BY name ASC');
    res.render('foods', { foods: rows });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// search
router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.query('SELECT * FROM foods WHERE name LIKE ? ORDER BY name ASC', ['%' + q + '%']);
    res.render('search', { foods: rows, q });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// add form (protected)
router.get('/add', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('add_food', { error: null });
});

router.post('/add', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');

  const { name, calories, protein, carbs, fats } = req.body;
  const pool = req.app.locals.pool;
  try {
    await pool.query(
      'INSERT INTO foods (name, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?)',
      [name, parseInt(calories)||0, parseFloat(protein)||0, parseFloat(carbs)||0, parseFloat(fats)||0]
    );
    res.redirect('/foods');
  } catch (err) {
    console.error(err);
    res.render('add_food', { error: 'Database error' });
  }
});

module.exports = router;
