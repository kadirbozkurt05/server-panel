const Lesson = require('../models/Lesson');
const User = require('../models/User');
const AppError = require('../utils/error');

// Tüm dersleri getir (sayfalama ve filtreleme)
exports.getAllLessons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const query = {};

    // Tarih filtresi
    if (startDate && endDate) {
      query.tarih = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const total = await Lesson.countDocuments(query);
    const lessons = await Lesson.find(query)
      .populate('ogrenci_id', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-tarih');

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      total,
      data: {
        lessons,
      },
    });
  } catch (err) {
    next(new AppError('Dersler alınırken hata oluştu', 500));
  }
};

// Öğrenciye özel dersleri getir
exports.getStudentLessons = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, odeme_durumu, startDate, endDate } = req.query;

    // Öğrenci var mı?
    const student = await User.findById(id);
    if (!student || student.role !== 'öğrenci') {
      return next(new AppError('Öğrenci bulunamadı', 404));
    }

    const query = { ogrenci_id: id };
    if (odeme_durumu) query.odeme_durumu = odeme_durumu;
    if (startDate && endDate) {
      query.tarih = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const total = await Lesson.countDocuments(query);
    const lessons = await Lesson.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-tarih');

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      total,
      data: {
        lessons,
      },
    });
  } catch (err) {
    next(new AppError('Öğrenci dersleri alınırken hata oluştu', 500));
  }
};

// Öğrencinin kendi derslerini getir
exports.getMyLessons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, odeme_durumu, startDate, endDate } = req.query;

    // Öğrenci olduğunu kontrol et
    if (req.user.role !== 'öğrenci') {
      return next(new AppError('Bu işlem yalnızca öğrenciler için geçerlidir', 403));
    }

    const query = { ogrenci_id: req.user._id };
    if (odeme_durumu) query.odeme_durumu = odeme_durumu;
    if (startDate && endDate) {
      query.tarih = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const total = await Lesson.countDocuments(query);
    const lessons = await Lesson.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-tarih');

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      total,
      data: {
        lessons,
      },
    });
  } catch (err) {
    next(new AppError('Dersleriniz alınırken hata oluştu', 500));
  }
};

// Yeni ders ekle
exports.createLesson = async (req, res, next) => {
  try {
    const { ogrenci_id, tarih, saat, ucret } = req.body;

    // Gerekli alanları kontrol et
    if (!ogrenci_id || !tarih || !saat || !ucret) {
      return next(new AppError('Tüm alanlar zorunludur', 400));
    }

    // Öğrenci var mı?
    const student = await User.findById(ogrenci_id);
    if (!student || student.role !== 'öğrenci') {
      return next(new AppError('Öğrenci bulunamadı', 404));
    }

    const lesson = await Lesson.create({
      ogrenci_id,
      tarih,
      saat,
      ucret,
      odeme_durumu: 'ödenmedi',
    });

    res.status(201).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (err) {
    next(new AppError('Ders eklenirken hata oluştu', 400));
  }
};

// Ders güncelle (ödeme durumu)
exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { odeme_durumu } = req.body;

    if (!odeme_durumu) {
      return next(new AppError('Ödeme durumu zorunludur', 400));
    }

    if (!['ödendi', 'ödenmedi'].includes(odeme_durumu)) {
      return next(new AppError('Geçersiz ödeme durumu', 400));
    }

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { odeme_durumu },
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return next(new AppError('Ders bulunamadı', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson,
      },
    });
  } catch (err) {
    next(new AppError('Ders güncellenirken hata oluştu', 400));
  }
};

// Ders sil
exports.deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) {
      return next(new AppError('Ders bulunamadı', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(new AppError('Ders silinirken hata oluştu', 500));
  }
};

// ... Diğer import'lar ve fonksiyonlar aynı kalacak ...

exports.getMyLessons = async (req, res, next) => {
    try {
      const { page = 1, limit = 10, odeme_durumu, startDate, endDate, isFuture } = req.query;
  
      // Öğrenci olduğunu kontrol et
      if (req.user.role !== 'öğrenci') {
        return next(new AppError('Bu işlem yalnızca öğrenciler için geçerlidir', 403));
      }
  
      const query = { ogrenci_id: req.user._id };
      if (odeme_durumu) query.odeme_durumu = odeme_durumu;
      if (startDate && endDate) {
        query.tarih = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      if (isFuture === 'true') {
        query.tarih = { $gte: new Date() };
      }
  
      const total = await Lesson.countDocuments(query);
      const lessons = await Lesson.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort('-tarih');
  
      res.status(200).json({
        status: 'success',
        results: lessons.length,
        total,
        data: {
          lessons,
        },
      });
    } catch (err) {
      next(new AppError('Dersleriniz alınırken hata oluştu', 500));
    }
  };
  
  exports.getStudentLessons = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, odeme_durumu, startDate, endDate, isFuture } = req.query;
  
      // Öğrenci var mı?
      const student = await User.findById(id);
      if (!student || student.role !== 'öğrenci') {
        return next(new AppError('Öğrenci bulunamadı', 404));
      }
  
      const query = { ogrenci_id: id };
      if (odeme_durumu) query.odeme_durumu = odeme_durumu;
      if (startDate && endDate) {
        query.tarih = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      if (isFuture === 'true') {
        query.tarih = { $gte: new Date() };
      }
  
      const total = await Lesson.countDocuments(query);
      const lessons = await Lesson.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort('-tarih');
  
      res.status(200).json({
        status: 'success',
        results: lessons.length,
        total,
        data: {
          lessons,
        },
      });
    } catch (err) {
      next(new AppError('Öğrenci dersleri alınırken hata oluştu', 500));
    }
  };