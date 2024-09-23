const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const { githubAuthRoutes } = require('./routes/authRoutes');
const { repoRoutes } = require('./routes/repoRoutes');
const path = require('path');

const app = express();

// Session and passport setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Routes
app.use('/auth', githubAuthRoutes);
app.use('/repo', repoRoutes);
// app.use('/gen', genRoutes);

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.send(`<h1>Hello, ${req.user.username}</h1>
                  <p><a href="/auth/github">View your GitHub Repos</a></p>
                  <p><a href="/logout">Logout</a></p>`);
    } else {
        res.send('<h1>Home</h1><p><a href="/auth/github">Login with GitHub</a></p>');
    }
});

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});