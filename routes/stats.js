const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware.protect, authMiddleware.restrictToTeacher, statsController.getStats);
router.get('/me', authMiddleware.protect, statsController.getMyStats);

module.exports = router;