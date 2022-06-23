// if (process.env.NODE_ENV !== "production") {
//   require('dotenv').config();
// }

require('dotenv').config();


const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./Model/user');
const mongoSanitize = require('express-mongo-sanitize')

const hubRoutes = require('./routes/hubs');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');

const MongoDBStore = require('connect-mongo')(session)
// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/flexhub-Db'
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('database connected successfully');
  })
  .catch(err => {
    console.log(err);
  });

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = new MongoDBStore({
  url:dbUrl,
  secret,
  touchAfter: 24 *60*60
})

store.on('error', function(e){
  console.log('SESSION STORE ERROR', e)
})

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

// configuring passport and passport local to work with passport-local-mongoose

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if (!['/login', '/'].includes(req.originalUrl)) {
    req.session.returnTo = req.originalUrl;
  }
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', userRoutes);
app.use('/hubs', hubRoutes);
app.use('/hubs/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'oh no, something went wrong';
  res.status(statusCode).render('error', { err });
});


const port = process.env.PORT || 3000

app.listen(3000, () => {
  console.log(`listening on port ${port}`);
});
