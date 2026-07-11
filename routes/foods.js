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

// Edit form (protected)
router.get('/edit/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const pool = req.app.locals.pool;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM foods WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.redirect('/foods');
    }

    res.render('edit_food', {
      food: rows[0],
      error: null
    });

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
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


router.post('/edit/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { name, calories, protein, carbs, fats } = req.body;

  const pool = req.app.locals.pool;

  try {

    await pool.query(
      `UPDATE foods
       SET
         name = ?,
         calories = ?,
         protein = ?,
         carbs = ?,
         fats = ?
       WHERE id = ?`,
      [
        name,
        parseInt(calories) || 0,
        parseFloat(protein) || 0,
        parseFloat(carbs) || 0,
        parseFloat(fats) || 0,
        req.params.id
      ]
    );

    res.redirect('/foods');

  } catch (err) {

    console.error(err);

    res.render('edit_food', {
      food: req.body,
      error: 'Database error'
    });

  }
});

// Delete food (protected)
router.post('/delete/:id', async (req, res) => {

  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const pool = req.app.locals.pool;

  try {

    await pool.query(
      'DELETE FROM foods WHERE id = ?',
      [req.params.id]
    );

    res.redirect('/foods');

  } catch (err) {

    console.error(err);
    res.sendStatus(500);

  }

});

module.exports = router;
