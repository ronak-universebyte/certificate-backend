const express = require('express');
const router = express.Router();
const {
  verifyCertificate,
  getAllCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  changeStatus,
  sendEmail
} = require('../controllers/certificateController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route for scanning/entering certificate ID
router.get('/verify/:certificateId', verifyCertificate);
router.get('/verify', verifyCertificate);

// Protected Admin routes
router.get('/', verifyToken, getAllCertificates);
router.post('/', verifyToken, createCertificate);
router.put('/:id', verifyToken, updateCertificate);
router.patch('/:id/status', verifyToken, changeStatus);
router.delete('/:id', verifyToken, deleteCertificate);
router.post('/:id/send-email', verifyToken, sendEmail);

module.exports = router;
