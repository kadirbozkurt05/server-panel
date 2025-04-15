const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

router.get(
  '/students',
  authMiddleware.protect,
  authMiddleware.restrictToTeacher,
  userController.getStudents
);

router.patch('/update-password', authMiddleware.protect, userController.updatePassword);

router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.restrictToTeacher,
  userController.deleteUser
);

module.exports = router;