const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected");
    console.log("Host:", conn.connection.host);
    console.log("Database:", conn.connection.name);
  } catch (err) {
    console.error("MongoDB Error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
