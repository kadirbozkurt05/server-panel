const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const lessonRoutes = require('./routes/lesson');
const statsRoutes = require('./routes/stats');
const errorHandler = require('./middlewares/error');
const https = require('https');
const fs = require('fs');
const express = require('express');
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/n8n.esmaogretmen.com/fullchain.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/n8n.esmaogretmen.com/privkey.pem')
};


// Çevre değişkenlerini yükle
dotenv.config();

const app = express();
const corsOptions = {
  origin: 'https://eo-panel.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('MongoDB bağlantı hatası:', err));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/stats', statsRoutes);

// Hata middleware'ı
app.use(errorHandler);

// Test endpoint'i
app.get('/', (req, res) => {
  res.json({ message: 'Öğretmen Paneli API çalışıyor!' });
});

// Server başlat
const PORT = process.env.PORT || 5000;
https.createServer(options, app).listen(5000, () => {
  console.log('HTTPS Server running on port 5000');
});
