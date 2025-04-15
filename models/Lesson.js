const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  ogrenci_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Öğrenci ID zorunludur'],
  },
  tarih: {
    type: Date,
    required: [true, 'Tarih zorunludur'],
  },
  saat: {
    type: String,
    required: [true, 'Saat zorunludur'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçerli bir saat girin (HH:MM)'],
  },
  ucret: {
    type: Number,
    required: [true, 'Ücret zorunludur'],
    min: [0, 'Ücret negatif olamaz'],
  },
  odeme_durumu: {
    type: String,
    enum: ['ödendi', 'ödenmedi'],
    required: [true, 'Ödeme durumu zorunludur'],
    default: 'ödenmedi',
  },
});

module.exports = mongoose.model('Lesson', lessonSchema);