const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  certificateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  verificationToken: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  fatherName: {
    type: String,
    default: '-'
  },
  photo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  internship: {
    type: String,
    default: '6 Months Industrial Internship & Practical Training'
  },
  batch: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    default: '6 Months'
  },
  issueDate: {
    type: String,
    required: true
  },
  completionDate: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    default: 'A+'
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  certificatePdf: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Verified', 'Revoked', 'Suspended'],
    default: 'Verified'
  },
  qrCodeUrl: {
    type: String
  },
  qrCodeBase64: {
    type: String,
    default: ''
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  lastVerified: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
