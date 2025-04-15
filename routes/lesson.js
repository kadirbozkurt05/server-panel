const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const authMiddleware = require('../middlewares/auth');

// Öğretmen rotaları
router.use(authMiddleware.protect);
router
  .route('/')
  .get(authMiddleware.restrictToTeacher, lessonController.getAllLessons)
  .post(authMiddleware.restrictToTeacher, lessonController.createLesson);

router
  .route('/student/:id')
  .get(authMiddleware.restrictToTeacher, lessonController.getStudentLessons);

router
  .route('/:id')
  .patch(authMiddleware.restrictToTeacher, lessonController.updateLesson)
  .delete(authMiddleware.restrictToTeacher, lessonController.deleteLesson);

// Öğrenci rotası
router.get('/me', lessonController.getMyLessons);

module.exports = router;