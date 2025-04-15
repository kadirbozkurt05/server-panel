const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/error');

exports.register = async (req, res, next) => {
  try {
    const { name, email, username, password, role } = req.body;

    if (!name || !email || !username || !password || !role) {
      return next(new AppError('Tüm alanlar zorunludur', 400));
    }

    if (!['öğretmen', 'öğrenci'].includes(role)) {
      return next(new AppError('Geçersiz rol', 400));
    }

    const user = await User.create({ name, email, username, password, role });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return next(new AppError('Kimlik ve şifre zorunludur', 400));
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Geçersiz kimlik veya şifre', 401));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('name email username role');
    if (!user) {
      return next(new AppError('Kullanıcı bulunamadı', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    next(new AppError('Kullanıcı bilgileri alınırken hata oluştu', 500));
  }
};