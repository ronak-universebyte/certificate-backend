const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Mongo URI:", process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Connected");
    console.log("Host:", conn.connection.host);
    console.log("DB:", conn.connection.name);
  } catch (err) {
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error(err);
  }
};

module.exports = connectDB;
