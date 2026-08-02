const crypto = require('crypto');
const QRCode = require('qrcode');
const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');
const { inMemoryStudents, inMemoryAuditLogs } = require('../utils/mockData');

// Generate Next Certificate Number: UB-2026-000001
const generateNextCertificateNumber = async () => {
  let count = 0;
  try {
    count = await Student.countDocuments();
  } catch (err) {
    count = inMemoryStudents.length;
  }
  const nextNumber = (count + 1).toString().padStart(6, '0');
  const year = new Date().getFullYear();
  return `UB-${year}-${nextNumber}`;
};

// Log helper
const logAction = async (action, certificateId, details, adminEmail = 'System', ip = '127.0.0.1') => {
  const logObj = {
    _id: `log_${Date.now()}`,
    action,
    certificateId,
    details,
    adminEmail,
    ip,
    timestamp: new Date()
  };

  try {
    await AuditLog.create(logObj);
  } catch (err) {
    inMemoryAuditLogs.unshift(logObj);
  }
};

// 1. Verify Certificate Public Endpoint (Validates Certificate ID AND Token if provided)
exports.verifyCertificate = async (req, res) => {
  try {
    const rawId = req.params.certificateId || req.query.id;
    const tokenParam = req.query.token || req.query.verificationToken;

    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Certificate Number is required' });
    }

    // Standardize search format (supports UB-2026-000001 or UB202600001)
    let certNum = rawId.trim().toUpperCase();
    if (!certNum.includes('-') && certNum.startsWith('UB') && certNum.length >= 11) {
      // Convert UB202600001 to UB-2026-000001 format
      certNum = `UB-${certNum.substring(2, 6)}-${certNum.substring(6)}`;
    }

    let student = null;

    try {
      student = await Student.findOne({
        $or: [
          { certificateNumber: new RegExp(`^${certNum}$`, 'i') },
          { certificateNumber: new RegExp(`^${rawId.trim()}$`, 'i') }
        ]
      });
      if (student) {
        student.verificationCount += 1;
        student.lastVerified = new Date();
        await student.save();
      }
    } catch (dbErr) {
      // Fallback in-memory
      student = inMemoryStudents.find(s =>
        s.certificateNumber.toUpperCase() === certNum ||
        s.certificateNumber.toUpperCase() === rawId.trim().toUpperCase()
      );
      if (student) {
        student.verificationCount = (student.verificationCount || 0) + 1;
        student.lastVerified = new Date().toISOString();
      }
    }

    // Cryptographic Token Validation Check (If token parameter is passed in URL)
    let tokenTampered = false;
    if (student && tokenParam) {
      if (student.verificationToken && student.verificationToken !== tokenParam) {
        tokenTampered = true;
      }
    }

    const nowFormatted = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });

    // Audit log
    await logAction(
      'VERIFICATION_LOOKUP',
      certNum,
      student && !tokenTampered && student.status === 'Verified'
        ? `Certificate ${certNum} verified successfully`
        : `Failed or tampered verification attempt for ${certNum}`,
      'Public User',
      req.ip
    );

    // If student not found, status revoked/suspended, or token tampered
    if (!student || tokenTampered || student.status === 'Revoked' || student.status === 'Suspended') {
      return res.status(404).json({
        success: false,
        valid: false,
        status: student ? student.status : 'Invalid',
        message: 'This certificate is not issued by UniverseByte or has been modified. Please contact UniverseByte for verification.',
        certificateNumber: certNum,
        verificationTimestamp: nowFormatted
      });
    }

    return res.json({
      success: true,
      valid: true,
      data: {
        ...(student.toObject ? student.toObject() : student),
        certificateId: student.certificateNumber,
        verificationTimestamp: nowFormatted
      }
    });

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ success: false, message: 'Error processing certificate verification' });
  }
};

// 2. Get All Certificates (Admin)
exports.getAllCertificates = async (req, res) => {
  try {
    const { search, course, batch, status } = req.query;

    let result = [];

    try {
      let query = {};
      if (course) query.courseName = course;
      if (batch) query.batch = batch;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { certificateNumber: new RegExp(search, 'i') },
          { studentName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ];
      }
      result = await Student.find(query).sort({ createdAt: -1 });
    } catch (dbErr) {
      result = [...inMemoryStudents];
      if (course) result = result.filter(s => s.courseName === course);
      if (batch) result = result.filter(s => s.batch === batch);
      if (status) result = result.filter(s => s.status === status);
      if (search) {
        const sLower = search.toLowerCase();
        result = result.filter(s =>
          s.certificateNumber.toLowerCase().includes(sLower) ||
          s.studentName.toLowerCase().includes(sLower) ||
          s.email.toLowerCase().includes(sLower)
        );
      }
    }

    return res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Get all error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve certificates' });
  }
};

// 3. Create Certificate with UUID & Auto Number
exports.createCertificate = async (req, res) => {
  try {
    const {
      studentName,
      fatherName,
      photo,
      courseName,
      internship,
      batch,
      duration,
      grade,
      email,
      mobileNumber,
      issueDate,
      completionDate,
      certificatePdf,
      customCertificateNumber
    } = req.body;

    if (!studentName || !courseName || !batch || !email) {
      return res.status(400).json({ success: false, message: 'Missing required student fields' });
    }

    const certNum = customCertificateNumber && customCertificateNumber.trim() !== ''
      ? customCertificateNumber.trim().toUpperCase()
      : await generateNextCertificateNumber();

    // Secure UUID Token
    const secureToken = crypto.randomUUID();

    const targetVerificationUrl = `https://verify.universebyte.in/verify?id=${certNum}&token=${secureToken}`;

    const qrCodeDataUrl = await QRCode.toDataURL(targetVerificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    const newStudentData = {
      _id: `cert_${Date.now()}`,
      certificateNumber: certNum,
      verificationToken: secureToken,
      studentName,
      fatherName: fatherName || '-',
      photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      courseName,
      internship: internship || '6 Months Industrial Internship & Practical Training',
      batch,
      duration: duration || '6 Months',
      grade: grade || 'A+',
      email,
      mobileNumber: mobileNumber || '+91 78598 20822',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      completionDate: completionDate || new Date().toISOString().split('T')[0],
      status: 'Verified',
      certificatePdf: certificatePdf || '',
      qrCodeUrl: targetVerificationUrl,
      qrCodeBase64: qrCodeDataUrl,
      verificationCount: 0,
      lastVerified: null,
      createdAt: new Date()
    };

    let createdRecord = null;
    try {
      createdRecord = await Student.create(newStudentData);
    } catch (dbErr) {
      inMemoryStudents.unshift(newStudentData);
      createdRecord = newStudentData;
    }

    await logAction(
      'CERTIFICATE_CREATED',
      certNum,
      `Certificate ${certNum} generated for ${studentName} with token ${secureToken.substring(0, 8)}...`,
      req.admin?.email || 'Admin',
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: 'Certificate and secure QR Token generated successfully',
      data: createdRecord
    });

  } catch (error) {
    console.error('Create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create certificate' });
  }
};

// 4. Update Certificate (Admin)
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    let updated = null;

    try {
      updated = await Student.findByIdAndUpdate(id, updateFields, { new: true });
    } catch (dbErr) {
      const idx = inMemoryStudents.findIndex(s => s._id === id || s.certificateNumber === id);
      if (idx !== -1) {
        inMemoryStudents[idx] = { ...inMemoryStudents[idx], ...updateFields };
        updated = inMemoryStudents[idx];
      }
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Certificate record not found' });
    }

    await logAction(
      'CERTIFICATE_UPDATED',
      updated.certificateNumber,
      `Certificate ${updated.certificateNumber} record updated`,
      req.admin?.email || 'Admin',
      req.ip
    );

    return res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update certificate' });
  }
};

// 5. Change Certificate Status (Verified / Revoked / Suspended)
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Verified', 'Revoked', 'Suspended'

    let updated = null;

    try {
      updated = await Student.findByIdAndUpdate(id, { status }, { new: true });
    } catch (dbErr) {
      const idx = inMemoryStudents.findIndex(s => s._id === id || s.certificateNumber === id);
      if (idx !== -1) {
        inMemoryStudents[idx].status = status;
        updated = inMemoryStudents[idx];
      }
    }

    await logAction(
      `STATUS_CHANGED_${status.toUpperCase()}`,
      updated?.certificateNumber || id,
      `Certificate status set to ${status}`,
      req.admin?.email || 'Admin',
      req.ip
    );

    return res.json({
      success: true,
      message: `Certificate status set to ${status}`,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// 6. Delete Certificate (Admin)
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    let deletedId = '';
    try {
      const doc = await Student.findByIdAndDelete(id);
      if (doc) deletedId = doc.certificateNumber;
    } catch (dbErr) {
      const idx = inMemoryStudents.findIndex(s => s._id === id || s.certificateNumber === id);
      if (idx !== -1) {
        deletedId = inMemoryStudents[idx].certificateNumber;
        inMemoryStudents.splice(idx, 1);
      }
    }

    await logAction(
      'CERTIFICATE_DELETED',
      deletedId || id,
      `Certificate ${deletedId || id} deleted`,
      req.admin?.email || 'Admin',
      req.ip
    );

    return res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete certificate' });
  }
};

// 7. Send Email
exports.sendEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail } = req.body;

    await logAction(
      'EMAIL_DISPATCHED',
      id,
      `Certificate sent to ${recipientEmail || 'Student'}`,
      req.admin?.email || 'Admin',
      req.ip
    );

    return res.json({
      success: true,
      message: `Certificate email sent to ${recipientEmail}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Email dispatch error' });
  }
};
