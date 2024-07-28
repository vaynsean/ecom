const nodemailer = require('nodemailer');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;

    await user.save();

    const verificationUrl = `http://localhost:5000/api/users/verify-email/${verificationToken}`;
    console.log('Verification URL:', verificationUrl);

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Verify your email',
      text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error.message);
        return res.status(500).send('Error sending email');
      } else {
        console.log('Email sent:', info.response);
        res.json({ msg: 'Verification email sent' });
      }
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Server error');
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid token' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ msg: 'Email verified successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Server error');
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email first' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Server error');
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Server error');
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Server error');
  }
};

const updateUserRole = async (req, res) => {
  const { id, role } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.role = role;
    await user.save();
    res.json({ msg: 'User role updated successfully' });
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).send('Server error');
  }
};

module.exports = { registerUser, loginUser, getUserProfile, verifyEmail, getUsers, updateUserRole };
