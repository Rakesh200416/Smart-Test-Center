const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "mentor", "admin"], required: true },
    avatar: { type: String, default: "" },

    student: {
      contactNumber: { type: String },
      educationLevel: { type: String },
      institutionName: { type: String },
    },

    mentor: {
      phoneNumber: { type: String },
      currentInstitution: { type: String },
      experience: { type: String },
    },
  },
  { timestamps: true }
);

/* -------- Password Hash Middleware -------- */
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* -------- Compare Password -------- */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* -------- Safe JSON (no password) -------- */
UserSchema.methods.safe = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
