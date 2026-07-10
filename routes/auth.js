const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/foods');
    }
    res.render('login', { 
        error: null,
        user: null 
    });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const pool = req.app.locals.pool;
    
    console.log('Login attempt:', username, password); // ✅ Add this
    
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        console.log('Query result:', rows); // ✅ Add this
        
        if (rows.length > 0 && rows[0].password === password) {
            console.log('Login successful!'); // ✅ Add this
            req.session.user = username;
            res.redirect('/foods');
        } else {
            console.log('Login failed - no match'); // ✅ Add this
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
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;