const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();  // ✅ Load environment variables

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Get base path from environment
const BASE_PATH = process.env.HEALTH_BASE_PATH || '';

// MySQL connection pool
const pool = mysql.createPool({
<<<<<<< HEAD
  host: process.env.HEALTH_HOST || 'localhost',
  user: process.env.HEALTH_USER || 'health_app',
  password: process.env.HEALTH_PASSWORD || 'qwertyuiop',
  database: process.env.HEALTH_DATABASE || 'health',
=======
  host: 'localhost',
  user: 'cejeh001@localhost',      
  password: 'Chicken5',
  database: 'health',     
>>>>>>> parent of 3f102d1 (index.js pool update)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make pool and base path available to routes
app.locals.pool = pool;
app.locals.basePath = BASE_PATH;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.basePath = BASE_PATH;  // ✅ Make base path available to views
  next();
});

// Routes
const pagesRouter = require('./routes/pages');
const authRouter = require('./routes/auth');
const foodsRouter = require('./routes/foods');

app.use('/', pagesRouter);
app.use('/auth', authRouter);
app.use('/foods', foodsRouter);

app.listen(PORT, () => {
  console.log(`Food Macro Tracker listening on port ${PORT}`);
  console.log(`Base path: ${BASE_PATH || '(none - localhost)'}`);
});