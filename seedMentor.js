// seedMentor.js
const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function seedMentor() {
  await mongoose.connect(process.env.MONGO_URI);

  let mentor = await User.findOne({ email: "mentor@smarttestcenter.org" });
  if (!mentor) {
    mentor = new User({
      name: "Sample Mentor",
      email: "mentor@smarttestcenter.org",
      password: "mentor123", // will be hashed by pre-save
      role: "mentor",
    });
    await mentor.save();
    console.log("✅ Mentor created");
  } else {
    console.log("⚠️ Mentor already exists");
  }

  mongoose.disconnect();
}

seedMentor();