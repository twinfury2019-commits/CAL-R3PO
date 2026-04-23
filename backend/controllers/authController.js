const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id:       user._id,
        username: user.username,
        role:     user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.create({ username, password, role });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id:       user._id,
        username: user.username,
        role:     user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
