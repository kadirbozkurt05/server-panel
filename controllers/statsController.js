const Lesson = require('../models/Lesson');
const AppError = require('../utils/error');

// İstatistikleri getir (öğretmen için)
exports.getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    // Tarih filtresi
    if (startDate && endDate) {
      query.tarih = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // MongoDB aggregation pipeline
    const stats = await Lesson.aggregate([
      // Tarih filtresini uygula
      { $match: query },
      // Gruplama: ödeme durumuna göre
      {
        $group: {
          _id: '$odeme_durumu',
          totalLessons: { $sum: 1 },
          totalAmount: { $sum: '$ucret' },
        },
      },
    ]);

    // Varsayılan değerler
    let totalLessons = 0;
    let totalEarnings = 0;
    let pendingTotal = 0;
    let pendingPayments = 0;

    // Aggregation sonuçlarını işle
    stats.forEach((stat) => {
      totalLessons += stat.totalLessons;
      if (stat._id === 'ödendi') {
        totalEarnings = stat.totalAmount;
      } else if (stat._id === 'ödenmedi') {
        pendingTotal = stat.totalAmount;
        pendingPayments = stat.totalLessons;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalLessons,
          totalEarnings,
          pendingTotal,
          pendingPayments,
        },
      },
    });
  } catch (err) {
    next(new AppError('İstatistikler alınırken hata oluştu', 500));
  }
};

// Öğrencinin kendi istatistiklerini getir
exports.getMyStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Öğrenci olduğunu kontrol et
    if (req.user.role !== 'öğrenci') {
      return next(new AppError('Bu işlem yalnızca öğrenciler için geçerlidir', 403));
    }

    const query = { ogrenci_id: req.user._id };

    // Tarih filtresi
    if (startDate && endDate) {
      query.tarih = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // MongoDB aggregation pipeline
    const stats = await Lesson.aggregate([
      // Öğrenci ve tarih filtresini uygula
      { $match: query },
      // Gruplama: ödeme durumuna göre
      {
        $group: {
          _id: '$odeme_durumu',
          totalLessons: { $sum: 1 },
          totalAmount: { $sum: '$ucret' },
        },
      },
    ]);

    // Varsayılan değerler
    let totalLessons = 0;
    let paidTotal = 0;
    let pendingTotal = 0;
    let pendingLessons = 0;

    // Aggregation sonuçlarını işle
    stats.forEach((stat) => {
      totalLessons += stat.totalLessons;
      if (stat._id === 'ödendi') {
        paidTotal = stat.totalAmount;
      } else if (stat._id === 'ödenmedi') {
        pendingTotal = stat.totalAmount;
        pendingLessons = stat.totalLessons;
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalLessons,
          paidTotal,
          pendingTotal,
          pendingLessons,
        },
      },
    });
  } catch (err) {
    next(new AppError('İstatistikleriniz alınırken hata oluştu', 500));
  }
};
exports.getStudentStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const query = { ogrenci_id: id };
    if (startDate && endDate) {
      query.tarih = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const lessons = await Lesson.find(query);
    const stats = {
      totalLessons: lessons.length,
      totalEarnings: lessons
        .filter((l) => l.odeme_durumu === 'ödendi')
        .reduce((sum, l) => sum + l.ucret, 0),
      pendingTotal: lessons
        .filter((l) => l.odeme_durumu === 'ödenmedi')
        .reduce((sum, l) => sum + l.ucret, 0),
    };

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    next(new AppError('İstatistikler alınırken hata oluştu', 500));
  }
};