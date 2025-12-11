const express = require('express');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 8000;

// MySQL connection pool - update credentials if needed
const pool = mysql.createPool({
  host: 'localhost',
  user: 'food_app',
  password: 'qwertyuiop',
  database: 'food_macro_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// make pool available to routes via app.locals
app.locals.pool = pool;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'replace_this_secret_in_prod',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// simple middleware to expose user to views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
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
});
