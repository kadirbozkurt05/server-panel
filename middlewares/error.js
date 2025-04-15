const AppError = require('../utils/error');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Mongoose validasyon hataları
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      status: 'fail',
      message: messages.join(', '),
    });
  }

  // Mongoose yinelenen anahtar hatası
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'fail',
      message: `${field} zaten kullanımda`,
    });
  }

  // JWT hataları
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Geçersiz token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Token süresi dolmuş',
    });
  }

  // AppError ile tanımlı hatalar
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Bilinmeyen hatalar
  console.error('Bilinmeyen hata:', err);
  res.status(500).json({
    status: 'error',
    message: 'Bir şeyler ters gitti',
  });
};