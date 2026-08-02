const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    default: 'System'
  },
  certificateId: {
    type: String,
    default: '-'
  },
  details: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    default: '127.0.0.1'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
