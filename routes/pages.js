const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {

    const pool = req.app.locals.pool;

    const [foods] = await pool.query(
        'SELECT * FROM foods ORDER BY calories DESC LIMIT 3'
    );

    res.render('home', {
        featuredFoods: foods
    });

});

router.get('/about', (req, res) => {
  res.render('about');
});

module.exports = router;
