const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body; // Modified to include role in the request
    if (!['employee', 'manager'].includes(role)) {
      return res.status(400).send('Invalid role specified');
    }
    // User model will automatically hash the password using bcrypt
    await User.create({ username, password, role });
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send(error.message);
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.userId = user._id;
      req.session.role = user.role; // Save user's role in session
      console.log(`User ${username} logged in as ${user.role}`); // Logging user login and role
      return res.redirect('/');
    } else {
      return res.status(400).send('Password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error(error.stack); // Logging the full error stack
    return res.status(500).send(error.message);
  }
});

router.get('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error during session destruction:', err);
      console.error(err.stack); // Logging the full error stack
      return res.status(500).send('Error logging out');
    }
    console.log('User logged out successfully'); // Logging logout success
    res.redirect('/auth/login');
  });
});

module.exports = router;