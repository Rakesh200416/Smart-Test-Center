const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/stc-database");
    console.log("Connected to MongoDB");

    // Check if admin already exists
    let admin = await User.findOne({ email: "admin@stc.com", role: "admin" });
    
    if (!admin) {
      // Create new admin user
      admin = new User({
        name: "Admin User",
        email: "admin@stc.com",
        password: "admin123", // Will be hashed by pre-save middleware
        role: "admin",
      });
      
      await admin.save();
      console.log("✅ Admin user created successfully!");
      console.log("Email: admin@stc.com");
      console.log("Password: admin123");
    } else {
      console.log("⚠️ Admin user already exists");
      console.log("Email: admin@stc.com");
    }

    mongoose.disconnect();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

seedAdmin();