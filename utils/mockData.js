// Initial seed and in-memory data store fallback with secure UUID tokens

const initialStudents = [
  {
    _id: "cert_001",
    certificateNumber: "UB-2026-000001",
    verificationToken: "c7a8e9f0-1234-5678-9abc-def012345678",
    studentName: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    courseName: "Full Stack Web Development",
    internship: "6 Months Industrial Training & Internship",
    batch: "2025-B1",
    duration: "6 Months",
    grade: "A+",
    email: "aarav.sharma@example.com",
    mobileNumber: "+91 78598 20822",
    issueDate: "2026-01-15",
    completionDate: "2026-07-15",
    status: "Verified",
    certificatePdf: "",
    qrCodeUrl: "https://verify.universebyte.in/verify?id=UB-2026-000001&token=c7a8e9f0-1234-5678-9abc-def012345678",
    verificationCount: 24,
    lastVerified: new Date().toISOString(),
    createdAt: new Date("2026-01-15T10:00:00Z")
  },
  {
    _id: "cert_002",
    certificateNumber: "UB-2026-000002",
    verificationToken: "e8b9f0a1-2345-6789-abcd-ef0123456789",
    studentName: "Priya Patel",
    fatherName: "Suresh Patel",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    courseName: "Artificial Intelligence & Machine Learning",
    internship: "Advanced AI Project Internship",
    batch: "2025-B2",
    duration: "8 Months",
    grade: "Distinction",
    email: "priya.patel@example.com",
    mobileNumber: "+91 98123 45678",
    issueDate: "2026-02-20",
    completionDate: "2026-10-20",
    status: "Verified",
    certificatePdf: "",
    qrCodeUrl: "https://verify.universebyte.in/verify?id=UB-2026-000002&token=e8b9f0a1-2345-6789-abcd-ef0123456789",
    verificationCount: 18,
    lastVerified: new Date().toISOString(),
    createdAt: new Date("2026-02-20T10:00:00Z")
  },
  {
    _id: "cert_003",
    certificateNumber: "UB-2026-000003",
    verificationToken: "f9c0a1b2-3456-789a-bcde-f01234567890",
    studentName: "Rohan Verma",
    fatherName: "Anil Verma",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    courseName: "Cybersecurity & Ethical Hacking",
    internship: "Security Operations & Penetration Testing Training",
    batch: "2025-B3",
    duration: "6 Months",
    grade: "A",
    email: "rohan.verma@example.com",
    mobileNumber: "+91 97654 32109",
    issueDate: "2026-03-10",
    completionDate: "2026-09-10",
    status: "Verified",
    certificatePdf: "",
    qrCodeUrl: "https://verify.universebyte.in/verify?id=UB-2026-000003&token=f9c0a1b2-3456-789a-bcde-f01234567890",
    verificationCount: 9,
    lastVerified: new Date().toISOString(),
    createdAt: new Date("2026-03-10T10:00:00Z")
  }
];

const initialCourses = [
  "Full Stack Web Development",
  "Artificial Intelligence & Machine Learning",
  "Cybersecurity & Ethical Hacking",
  "Data Science & Analytics",
  "Cloud Computing & DevOps"
];

const initialAuditLogs = [
  {
    _id: "log_001",
    action: "VERIFICATION_LOOKUP",
    certificateId: "UB-2026-000001",
    details: "Certificate UB-2026-000001 verified via secure QR token",
    ip: "127.0.0.1",
    timestamp: new Date().toISOString()
  }
];

let inMemoryStudents = [...initialStudents];
let inMemoryAuditLogs = [...initialAuditLogs];

module.exports = {
  initialStudents,
  initialCourses,
  initialAuditLogs,
  inMemoryStudents,
  inMemoryAuditLogs
};
