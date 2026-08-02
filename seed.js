const connectDB = require('./config/db');
const Student = require('./models/Student');
const Admin = require('./models/Admin');
const { initialStudents } = require('./utils/mockData');

const seedData = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('Skipping MongoDB database seed since MongoDB server is offline.');
    process.exit(0);
  }

  try {
    // 1. Seed Admin
    await Admin.deleteMany({});
    await Admin.create({
      name: 'UniverseByte SuperAdmin',
      email: 'admin@universebyte.in',
      password: 'admin123',
      role: 'SuperAdmin'
    });
    console.log('SuperAdmin account seeded (email: admin@universebyte.in, pass: admin123)');

    // 2. Seed Certificates / Students
    await Student.deleteMany({});
    await Student.insertMany(initialStudents);
    console.log(`Seeded ${initialStudents.length} student certificates successfully.`);

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
