const express = require('express');
const router = express.Router();

// Helper function to validate food data
function validateFoodData(name, calories) {
    const errors = [];
    if (!name || name.trim() === '') {
        errors.push('Food name is required');
    }
    if (!calories || isNaN(calories) || parseInt(calories) < 0) {
        errors.push('Calories must be a valid positive number');
    }
    return errors;
}

// LIST all foods
router.get('/', async (req, res) => {
    const pool = req.app.locals.pool;
    try {
        const [rows] = await pool.query('SELECT * FROM foods ORDER BY name ASC');
        const success = req.session.success || null;
        req.session.success = null;
        res.render('foods', { 
            foods: rows,
            user: req.session.user || null,  // ✅ ADDED
            success: success,
            error: null
        });
    } catch (err) {
        console.error('Error fetching foods:', err);
        res.render('foods', { 
            foods: [],
            user: req.session.user || null,  // ✅ ADDED
            success: null,
            error: 'Failed to load foods. Please try again.'
        });
    }
});

// SEARCH foods
router.get('/search', async (req, res) => {
    const q = req.query.q || '';
    const pool = req.app.locals.pool;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM foods WHERE name LIKE ? ORDER BY name ASC', 
            ['%' + q + '%']
        );
        res.render('search', { 
            foods: rows,
            q: q,
            user: req.session.user || null,  // ✅ ADDED
            error: null
        });
    } catch (err) {
        console.error('Error searching foods:', err);
        res.render('search', { 
            foods: [],
            q: q,
            user: req.session.user || null,  // ✅ ADDED
            error: 'Search failed. Please try again.'
        });
    }
});

// ADD form (protected)
router.get('/add', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('add_food', { 
        error: null,
        user: req.session.user || null,  // ✅ ADDED
        food: null
    });
});

// ADD food (POST)
router.post('/add', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const { name, calories, protein, carbs, fats } = req.body;
    
    const errors = validateFoodData(name, calories);
    if (errors.length > 0) {
        return res.render('add_food', { 
            error: errors.join('. '),
            user: req.session.user || null,  // ✅ ADDED
            food: null
        });
    }

    const pool = req.app.locals.pool;
    try {
        // Check if food already exists
        const [existing] = await pool.query('SELECT * FROM foods WHERE name = ?', [name.trim()]);
        if (existing.length > 0) {
            return res.render('add_food', { 
                error: `Food "${name}" already exists.`,
                user: req.session.user || null,  // ✅ ADDED
                food: null
            });
        }

        await pool.query(
            'INSERT INTO foods (name, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), parseInt(calories) || 0, parseFloat(protein) || 0, parseFloat(carbs) || 0, parseFloat(fats) || 0]
        );
        
        req.session.success = `Food "${name}" added successfully!`;
        res.redirect('/foods');
    } catch (err) {
        console.error('Error adding food:', err);
        res.render('add_food', { 
            error: 'Failed to add food. Please try again.',
            user: req.session.user || null,  // ✅ ADDED
            food: null
        });
    }
});

// EDIT form (protected)
router.get('/edit/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const foodId = req.params.id;
    const pool = req.app.locals.pool;
    
    try {
        const [rows] = await pool.query('SELECT * FROM foods WHERE id = ?', [foodId]);
        if (rows.length === 0) {
            return res.redirect('/foods');
        }
        res.render('add_food', { 
            error: null,
            user: req.session.user || null,  // ✅ ADDED
            food: rows[0]
        });
    } catch (err) {
        console.error('Error fetching food for edit:', err);
        res.redirect('/foods');
    }
});

// UPDATE food (POST)
router.post('/edit/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const foodId = req.params.id;
    const { name, calories, protein, carbs, fats } = req.body;
    
    const errors = validateFoodData(name, calories);
    if (errors.length > 0) {
        return res.render('add_food', { 
            error: errors.join('. '),
            user: req.session.user || null,  // ✅ ADDED
            food: { id: foodId, name, calories, protein, carbs, fats }
        });
    }

    const pool = req.app.locals.pool;
    try {
        await pool.query(
            'UPDATE foods SET name = ?, calories = ?, protein = ?, carbs = ?, fats = ? WHERE id = ?',
            [name.trim(), parseInt(calories) || 0, parseFloat(protein) || 0, parseFloat(carbs) || 0, parseFloat(fats) || 0, foodId]
        );
        
        req.session.success = `Food "${name}" updated successfully!`;
        res.redirect('/foods');
    } catch (err) {
        console.error('Error updating food:', err);
        res.render('add_food', { 
            error: 'Failed to update food. Please try again.',
            user: req.session.user || null,  // ✅ ADDED
            food: { id: foodId, name, calories, protein, carbs, fats }
        });
    }
});

// DELETE food (protected)
router.post('/delete/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const foodId = req.params.id;
    const pool = req.app.locals.pool;
    
    try {
        const [rows] = await pool.query('SELECT name FROM foods WHERE id = ?', [foodId]);
        if (rows.length === 0) {
            req.session.success = 'Food already deleted.';
            return res.redirect('/foods');
        }

        const foodName = rows[0].name;
        await pool.query('DELETE FROM foods WHERE id = ?', [foodId]);
        
        req.session.success = `Food "${foodName}" deleted successfully!`;
        res.redirect('/foods');
    } catch (err) {
        console.error('Error deleting food:', err);
        res.redirect('/foods');
    }
});

module.exports = router;