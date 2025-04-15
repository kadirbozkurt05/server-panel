const User = require('../models/User');
const Lesson = require('../models/Lesson'); // Ders silmek için
const AppError = require('../utils/error');
const jwt = require('jsonwebtoken');

// Öğrenci listesini getir
exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'öğrenci' }).select('name email username');

    res.status(200).json({
      status: 'success',
      results: students.length,
      data: {
        students,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Şifre değiştir
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Gerekli alanları kontrol et
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('Tüm alanlar zorunludur', 400));
    }

    // Şifrelerin eşleştiğini kontrol et
    if (newPassword !== confirmPassword) {
      return next(new AppError('Yeni şifreler eşleşmiyor', 400));
    }

    // Şifre uzunluğu kontrolü
    if (newPassword.length < 6) {
      return next(new AppError('Şifre en az 6 karakter olmalı', 400));
    }

    // Kullanıcıyı bul ve mevcut şifreyi doğrula
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return next(new AppError('Mevcut şifre yanlış', 401));
    }

    // Yeni şifreyi kaydet
    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

    // Yeni token oluştur
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
    return next(new AppError(`Şifre değiştirme hatası: ${err.message}`, 500));
  }
};

// Kullanıcı sil
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kullanıcıyı bul
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('Kullanıcı bulunamadı', 404));
    }

    // Öğretmenler kendilerini silemez
    if (user.role === 'öğretmen' && user._id.toString() === req.user._id.toString()) {
      return next(new AppError('Kendi hesabınızı silemezsiniz', 403));
    }

    // Kullanıcının derslerini sil
    await Lesson.deleteMany({ ogrenci_id: id });

    // Kullanıcıyı sil
    await User.findByIdAndDelete(id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(new AppError('Kullanıcı silinirken hata oluştu', 500));
  }
};
