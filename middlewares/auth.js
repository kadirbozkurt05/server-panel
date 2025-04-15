const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/error');

// JWT doğrulama
exports.protect = async (req, res, next) => {
  try {
    // Token'ı al
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Giriş yapmanız gerekiyor', 401));
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Bu kullanıcı bulunamadı', 401));
    }

    // Kullanıcıyı req nesnesine ekle
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Geçersiz token', 401));
  }
};

// Öğretmen kısıtlaması
exports.restrictToTeacher = (req, res, next) => {
  if (req.user.role !== 'öğretmen') {
    return next(new AppError('Bu işlem için öğretmen yetkisi gerekiyor', 403));
  }
  next();
};